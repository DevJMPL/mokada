-- Transfers from the purchase warehouse use its current average cost. This
-- keeps the upstream margin at zero and guarantees a usable sales cost.
CREATE OR REPLACE FUNCTION public.save_inventory_transfer(p_payload jsonb, p_transfer_id uuid DEFAULT NULL)
RETURNS public.inventory_transfers LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_transfer public.inventory_transfers;
  v_item record;
  v_source uuid := (p_payload->>'source_warehouse_id')::uuid;
  v_destination uuid := (p_payload->>'destination_warehouse_id')::uuid;
  v_available numeric;
  v_average_cost numeric;
  v_original_average_cost numeric;
  v_product_name text;
BEGIN
  IF NOT public.is_inventory_admin() THEN RAISE EXCEPTION 'Solo administradores pueden guardar traspasos'; END IF;
  IF v_source IS NULL OR v_destination IS NULL OR v_source=v_destination THEN RAISE EXCEPTION 'Selecciona dos almacenes diferentes'; END IF;
  IF jsonb_typeof(p_payload->'items') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Agrega productos al traspaso'; END IF;
  IF jsonb_array_length(p_payload->'items')=0 THEN RAISE EXCEPTION 'Agrega productos al traspaso'; END IF;
  IF p_transfer_id IS NOT NULL THEN
    SELECT * INTO v_transfer FROM public.inventory_transfers WHERE id=p_transfer_id FOR UPDATE;
    IF NOT FOUND OR v_transfer.status<>'DRAFT' THEN RAISE EXCEPTION 'Solo se pueden editar traspasos en borrador'; END IF;
  END IF;
  PERFORM 1 FROM public.warehouses WHERE id IN(v_source,v_destination) ORDER BY id FOR UPDATE;
  IF (SELECT count(*) FROM public.warehouses WHERE id IN(v_source,v_destination) AND is_active)<>2
    OR (SELECT warehouse_role FROM public.warehouses WHERE id=v_source) IS DISTINCT FROM 'PURCHASE'
    OR (SELECT warehouse_role FROM public.warehouses WHERE id=v_destination) IS DISTINCT FROM 'SALES' THEN
    RAISE EXCEPTION 'El traspaso debe ir del almacén de compras al de ventas';
  END IF;
  IF (SELECT count(*) FROM jsonb_to_recordset(p_payload->'items') AS x(product_id uuid)) <>
     (SELECT count(DISTINCT product_id) FROM jsonb_to_recordset(p_payload->'items') AS x(product_id uuid)) THEN
    RAISE EXCEPTION 'Agrupa los productos repetidos en una sola partida';
  END IF;
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_payload->'items') AS x(product_id uuid,quantity numeric) ORDER BY product_id LOOP
    IF v_item.quantity IS NULL OR v_item.quantity<=0 OR v_item.quantity::text IN('NaN','Infinity','-Infinity') THEN
      RAISE EXCEPTION 'Cantidad inválida';
    END IF;
    SELECT code||': '||name INTO v_product_name FROM public.products WHERE id=v_item.product_id AND status='ACTIVE';
    IF NOT FOUND THEN RAISE EXCEPTION 'Selecciona productos activos'; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(v_item.product_id::text||v_source::text,0));
    SELECT i.quantity-i.reserved_quantity,c.average_cost,c.original_average_cost
      INTO v_available,v_average_cost,v_original_average_cost
    FROM public.product_inventory i LEFT JOIN public.inventory_costs c ON c.inventory_id=i.id
    WHERE i.product_id=v_item.product_id AND i.warehouse_id=v_source AND i.location_id IS NULL FOR UPDATE OF i;
    IF COALESCE(v_available,0)<v_item.quantity THEN
      RAISE EXCEPTION 'Disponible insuficiente para %. Disponible: %, solicitado: %',v_product_name,COALESCE(v_available,0),v_item.quantity;
    END IF;
    IF v_average_cost IS NULL OR v_original_average_cost IS NULL THEN
      RAISE EXCEPTION 'Falta costo en el almacén de compras para %. Configura sus costos antes del traspaso',v_product_name;
    END IF;
  END LOOP;
  IF p_transfer_id IS NULL THEN
    INSERT INTO public.inventory_transfers(transfer_number,source_warehouse_id,destination_warehouse_id,notes,created_by)
      VALUES(COALESCE(NULLIF(p_payload->>'transfer_number',''),'TR-'||gen_random_uuid()::text),v_source,v_destination,p_payload->>'notes',auth.uid())
      RETURNING * INTO v_transfer;
  ELSE
    UPDATE public.inventory_transfers SET source_warehouse_id=v_source,destination_warehouse_id=v_destination,notes=p_payload->>'notes'
      WHERE id=p_transfer_id RETURNING * INTO v_transfer;
    DELETE FROM public.inventory_transfer_items WHERE transfer_id=p_transfer_id;
  END IF;
  INSERT INTO public.inventory_transfer_items(transfer_id,product_id,quantity,unit_price)
    SELECT v_transfer.id,x.product_id,x.quantity,c.average_cost
    FROM jsonb_to_recordset(p_payload->'items') AS x(product_id uuid,quantity numeric)
    JOIN public.product_inventory i ON i.product_id=x.product_id AND i.warehouse_id=v_source AND i.location_id IS NULL
    JOIN public.inventory_costs c ON c.inventory_id=i.id;
  RETURN v_transfer;
