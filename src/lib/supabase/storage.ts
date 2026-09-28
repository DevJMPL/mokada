import { supabase } from './client';

export type StorageBucket =
  | 'user-avatars'
  | 'identity-documents'
  | 'products'
  | 'expense-evidence'
  | 'fleet-vehicles'
  | 'customer-branches';

interface UploadFileOptions {
  bucket: StorageBucket;
  file: File;
  ownerId: string;
  folder?: string;
  upsert?: boolean;
}

const safeFileName = (name: string) => {
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  return cleaned || 'archivo';
};

const buildPath = ({ ownerId, folder = 'files', file }: UploadFileOptions) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${ownerId}/${folder}/${timestamp}-${safeFileName(file.name)}`;
};

const uploadFile = async (options: UploadFileOptions) => {
  const path = buildPath(options);
  const { error } = await supabase.storage.from(options.bucket).upload(path, options.file, {
    cacheControl: '3600',
    upsert: options.upsert ?? false,
  });

  if (error) {
    throw error;
  }

  return path;
};

const getPublicUrl = (bucket: StorageBucket, path: string | null) => {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

const createSignedUrl = async (bucket: StorageBucket, path: string, expiresIn = 300) => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
};

const getFileName = (path: string | null) => {
  if (!path) return '';
  return path.split('/').pop() || path;
};

const getFileKind = (path: string | null) => {
  const extension = getFileName(path).split('.').pop()?.toLowerCase();

  if (!extension) return 'file';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) return 'image';
  if (extension === 'pdf') return 'pdf';
  return 'file';
};

export const storageService = {
  createSignedUrl,
  getFileKind,
  getFileName,
  getPublicUrl,
  uploadFile,
};
