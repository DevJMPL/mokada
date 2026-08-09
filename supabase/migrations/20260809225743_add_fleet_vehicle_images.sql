-- Add image_url column to fleet_vehicles
ALTER TABLE public.fleet_vehicles ADD COLUMN image_url text;

-- Create fleet-vehicles storage bucket (public for images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fleet-vehicles', 'fleet-vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read access on fleet-vehicles bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fleet-vehicles');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload to fleet-vehicles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fleet-vehicles');

-- Authenticated users can update
CREATE POLICY "Authenticated users can update fleet-vehicles"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'fleet-vehicles');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete fleet-vehicles"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fleet-vehicles');
