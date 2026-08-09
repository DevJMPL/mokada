CREATE TABLE public.routes (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  estimated_days integer,
  default_weekly_budget numeric DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.route_states (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  state_code text NOT NULL,
  sequence integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (route_id, state_code)
);

CREATE TABLE public.route_stops (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.client_branches(id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  estimated_arrival_time time,
  estimated_duration_minutes integer,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (route_id, branch_id)
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.routes FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
CREATE POLICY "Enable read access for all authenticated users" ON public.route_states FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.route_states FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
CREATE POLICY "Enable read access for all authenticated users" ON public.route_stops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.route_stops FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
