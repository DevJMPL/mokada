-- Datos iniciales (Seed) de configuración para Mokada
-- Este archivo inserta datos obligatorios para inicializar el sistema de forma idempotente

-- 1. Unidades de Medida
INSERT INTO public.units_of_measure (id, code, name, allows_decimals)
VALUES
  (gen_random_uuid(), 'PCS', 'Pieza', false),
  (gen_random_uuid(), 'KIT', 'Kit', false),
  (gen_random_uuid(), 'SET', 'Juego', false),
  (gen_random_uuid(), 'LTR', 'Litro', true),
  (gen_random_uuid(), 'MTR', 'Metro', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Listas de Precio
INSERT INTO public.price_lists (id, code, name, discount_percentage, currency, is_active)
VALUES
  (gen_random_uuid(), 'PUBLIC', 'Precio público', 0, 'MXN', true),
  (gen_random_uuid(), 'DISCOUNT_10', 'Descuento 10%', 10, 'MXN', true),
  (gen_random_uuid(), 'DISCOUNT_20', 'Descuento 20%', 20, 'MXN', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Atributos Definidos
INSERT INTO public.attribute_definitions (id, code, name, data_type, is_active)
VALUES
  (gen_random_uuid(), 'ABS', 'ABS', 'BOOLEAN', true),
  (gen_random_uuid(), 'STUD_COUNT', 'STUD_COUNT', 'INTEGER', true),
  (gen_random_uuid(), 'TOOTH_COUNT', 'TOOTH_COUNT', 'INTEGER', true),
  (gen_random_uuid(), 'CABLE_COUNT', 'CABLE_COUNT', 'INTEGER', true),
  (gen_random_uuid(), 'SIDE', 'SIDE', 'STRING', true),
  (gen_random_uuid(), 'POSITION', 'POSITION', 'STRING', true),
  (gen_random_uuid(), 'TYPE', 'TYPE', 'STRING', true),
  (gen_random_uuid(), 'DIAMETER', 'DIAMETER', 'DECIMAL', true)
ON CONFLICT (code) DO NOTHING;

-- 4. Almacenes (Warehouse principal)
INSERT INTO public.warehouses (id, code, name, is_active)
VALUES
  (gen_random_uuid(), 'MAIN', 'Almacén principal', true)
ON CONFLICT (code) DO NOTHING;
