import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase/client';
import { authService, type UpdateProfileInput, type UserProfile } from '../services/auth.service';
import { AuthContext, type AuthContextValue } from './AuthContextState';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession?.user) {
      setProfile(null);
      return;
    }

    const nextProfile = await authService.getProfileByAuthUserId(nextSession.user.id).catch(async () => {
      await authService.signOut();
      return null;
    });

    if (!nextProfile?.is_active) {
      setProfile(null);
      await authService.signOut();
      return;
    }

    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;
      try {
        await loadProfile(data.session);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      loadProfile(nextSession).catch(async () => {
        setProfile(null);
        await authService.signOut();
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const authSession = await authService.signIn(email, password);
      setSession(authSession.session);
      setProfile(authSession.profile);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const nextProfile = await authService.getProfileByAuthUserId(session.user.id);
    setProfile(nextProfile);
  }, [session?.user]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authService.updatePassword(currentPassword, newPassword);
  }, []);

  const updateAvatar = useCallback(
    async (file: File) => {
      if (!profile) {
        throw new Error('No hay perfil activo para actualizar.');
      }

      const nextProfile = await authService.updateAvatar(profile, file);
      setProfile(nextProfile);
    },
    [profile],
  );

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!profile) {
        throw new Error('No hay perfil activo para actualizar.');
      }

      const nextProfile = await authService.updateProfile(profile, input);
      setProfile(nextProfile);
    },
    [profile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isAdmin: profile?.user_type === 'ADMIN',
      signIn,
      signOut,
      updateAvatar,
      updateProfile,
      refreshProfile,
      updatePassword,
    }),
    [isLoading, profile, refreshProfile, session, signIn, signOut, updateAvatar, updatePassword, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
