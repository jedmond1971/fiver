// Builds a Supabase client with the service-role key — must only ever be
// imported from api/, never src/, or the key would ship to the browser
// bundle. See src/data/answers.json's equivalent rule in _lib/answers.ts.
import { createClient } from '@supabase/supabase-js';

export type InviteErrorCode = 'invalid_email' | 'unauthorized' | 'already_registered' | 'rate_limited' | 'unknown';

export interface InviteResponseBody {
  ok: boolean;
  error?: InviteErrorCode;
}

interface HandlerResult {
  status: number;
  body: InviteResponseBody;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Framework-agnostic core so both the Vercel Function (production) and the
 * Vite dev-server middleware (`npm run dev`) can share one implementation —
 * mirrors the guessHandler.ts split. Requires a valid Supabase access token
 * (the caller's own session) in authHeader so only signed-in FIVER users can
 * trigger invite emails.
 */
export async function handleInvite(body: unknown, authHeader: string | undefined): Promise<HandlerResult> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    return { status: 500, body: { ok: false, error: 'unknown' } };
  }

  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { status: 401, body: { ok: false, error: 'unauthorized' } };
  }

  const authClient = createClient(url, anonKey);
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) {
    return { status: 401, body: { ok: false, error: 'unauthorized' } };
  }

  const email = typeof body === 'object' && body !== null ? (body as { email?: unknown }).email : undefined;
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { status: 400, body: { ok: false, error: 'invalid_email' } };
  }

  const adminClient = createClient(url, serviceRoleKey);
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email);
  if (!error) {
    return { status: 200, body: { ok: true } };
  }

  if (error.code === 'email_exists') {
    return { status: 409, body: { ok: false, error: 'already_registered' } };
  }
  if (error.code === 'over_email_send_rate_limit') {
    return { status: 429, body: { ok: false, error: 'rate_limited' } };
  }
  if (error.code === 'email_address_invalid') {
    return { status: 400, body: { ok: false, error: 'invalid_email' } };
  }
  // Anything else is unexpected — log it server-side (visible in Vercel's
  // function logs in production) since the client only ever sees 'unknown'.
  console.error('inviteUserByEmail failed', error);
  return { status: 500, body: { ok: false, error: 'unknown' } };
}
