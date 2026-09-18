BEGIN;
DO $$
DECLARE v_admin uuid; v_customer uuid; v_branch uuid;
 v_product uuid:=gen_random_uuid(); v_warehouse uuid:=gen_random_uuid(); v_list uuid:=gen_random_uuid();
 v_profile uuid:=gen_random_uuid(); v_second uuid:=gen_random_uuid(); v_order public.sales_orders;
 v_suffix text:=substr(gen_random_uuid()::text,1,8); v_snapshot jsonb; v_payload jsonb;
BEGIN
 SELECT auth_user_id INTO v_admin FROM public.user_profiles WHERE user_type='ADMIN' AND is_active LIMIT 1;
 SELECT customer_id,id INTO v_customer,v_branch FROM public.customer_branches LIMIT 1;
 IF v_admin IS NULL OR v_branch IS NULL THEN RAISE EXCEPTION 'Missing administrator/customer branch'; END IF;
 PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
 INSERT INTO public.warehouses(id,code,name) VALUES(v_warehouse,'QA-I-'||v_suffix,'QA Invoice');
 INSERT INTO public.products(id,code,name) VALUES(v_product,'QA-I-'||v_suffix,'QA Invoice product');
 INSERT INTO public.price_lists(id,code,name) VALUES(v_list,'QA-I-'||v_suffix,'QA Invoice prices');
 INSERT INTO public.product_prices(product_id,price_list_id,amount) VALUES(v_product,v_list,100);
 INSERT INTO public.customer_fiscal_profiles(id,customer_id,rfc,legal_name,tax_regime,cfdi_use,fiscal_zip_code,billing_email)
 VALUES(v_profile,v_customer,'QA'||upper(v_suffix)||'AAA','QA First','601','G03','42000','qa-first@test.local'),
 (v_second,v_customer,'QA'||upper(v_suffix)||'BBB','QA Selected','601','G03','42001','qa-selected@test.local');
 v_payload:=jsonb_build_object('customer_id',v_customer,'branch_id',v_branch,'warehouse_id',v_warehouse,'price_list_id',v_list,
 'requires_invoice',true,'fiscal_profile_id',v_second,'invoice_payment_form','TRANSFER',
 'items',jsonb_build_array(jsonb_build_object('product_id',v_product,'quantity',1,'unit_price',100)));
 v_order:=public.create_priced_order(v_payload);
 IF v_order.invoice_details->>'legal_name'<>'QA Selected' OR v_order.invoice_details->>'issuer_zip_code'<>'42186'
 OR v_order.invoice_details->>'payment_form'<>'TRANSFER' THEN RAISE EXCEPTION 'Incorrect invoice snapshot'; END IF;
 v_snapshot:=v_order.invoice_details;
 UPDATE public.customer_fiscal_profiles SET legal_name='QA Edited later' WHERE id=v_second;
 UPDATE public.sales_orders SET admin_comments='QA preserve snapshot' WHERE id=v_order.id;
 IF (SELECT invoice_details FROM public.sales_orders WHERE id=v_order.id) IS DISTINCT FROM v_snapshot THEN RAISE EXCEPTION 'Snapshot changed'; END IF;
 UPDATE public.customer_fiscal_profiles SET is_active=false WHERE id=v_second;
 BEGIN
  PERFORM public.create_priced_order(v_payload);
  RAISE EXCEPTION 'Inactive profile accepted';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM NOT LIKE '%perfil fiscal activo%' THEN RAISE; END IF;
 END;
 IF (SELECT count(*) FROM public.sales_orders WHERE warehouse_id=v_warehouse)<>1 THEN RAISE EXCEPTION 'Failed invoice left an order'; END IF;
END;
$$;
ROLLBACK;
SELECT 'PASS: invoice selection, fixed issuer ZIP, historical snapshot, inactive profile rejection and atomic rollback' AS result;
