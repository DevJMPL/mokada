ALTER TABLE public.routes ADD COLUMN sequence_order integer DEFAULT 0 NOT NULL;
ALTER TABLE public.routes ADD COLUMN default_vehicle_id uuid REFERENCES public.fleet_vehicles(id);
