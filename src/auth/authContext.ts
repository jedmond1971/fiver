import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../game/types';

interface ActionResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

export interface AuthContextValue {
  /** False if VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aren't configured — every action below is a no-op. */
  authAvailable: boolean;
  /** True once the initial session check has resolved. */
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  /** Signed in, but hasn't chosen a username yet (first sign-in) — the app should show the username prompt. */
  needsUsername: boolean;
  signInWithPassword: (email: string, password: string) => Promise<ActionResult>;
  signUpWithPassword: (email: string, password: string) => Promise<ActionResult>;
  signInWithGoogle: () => Promise<ActionResult>;
  signOut: () => Promise<void>;
  completeSignUp: (username: string) => Promise<ActionResult>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