END;
$$;

REVOKE ALL ON FUNCTION public.save_inventory_transfer(jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_inventory_transfer(jsonb,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.process_inventory_transfer(p_transfer_id uuid, p_created_by uuid DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_transfer public.inventory_transfers;
  v_item record;
  v_cost public.inventory_costs;
  v_destination_id uuid;
  v_destination_quantity numeric;
  v_destination_average numeric;
  v_destination_original numeric;
  v_product_name text;
  v_source_name text;
  v_available numeric;
BEGIN
  IF NOT public.is_inventory_admin() THEN RAISE EXCEPTION 'Solo administradores pueden completar traspasos'; END IF;
  SELECT * INTO v_transfer FROM public.inventory_transfers WHERE id=p_transfer_id FOR UPDATE;
  IF NOT FOUND OR v_transfer.status<>'DRAFT' THEN RAISE EXCEPTION 'El traspaso debe estar en borrador'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.inventory_transfer_items WHERE transfer_id=p_transfer_id) THEN RAISE EXCEPTION 'Traspaso vacío'; END IF;
  PERFORM 1 FROM public.warehouses WHERE id IN(v_transfer.source_warehouse_id,v_transfer.destination_warehouse_id) ORDER BY id FOR UPDATE;
  IF (SELECT count(*) FROM public.warehouses WHERE id IN(v_transfer.source_warehouse_id,v_transfer.destination_warehouse_id) AND is_active)<>2
    OR (SELECT warehouse_role FROM public.warehouses WHERE id=v_transfer.source_warehouse_id) IS DISTINCT FROM 'PURCHASE'
    OR (SELECT warehouse_role FROM public.warehouses WHERE id=v_transfer.destination_warehouse_id) IS DISTINCT FROM 'SALES' THEN
    RAISE EXCEPTION 'El traspaso debe ir del almacén de compras al de ventas';
  END IF;
  SELECT name INTO v_source_name FROM public.warehouses WHERE id=v_transfer.source_warehouse_id;
  FOR v_item IN SELECT * FROM public.inventory_transfer_items WHERE transfer_id=p_transfer_id ORDER BY product_id LOOP
    PERFORM pg_advisory_xact_lock(hashtextextended(v_item.product_id::text||v_transfer.source_warehouse_id::text,0));
    PERFORM pg_advisory_xact_lock(hashtextextended(v_item.product_id::text||v_transfer.destination_warehouse_id::text,0));
    SELECT code||': '||name INTO v_product_name FROM public.products WHERE id=v_item.product_id;
    SELECT quantity-reserved_quantity INTO v_available FROM public.product_inventory
      WHERE product_id=v_item.product_id AND warehouse_id=v_transfer.source_warehouse_id AND location_id IS NULL FOR UPDATE;
    IF COALESCE(v_available,0)<v_item.quantity THEN
      RAISE EXCEPTION 'Disponible insuficiente para % en %. Disponible: %, solicitado: %',v_product_name,v_source_name,COALESCE(v_available,0),v_item.quantity;
    END IF;
    SELECT c.* INTO v_cost FROM public.inventory_costs c JOIN public.product_inventory i ON i.id=c.inventory_id
      WHERE i.product_id=v_item.product_id AND i.warehouse_id=v_transfer.source_warehouse_id AND i.location_id IS NULL;
    IF v_cost.original_average_cost IS NULL OR v_cost.average_cost IS NULL THEN
      RAISE EXCEPTION 'Falta costo en % para %. Configura los costos antes del traspaso',v_source_name,v_product_name;
    END IF;

    v_destination_id := NULL;
    v_destination_quantity := NULL;
    v_destination_average := NULL;
    v_destination_original := NULL;
    SELECT i.id,i.quantity,c.average_cost,c.original_average_cost
      INTO v_destination_id,v_destination_quantity,v_destination_average,v_destination_original
    FROM public.product_inventory i LEFT JOIN public.inventory_costs c ON c.inventory_id=i.id
    WHERE i.product_id=v_item.product_id AND i.warehouse_id=v_transfer.destination_warehouse_id AND i.location_id IS NULL FOR UPDATE OF i;
    IF v_destination_id IS NOT NULL AND v_destination_quantity>0
      AND (v_destination_average IS NULL OR v_destination_original IS NULL) THEN
      INSERT INTO public.inventory_costs(inventory_id,average_cost,original_average_cost)
        VALUES(v_destination_id,v_cost.average_cost,v_cost.original_average_cost)
      ON CONFLICT(inventory_id) DO UPDATE SET
        average_cost=COALESCE(inventory_costs.average_cost,EXCLUDED.average_cost),
        original_average_cost=COALESCE(inventory_costs.original_average_cost,EXCLUDED.original_average_cost);
    END IF;

    UPDATE public.inventory_transfer_items SET unit_price=v_cost.average_cost WHERE id=v_item.id;
    INSERT INTO public.inventory_movements(product_id,warehouse_id,movement_type,quantity,unit_cost,original_unit_cost,reference_type,reference_id,created_by)
      VALUES(v_item.product_id,v_transfer.source_warehouse_id,'TRANSFER_OUT',v_item.quantity,v_cost.average_cost,v_cost.original_average_cost,'inventory_transfer',p_transfer_id,auth.uid());
    INSERT INTO public.inventory_movements(product_id,warehouse_id,movement_type,quantity,unit_cost,original_unit_cost,reference_type,reference_id,created_by)
      VALUES(v_item.product_id,v_transfer.destination_warehouse_id,'TRANSFER_IN',v_item.quantity,v_cost.average_cost,v_cost.original_average_cost,'inventory_transfer',p_transfer_id,auth.uid());
  END LOOP;
  UPDATE public.inventory_transfers SET status='COMPLETED',completed_at=now() WHERE id=p_transfer_id;
  RETURN true;
END;
$$;

-- Complete missing sales-warehouse costs when the same product already has a
-- valid purchase-warehouse cost. Existing configured costs are preserved.
INSERT INTO public.inventory_costs(inventory_id,average_cost,original_average_cost)
SELECT destination.id,source_cost.average_cost,source_cost.original_average_cost
FROM public.product_inventory destination
JOIN public.warehouses destination_warehouse
  ON destination_warehouse.id=destination.warehouse_id AND destination_warehouse.warehouse_role='SALES'
JOIN LATERAL (
  SELECT costs.average_cost,costs.original_average_cost
  FROM public.product_inventory source
  JOIN public.warehouses source_warehouse
    ON source_warehouse.id=source.warehouse_id AND source_warehouse.warehouse_role='PURCHASE'
  JOIN public.inventory_costs costs ON costs.inventory_id=source.id
  WHERE source.product_id=destination.product_id AND source.location_id IS NULL
    AND costs.average_cost IS NOT NULL AND costs.original_average_cost IS NOT NULL
  ORDER BY source.quantity DESC,source.id
  LIMIT 1
) source_cost ON true
LEFT JOIN public.inventory_costs current_cost ON current_cost.inventory_id=destination.id
WHERE destination.location_id IS NULL AND destination.quantity>0
  AND (current_cost.average_cost IS NULL OR current_cost.original_average_cost IS NULL)
ON CONFLICT(inventory_id) DO UPDATE SET
  average_cost=COALESCE(inventory_costs.average_cost,EXCLUDED.average_cost),
  original_average_cost=COALESCE(inventory_costs.original_average_cost,EXCLUDED.original_average_cost);

-- Normalize old drafts so their visible price matches the rule before they are completed.
UPDATE public.inventory_transfer_items item
SET unit_price=costs.average_cost
FROM public.inventory_transfers transfer,public.product_inventory source,public.inventory_costs costs
WHERE item.transfer_id=transfer.id AND transfer.status='DRAFT'
  AND source.product_id=item.product_id AND source.warehouse_id=transfer.source_warehouse_id AND source.location_id IS NULL
  AND costs.inventory_id=source.id AND costs.average_cost IS NOT NULL;
