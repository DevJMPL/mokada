
CREATE OR REPLACE VIEW public.inventory_available AS
 SELECT pi.id,
    pi.product_id,
    p.code AS product_code,
    p.name AS product_name,
    pb.name AS product_brand,
    pc.name AS product_category,
    pi.warehouse_id,
    w.code AS warehouse_code,
    w.name AS warehouse_name,
    pi.location_id,
    wl.code AS location_code,
    wl.name AS location_name,
    pi.quantity,
    pi.reserved_quantity,
    (pi.quantity - pi.reserved_quantity) AS available_quantity,
    pi.minimum_stock,
    pi.maximum_stock,
    pi.reorder_point,
        CASE
            WHEN ((pi.quantity - pi.reserved_quantity) <= (0)::numeric) THEN 'OUT_OF_STOCK'::text
            WHEN ((pi.reorder_point IS NOT NULL) AND ((pi.quantity - pi.reserved_quantity) <= pi.reorder_point)) THEN 'LOW_STOCK'::text
            ELSE 'AVAILABLE'::text
        END AS availability_status,
    p.image_url AS product_image
   FROM (((((public.product_inventory pi
     JOIN public.products p ON ((p.id = pi.product_id)))
     LEFT JOIN public.product_brands pb ON ((pb.id = p.brand_id)))
     LEFT JOIN public.product_categories pc ON ((pc.id = p.category_id)))
     JOIN public.warehouses w ON ((w.id = pi.warehouse_id)))
     LEFT JOIN public.warehouse_locations wl ON ((wl.id = pi.location_id)));
