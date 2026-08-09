import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase/client';
import { storageService } from '../../../lib/supabase/storage';
import type { Database } from '../../../types/database.types';

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export interface AuthSession {
  session: Session;
  user: User;
  profile: UserProfile;
}

export interface UpdateProfileInput {
  first_name: string;
  last_name: string;
  phone: string;
  avatarFile?: File | null;
  identityDocumentFile?: File | null;
}

const getProfileByAuthUserId = async (authUserId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const signIn = async (email: string, password: string): Promise<AuthSession> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.session || !data.user) {
    throw new Error('No se pudo iniciar sesion.');
  }

  const profile = await getProfileByAuthUserId(data.user.id);

  if (!profile) {
    await supabase.auth.signOut();
    throw new Error('Tu usuario no tiene perfil configurado.');
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    throw new Error('Tu usuario esta desactivado. Contacta a un administrador.');
  }

  return {
    session: data.session,
    user: data.user,
    profile,
  };
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

const updatePassword = async (currentPassword: string, newPassword: string) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user?.email) {
    throw new Error('No se encontro el correo de la sesion actual.');
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    throw new Error('La contrasena actual no es correcta.');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
};

const updateAvatar = async (profile: UserProfile, file: File) => {
  const avatarPath = await storageService.uploadFile({
    bucket: 'user-avatars',
    file,
    ownerId: profile.id,
    folder: 'avatars',
  });

  const { data, error } = await supabase.rpc('update_current_user_avatar', {
    next_avatar_path: avatarPath,
  });

  if (error) {
    throw error;
  }

  return data as UserProfile;
};

const updateProfile = async (profile: UserProfile, input: UpdateProfileInput) => {
  let avatarPath = profile.avatar_path;
  let identityDocumentPath = profile.identity_document_path;

  if (input.avatarFile) {
    avatarPath = await storageService.uploadFile({
      bucket: 'user-avatars',
      file: input.avatarFile,
      ownerId: profile.id,
      folder: 'avatars',
    });
  }

  if (input.identityDocumentFile) {
    identityDocumentPath = await storageService.uploadFile({
      bucket: 'identity-documents',
      file: input.identityDocumentFile,
      ownerId: profile.id,
      folder: 'documents',
    });
  }

  const { data, error } = await supabase.rpc('update_current_user_profile', {
    next_first_name: input.first_name,
    next_last_name: input.last_name,
    next_phone: input.phone,
    next_avatar_path: avatarPath || '',
    next_identity_document_path: identityDocumentPath || '',
  });

  if (error) {
    throw error;
  }

  return data as UserProfile;
};

export const authService = {
  getProfileByAuthUserId,
  signIn,
  signOut,
  updateAvatar,
  updateProfile,
  updatePassword,
};
