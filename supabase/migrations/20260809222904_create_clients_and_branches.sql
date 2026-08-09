CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.client_branches (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  address text,
  city text,
  state text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.clients FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
CREATE POLICY "Enable read access for all authenticated users" ON public.client_branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for admin users" ON public.client_branches FOR ALL TO authenticated USING ( (SELECT user_type FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'ADMIN' );
