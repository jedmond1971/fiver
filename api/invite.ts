import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleInvite } from './_lib/inviteHandler.js';

type VercelLikeRequest = IncomingMessage & { method?: string; body?: unknown };

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const { status, body } = await handleInvite(req.body, req.headers.authorization);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
