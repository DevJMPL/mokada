-- supabase/migrations/20260928000002_cleanup_unused_routes.sql

-- Desactivamos todas las rutas que no contengan los nombres de las rutas principales
-- Es mejor desactivar (is_active = false) que eliminar (DELETE) para evitar romper 
-- historiales de viajes (route_trips) o sucursales (customer_branches) que ya estén ligados.

UPDATE public.routes
SET is_active = false
WHERE name NOT ILIKE '%Orizaba%'
  AND name NOT ILIKE '%Oaxaca%'
  AND name NOT ILIKE '%Tulancingo%'
  AND name NOT ILIKE '%Xalapa%'
  AND name NOT ILIKE '%Huejutla%'
  AND name NOT ILIKE '%Actopan%'
  AND name NOT ILIKE '%Tepeji%'
  AND name NOT ILIKE '%Coatzacoalcos%'
  AND name NOT ILIKE '%Tizayuca%';
