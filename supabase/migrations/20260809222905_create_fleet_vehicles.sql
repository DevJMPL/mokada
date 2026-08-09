CREATE TYPE public.vehicle_status_type AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'OUT_OF_SERVICE', 'INACTIVE');

CREATE TABLE public.fleet_vehicles (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  internal_code text NOT NULL UNIQUE,
  plate_number text,
  vin text,
  brand text,
  model text,
  year integer,
  color text,
  vehicle_type text,
  fuel_type text,
  transmission text,
  engine text,
  mileage numeric DEFAULT 0,
  status public.vehicle_status_type DEFAULT 'AVAILABLE' NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON public.fleet_vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.fleet_vehicles FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
