-- Add image_url to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;

-- Update product_search view to include image_url
DROP VIEW IF EXISTS public.product_search;

CREATE OR REPLACE VIEW public.product_search AS 
SELECT p.id,
    p.code,
    p.barcode,
    p.name,
    p.description,
    p.status,
    p.is_new,
    pb.name AS brand,
    pc.name AS category,
    COALESCE(array_agg(DISTINCT pr.reference) FILTER (WHERE (pr.reference IS NOT NULL)), ARRAY[]::character varying[]) AS "references",
    p.image_url
FROM (((public.products p
    LEFT JOIN public.product_brands pb ON ((pb.id = p.brand_id)))
    LEFT JOIN public.product_categories pc ON ((pc.id = p.category_id)))
    LEFT JOIN public.product_references pr ON ((pr.product_id = p.id)))
GROUP BY p.id, p.code, p.barcode, p.name, p.description, p.status, p.is_new, pb.name, pc.name, p.image_url;

GRANT ALL ON public.product_search TO anon;
GRANT ALL ON public.product_search TO authenticated;
GRANT ALL ON public.product_search TO service_role;

-- Create products bucket if it does not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for products bucket
-- Public read access
CREATE POLICY "Public read access on products bucket" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'products');

-- Authenticated users can insert/update/delete their own product images or any product image depending on business rules.
-- Since this is an admin/agent system, we'll allow authenticated users to manage files.
CREATE POLICY "Authenticated users can upload to products bucket"
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Authenticated users can update products bucket"
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can delete from products bucket"
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'products');


-- Update create_or_update_product_full RPC
CREATE OR REPLACE FUNCTION public.create_or_update_product_full(
  p_product_id uuid,
  p_code varchar,
  p_barcode varchar,
  p_name varchar,
  p_description text,
  p_brand_id uuid,
  p_category_id uuid,
  p_unit_of_measure_id uuid,
  p_status varchar,
  p_prices jsonb,
  p_inventory jsonb,
  p_fitments jsonb DEFAULT NULL,
  p_image_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_id uuid;
  v_price record;
  v_inv record;
  v_fit record;
BEGIN
  -- 1. Insert or Update Product
  IF p_product_id IS NULL THEN
    INSERT INTO public.products (
      code, barcode, name, description, brand_id, category_id, unit_of_measure_id, status, image_url
    ) VALUES (
      p_code, p_barcode, p_name, p_description, p_brand_id, p_category_id, p_unit_of_measure_id, COALESCE(p_status::public.product_status, 'ACTIVE'::public.product_status), p_image_url
    )
    RETURNING id INTO v_product_id;
  ELSE
    UPDATE public.products
    SET 
      code = COALESCE(p_code, code),
      barcode = p_barcode,
      name = COALESCE(p_name, name),
      description = p_description,
      brand_id = p_brand_id,
      category_id = p_category_id,
      unit_of_measure_id = p_unit_of_measure_id,
      status = COALESCE(p_status::public.product_status, status),
      image_url = p_image_url,
      updated_at = now()
    WHERE id = p_product_id
    RETURNING id INTO v_product_id;
    
    IF v_product_id IS NULL THEN
       RAISE EXCEPTION 'Product not found';
    END IF;
  END IF;

  -- 2. Process Prices
  IF p_prices IS NOT NULL THEN
    FOR v_price IN SELECT * FROM jsonb_to_recordset(p_prices) AS x(price_list_id uuid, amount numeric)
    LOOP
      INSERT INTO public.product_prices (product_id, price_list_id, amount, valid_from)
      VALUES (v_product_id, v_price.price_list_id, v_price.amount, now())
      ON CONFLICT (product_id, price_list_id) WHERE valid_to IS NULL
      DO UPDATE SET amount = EXCLUDED.amount, updated_at = now();
    END LOOP;
  END IF;

  -- 3. Process Inventory Limits
  IF p_inventory IS NOT NULL THEN
    FOR v_inv IN SELECT * FROM jsonb_to_recordset(p_inventory) AS x(warehouse_id uuid, minimum_stock numeric, maximum_stock numeric)
    LOOP
      IF EXISTS (SELECT 1 FROM public.product_inventory WHERE product_id = v_product_id AND warehouse_id = v_inv.warehouse_id AND location_id IS NULL) THEN
        UPDATE public.product_inventory
        SET minimum_stock = v_inv.minimum_stock, maximum_stock = v_inv.maximum_stock, updated_at = now()
        WHERE product_id = v_product_id AND warehouse_id = v_inv.warehouse_id AND location_id IS NULL;
      ELSE
        INSERT INTO public.product_inventory (product_id, warehouse_id, minimum_stock, maximum_stock, quantity)
        VALUES (v_product_id, v_inv.warehouse_id, COALESCE(v_inv.minimum_stock, 0), v_inv.maximum_stock, 0);
      END IF;
    END LOOP;
  END IF;

  -- 4. Process Fitments
  IF p_fitments IS NOT NULL THEN
    -- Delete all existing fitments for this product to replace them cleanly
    DELETE FROM public.product_fitments WHERE product_id = v_product_id;
    
    -- Insert new fitments
    FOR v_fit IN SELECT * FROM jsonb_to_recordset(p_fitments) AS x(
      vehicle_model_id uuid,
      year_from smallint,
      year_to smallint,
      engine varchar,
      notes text
    )
    LOOP
      INSERT INTO public.product_fitments (
        product_id, vehicle_model_id, year_from, year_to, engine, notes
      ) VALUES (
        v_product_id, v_fit.vehicle_model_id, v_fit.year_from, v_fit.year_to, v_fit.engine, v_fit.notes
      );
    END LOOP;
  END IF;

  RETURN v_product_id;
END;
$$;
