CREATE TABLE public.agent_route_assignments (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  sequence_order integer NOT NULL DEFAULT 0,
  default_vehicle_id uuid REFERENCES public.fleet_vehicles(id),
  default_budget_amount numeric DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.agent_route_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage agent route assignments" ON public.agent_route_assignments 
FOR ALL TO authenticated 
USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );

CREATE POLICY "Agents can read own assignments" ON public.agent_route_assignments 
FOR SELECT TO authenticated 
USING ( agent_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) );
