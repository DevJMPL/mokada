ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_agent_function_check;

ALTER TABLE public.user_profiles
  ADD COLUMN agent_functions public.agent_function_type[] NOT NULL DEFAULT ARRAY[]::public.agent_function_type[];

UPDATE public.user_profiles
SET agent_functions =
  CASE
    WHEN agent_function IS NULL THEN ARRAY[]::public.agent_function_type[]
    ELSE ARRAY[agent_function]
  END;

ALTER TABLE public.user_profiles
  DROP COLUMN agent_function;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_agent_functions_check CHECK (
    (
      user_type = 'AGENT'::public.user_profile_type
      AND cardinality(agent_functions) > 0
    )
    OR
    (
      user_type <> 'AGENT'::public.user_profile_type
      AND cardinality(agent_functions) = 0
    )
  );

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_user_type public.user_profile_type;
  requested_agent_functions public.agent_function_type[];
BEGIN
  requested_user_type :=
    CASE
      WHEN NEW.raw_user_meta_data->>'user_type' IN ('CUSTOMER', 'AGENT', 'ADMIN')
        THEN (NEW.raw_user_meta_data->>'user_type')::public.user_profile_type
      ELSE 'CUSTOMER'::public.user_profile_type
    END;

  requested_agent_functions := ARRAY[]::public.agent_function_type[];

  IF requested_user_type = 'AGENT'::public.user_profile_type THEN
    SELECT COALESCE(array_agg(DISTINCT value::public.agent_function_type), ARRAY[]::public.agent_function_type[])
    INTO requested_agent_functions
    FROM jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(NEW.raw_user_meta_data->'agent_functions') = 'array'
          THEN NEW.raw_user_meta_data->'agent_functions'
        WHEN NEW.raw_user_meta_data->>'agent_function' IN ('DRIVER', 'SALESPERSON', 'WAREHOUSE')
          THEN jsonb_build_array(NEW.raw_user_meta_data->>'agent_function')
        ELSE '[]'::jsonb
      END
    ) AS agent_function_item(value)
    WHERE value IN ('DRIVER', 'SALESPERSON', 'WAREHOUSE');
  END IF;

  INSERT INTO public.user_profiles (
    auth_user_id,
    email,
    first_name,
    last_name,
    user_type,
    agent_functions,
    is_active
  )
  VALUES (
    NEW.id,
    lower(COALESCE(NEW.email, '')),
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), 'Pendiente'),
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), ''), 'Pendiente'),
    requested_user_type,
    requested_agent_functions,
    true
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$;
