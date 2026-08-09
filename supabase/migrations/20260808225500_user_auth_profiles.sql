CREATE TYPE public.user_profile_type AS ENUM ('CUSTOMER', 'AGENT', 'ADMIN');

CREATE TYPE public.agent_function_type AS ENUM ('DRIVER', 'SALESPERSON', 'WAREHOUSE');

CREATE TABLE public.user_profiles (
  id                     uuid                        DEFAULT gen_random_uuid() NOT NULL,
  auth_user_id           uuid                        NOT NULL,
  email                  text                        NOT NULL,
  first_name             text                        NOT NULL,
  last_name              text                        NOT NULL,
  phone                  text,
  avatar_path            text,
  identity_document_path text,
  user_type              public.user_profile_type    DEFAULT 'CUSTOMER'::public.user_profile_type NOT NULL,
  agent_function         public.agent_function_type,
  is_active              boolean                     DEFAULT true NOT NULL,
  created_by             uuid,
  created_at             timestamp with time zone    DEFAULT now() NOT NULL,
  updated_at             timestamp with time zone    DEFAULT now() NOT NULL,
  CONSTRAINT user_profiles_agent_function_check CHECK (
    (user_type = 'AGENT'::public.user_profile_type AND agent_function IS NOT NULL)
    OR
    (user_type <> 'AGENT'::public.user_profile_type AND agent_function IS NULL)
  ),
  CONSTRAINT user_profiles_email_check CHECK (email = lower(email)),
  CONSTRAINT user_profiles_first_name_check CHECK (length(trim(first_name)) > 0),
  CONSTRAINT user_profiles_last_name_check CHECK (length(trim(last_name)) > 0)
);

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_auth_user_id_unique UNIQUE (auth_user_id);

CREATE UNIQUE INDEX user_profiles_email_unique
  ON public.user_profiles (lower(email));

CREATE INDEX idx_user_profiles_auth_user_id
  ON public.user_profiles (auth_user_id);

CREATE INDEX idx_user_profiles_active_type
  ON public.user_profiles (is_active, user_type);

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_auth_user_id_fkey
  FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.current_user_is_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE auth_user_id = auth.uid()
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE auth_user_id = auth.uid()
      AND is_active = true
      AND user_type = 'ADMIN'::public.user_profile_type
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_user_type public.user_profile_type;
  requested_agent_function public.agent_function_type;
BEGIN
  requested_user_type :=
    CASE
      WHEN NEW.raw_user_meta_data->>'user_type' IN ('CUSTOMER', 'AGENT', 'ADMIN')
        THEN (NEW.raw_user_meta_data->>'user_type')::public.user_profile_type
      ELSE 'CUSTOMER'::public.user_profile_type
    END;

  requested_agent_function :=
    CASE
      WHEN requested_user_type = 'AGENT'::public.user_profile_type
        AND NEW.raw_user_meta_data->>'agent_function' IN ('DRIVER', 'SALESPERSON', 'WAREHOUSE')
        THEN (NEW.raw_user_meta_data->>'agent_function')::public.agent_function_type
      ELSE NULL
    END;

  INSERT INTO public.user_profiles (
    auth_user_id,
    email,
    first_name,
    last_name,
    user_type,
    agent_function,
    is_active
  )
  VALUES (
    NEW.id,
    lower(COALESCE(NEW.email, '')),
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), 'Pendiente'),
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), ''), 'Pendiente'),
    requested_user_type,
    requested_agent_function,
    true
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    email = lower(COALESCE(NEW.email, '')),
    updated_at = now()
  WHERE auth_user_id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_auth_user_email_updated();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.user_profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT EXECUTE ON FUNCTION public.current_user_is_active() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

CREATE POLICY user_profiles_select_own
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY user_profiles_select_admin
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY user_profiles_admin_insert
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY user_profiles_admin_update
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY user_profiles_admin_delete
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (public.current_user_is_admin());

DO $$
DECLARE
  table_record record;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> 'user_profiles'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    EXECUTE format('DROP POLICY IF EXISTS authenticated_active_access ON public.%I', table_record.tablename);
    EXECUTE format(
      'CREATE POLICY authenticated_active_access ON public.%I FOR ALL TO authenticated USING (public.current_user_is_active()) WITH CHECK (public.current_user_is_active())',
      table_record.tablename
    );
  END LOOP;
END $$;

DO $$
DECLARE
  view_record record;
BEGIN
  FOR view_record IN
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
  LOOP
    EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', view_record.table_name);
  END LOOP;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'user-avatars',
    'user-avatars',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'identity-documents',
    'identity-documents',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY admin_manage_user_avatars
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'user-avatars' AND public.current_user_is_admin())
  WITH CHECK (bucket_id = 'user-avatars' AND public.current_user_is_admin());

CREATE POLICY active_read_user_avatars
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'user-avatars' AND public.current_user_is_active());

CREATE POLICY admin_manage_identity_documents
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'identity-documents' AND public.current_user_is_admin())
  WITH CHECK (bucket_id = 'identity-documents' AND public.current_user_is_admin());
