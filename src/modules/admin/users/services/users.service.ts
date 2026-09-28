import { supabase } from '../../../../lib/supabase/client';
import { storageService, type StorageBucket } from '../../../../lib/supabase/storage';
import type { Database } from '../../../../types/database.types';

export type ManagedUserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserType = ManagedUserProfile['user_type'];
export type AgentFunction = Database['public']['Enums']['agent_function_type'];

export interface UserFormValues {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar_path?: string | null;
  identity_document_path?: string | null;
  user_type: UserType;
  agent_functions?: AgentFunction[];
  is_active: boolean;
}

interface FunctionResponse<T> {
  data?: T;
  error?: string;
}

const invokeAdminUsers = async <T>(
  body: Record<string, unknown>,
  expectedMessage = 'No se pudo procesar la solicitud.',
) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesion expiro. Inicia sesion de nuevo.');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
    method: 'POST',
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as FunctionResponse<T> | null;

  if (!response.ok) {
    if (response.status === 401) {
      await supabase.auth.signOut();
      throw new Error('Tu sesion expiro. Inicia sesion de nuevo.');
    }

    throw new Error(data?.error || expectedMessage);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (data?.data === undefined) {
    throw new Error(expectedMessage);
  }

  return data.data;
};

const listUsers = async () => {
  return invokeAdminUsers<ManagedUserProfile[]>({ action: 'list' }, 'No se pudieron cargar los usuarios.');
};

const createUser = async (payload: UserFormValues) => {
  return invokeAdminUsers<ManagedUserProfile>(
    {
      action: 'create',
      payload,
    },
    'No se pudo crear el usuario.',
  );
};

const updateUser = async (id: string, payload: Partial<UserFormValues>) => {
  return invokeAdminUsers<ManagedUserProfile>(
    {
      action: 'update',
      id,
      payload,
    },
    'No se pudo actualizar el usuario.',
  );
};

const uploadUserFile = async (userId: string, bucket: StorageBucket, file: File) => {
  return storageService.uploadFile({
    bucket,
    file,
    ownerId: userId,
    folder: bucket === 'user-avatars' ? 'avatars' : 'documents',
  });
};

const getAvatarUrl = (path: string | null) => {
  return storageService.getPublicUrl('user-avatars', path);
};

const getDocumentUrl = async (path: string) => {
  return storageService.createSignedUrl('identity-documents', path);
};

const getFileKind = (path: string | null) => {
  return storageService.getFileKind(path);
};

const getFileName = (path: string | null) => {
  return storageService.getFileName(path);
};

export const userTypeLabels: Record<UserType, string> = {
  CUSTOMER: 'Cliente',
  AGENT: 'Agente',
  ADMIN: 'Administrador',
};

export const agentFunctionLabels: Record<AgentFunction, string> = {
  DRIVER: 'Conductor',
  SALESPERSON: 'Vendedor',
  WAREHOUSE: 'Almacenista',
};

export const adminUsersService = {
  listUsers,
  createUser,
  getDocumentUrl,
  getFileKind,
  getFileName,
  updateUser,
  uploadUserFile,
  getAvatarUrl,
};
