-- Migration: Check stock transfer
-- Description: Add strict validation to prevent transferring more stock than available.

CREATE OR REPLACE FUNCTION public.process_inventory_transfer(
  p_transfer_id uuid,
  p_created_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transfer record;
  v_item record;
  v_available numeric;
  v_product_name text;
BEGIN
  -- Get transfer details
  SELECT * INTO v_transfer FROM public.inventory_transfers WHERE id = p_transfer_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer not found';
  END IF;

  IF v_transfer.status = 'COMPLETED' THEN
    RAISE EXCEPTION 'Transfer is already completed';
  END IF;

  -- Loop through items
  FOR v_item IN SELECT * FROM public.inventory_transfer_items WHERE transfer_id = p_transfer_id
  LOOP
    -- CHECK STOCK FOR SOURCE WAREHOUSE
    SELECT COALESCE(SUM(quantity), 0) INTO v_available
    FROM public.product_inventory
    WHERE product_id = v_item.product_id AND warehouse_id = v_transfer.source_warehouse_id AND location_id IS NULL;

    IF v_available < v_item.quantity THEN
      -- Try to get product name for better error
      SELECT name INTO v_product_name FROM public.products WHERE id = v_item.product_id;
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente inventario de "%" en el almacén de origen. Disponible: %, Solicitado: %', v_product_name, v_available, v_item.quantity;
    END IF;

    -- 1. Transfer Out (Source Warehouse)
    PERFORM public.process_inventory_movement(
      v_item.product_id,
      v_transfer.source_warehouse_id,
      'TRANSFER_OUT'::public.inventory_movement_type,
      v_item.quantity,
      'inventory_transfer',
      v_transfer.id,
      'Traspaso a ' || v_transfer.destination_warehouse_id,
      p_created_by
    );

    -- 2. Transfer In (Destination Warehouse)
    PERFORM public.process_inventory_movement(
      v_item.product_id,
      v_transfer.destination_warehouse_id,
      'TRANSFER_IN'::public.inventory_movement_type,
      v_item.quantity,
      'inventory_transfer',
      v_transfer.id,
      'Traspaso desde ' || v_transfer.source_warehouse_id,
      p_created_by
    );
  END LOOP;

  -- Mark transfer as completed
  UPDATE public.inventory_transfers
  SET status = 'COMPLETED', completed_at = now()
  WHERE id = p_transfer_id;

  RETURN true;
END;
$$;
