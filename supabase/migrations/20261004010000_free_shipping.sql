-- Mokada does not charge shipping. Keep every order at zero so balances and
-- payment status are calculated only from the products in the order.
UPDATE public.sales_orders SET shipping_cost=0 WHERE shipping_cost IS DISTINCT FROM 0;

ALTER TABLE public.sales_orders
  ALTER COLUMN shipping_cost SET DEFAULT 0,
  ALTER COLUMN shipping_cost SET NOT NULL;

ALTER TABLE public.sales_orders
  DROP CONSTRAINT IF EXISTS sales_orders_free_shipping_check;

ALTER TABLE public.sales_orders
  ADD CONSTRAINT sales_orders_free_shipping_check CHECK (shipping_cost=0);

CREATE OR REPLACE FUNCTION public.mark_order_paid_manually(p_order_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_order public.sales_orders; v_due numeric;
BEGIN
  IF NOT public.is_inventory_admin() THEN RAISE EXCEPTION 'Solo administradores pueden marcar pagado manualmente'; END IF;
  SELECT * INTO v_order FROM public.sales_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.status='CANCELLED' THEN RAISE EXCEPTION 'Pedido no disponible'; END IF;
  v_due:=v_order.total_amount-COALESCE(v_order.amount_paid,0);
  IF v_due>0 THEN
    IF EXISTS(SELECT 1 FROM public.sales_order_payments WHERE order_id=p_order_id AND status='PENDING') THEN
      RAISE EXCEPTION 'Resuelve los pagos pendientes antes de marcar pagado manualmente';
    END IF;
    INSERT INTO public.sales_order_payments(order_id,amount,payment_method,status,created_by,approved_by,comments,is_manual_settlement)
      VALUES(p_order_id,v_due,'CASH','APPROVED',auth.uid(),auth.uid(),'Marcado pagado manualmente por administrador'||CASE WHEN v_order.warranty_return_id IS NOT NULL THEN ' (reposición por garantía, sin nuevo cobro)' ELSE '' END,true);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_order_paid_manually(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mark_order_paid_manually(uuid) TO authenticated;
