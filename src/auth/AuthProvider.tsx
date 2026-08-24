import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createProfile, fetchProfile } from '../game/remoteStorage';
import { loadStats } from '../game/storage';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../game/types';
import { AuthContext, type AuthContextValue } from './authContext';

interface ActionResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const authAvailable = supabase !== null;
  const [ready, setReady] = useState(!authAvailable);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);

  const loadProfileFor = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId);
    if (p) {
      setProfile(p);
      setNeedsUsername(false);
    } else {
      setProfile(null);
      setNeedsUsername(true);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setReady(true);
      if (data.session) void loadProfileFor(data.session.user.id);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        void loadProfileFor(nextSession.user.id);
      } else {
        setProfile(null);
        setNeedsUsername(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfileFor]);

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<ActionResult> => {
    if (!supabase) return { error: 'Accounts are not configured for this deployment.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string): Promise<ActionResult> => {
    if (!supabase) return { error: 'Accounts are not configured for this deployment.' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null, needsEmailConfirmation: !data.session };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<ActionResult> => {
    if (!supabase) return { error: 'Accounts are not configured for this deployment.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const completeSignUp = useCallback(
    async (username: string): Promise<ActionResult> => {
      if (!supabase || !session) return { error: 'Not signed in.' };
      try {
        const localStats = loadStats();
        const created = await createProfile(session.user.id, username, localStats);
        setProfile(created);
        setNeedsUsername(false);
        return { error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not create profile.';
        return { error: message.includes('duplicate key') ? 'That username is taken.' : message };
      }
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      authAvailable,
      ready,
      user: session?.user ?? null,
      profile,
      needsUsername,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      completeSignUp,
    }),
    [authAvailable, ready, session, profile, needsUsername, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut, completeSignUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
