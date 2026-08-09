CREATE OR REPLACE FUNCTION public.current_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.user_profiles
  WHERE auth_user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_current_user_avatar(next_avatar_path text)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_profile public.user_profiles;
  active_profile_id uuid;
  clean_avatar_path text;
BEGIN
  active_profile_id := public.current_user_profile_id();
  clean_avatar_path := NULLIF(trim(next_avatar_path), '');

  IF active_profile_id IS NULL THEN
    RAISE EXCEPTION 'No se encontro un perfil activo para actualizar.';
  END IF;

  IF clean_avatar_path IS NOT NULL AND split_part(clean_avatar_path, '/', 1) <> active_profile_id::text THEN
    RAISE EXCEPTION 'La ruta de la foto no pertenece al usuario actual.';
  END IF;

  UPDATE public.user_profiles
  SET avatar_path = clean_avatar_path
  WHERE id = active_profile_id
  RETURNING * INTO updated_profile;

  IF updated_profile.id IS NULL THEN
    RAISE EXCEPTION 'No se encontro un perfil activo para actualizar.';
  END IF;

  RETURN updated_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_profile_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_current_user_avatar(text) TO authenticated;

DROP POLICY IF EXISTS active_insert_own_user_avatar ON storage.objects;

CREATE POLICY active_insert_own_user_avatar
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-avatars'
    AND public.current_user_is_active()
    AND split_part(name, '/', 1) = public.current_user_profile_id()::text
  );
