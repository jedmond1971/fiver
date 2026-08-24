import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Null when Supabase env vars aren't configured (e.g. local dev without a
 * `.env`, or CI). Auth-dependent features fall back to guest-only behavior
 * in that case instead of throwing.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
