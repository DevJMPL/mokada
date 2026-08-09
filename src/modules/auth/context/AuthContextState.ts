import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { UpdateProfileInput, UserProfile } from '../services/auth.service';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
