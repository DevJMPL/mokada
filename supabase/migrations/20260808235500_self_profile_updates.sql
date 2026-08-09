CREATE OR REPLACE FUNCTION public.update_current_user_profile(
  next_first_name text,
  next_last_name text,
  next_phone text,
  next_avatar_path text,
  next_identity_document_path text
)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_profile public.user_profiles;
  active_profile_id uuid;
  clean_first_name text;
  clean_last_name text;
  clean_phone text;
  clean_avatar_path text;
  clean_document_path text;
BEGIN
  active_profile_id := public.current_user_profile_id();
  clean_first_name := NULLIF(trim(next_first_name), '');
  clean_last_name := NULLIF(trim(next_last_name), '');
  clean_phone := NULLIF(trim(next_phone), '');
  clean_avatar_path := NULLIF(trim(next_avatar_path), '');
  clean_document_path := NULLIF(trim(next_identity_document_path), '');

  IF active_profile_id IS NULL THEN
    RAISE EXCEPTION 'No se encontro un perfil activo para actualizar.';
  END IF;

  IF clean_first_name IS NULL THEN
    RAISE EXCEPTION 'El nombre es obligatorio.';
  END IF;

  IF clean_last_name IS NULL THEN
    RAISE EXCEPTION 'Los apellidos son obligatorios.';
  END IF;

  IF clean_avatar_path IS NOT NULL AND split_part(clean_avatar_path, '/', 1) <> active_profile_id::text THEN
    RAISE EXCEPTION 'La ruta de la foto no pertenece al usuario actual.';
  END IF;

  IF clean_document_path IS NOT NULL AND split_part(clean_document_path, '/', 1) <> active_profile_id::text THEN
    RAISE EXCEPTION 'La ruta del documento no pertenece al usuario actual.';
  END IF;

  UPDATE public.user_profiles
  SET
    first_name = clean_first_name,
    last_name = clean_last_name,
    phone = clean_phone,
    avatar_path = clean_avatar_path,
    identity_document_path = clean_document_path
  WHERE id = active_profile_id
  RETURNING * INTO updated_profile;

  RETURN updated_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_current_user_profile(text, text, text, text, text) TO authenticated;

DROP POLICY IF EXISTS active_insert_own_identity_document ON storage.objects;
DROP POLICY IF EXISTS active_read_own_identity_document ON storage.objects;

CREATE POLICY active_insert_own_identity_document
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'identity-documents'
    AND public.current_user_is_active()
    AND split_part(name, '/', 1) = public.current_user_profile_id()::text
  );

CREATE POLICY active_read_own_identity_document
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'identity-documents'
    AND public.current_user_is_active()
    AND split_part(name, '/', 1) = public.current_user_profile_id()::text
  );
