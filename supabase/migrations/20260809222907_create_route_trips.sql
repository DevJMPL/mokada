CREATE TYPE public.route_trip_status_type AS ENUM ('PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'UNDER_REVIEW', 'SETTLED', 'CANCELLED');

CREATE TABLE public.route_trips (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  route_id uuid NOT NULL REFERENCES public.routes(id),
  agent_id uuid NOT NULL REFERENCES public.user_profiles(id),
  vehicle_id uuid REFERENCES public.fleet_vehicles(id),
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  budget_amount numeric DEFAULT 0 NOT NULL,
  status public.route_trip_status_type DEFAULT 'PLANNED' NOT NULL,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  starting_mileage numeric,
  ending_mileage numeric,
  notes text,
  created_by uuid REFERENCES public.user_profiles(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.route_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can read their own trips" ON public.route_trips FOR SELECT TO authenticated USING ( agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
CREATE POLICY "Agents can update their own trips" ON public.route_trips FOR UPDATE TO authenticated USING ( agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
CREATE POLICY "Admin can insert trips" ON public.route_trips FOR INSERT TO authenticated WITH CHECK ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
CREATE POLICY "Admin can delete trips" ON public.route_trips FOR DELETE TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
