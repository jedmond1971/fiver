import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleGuess } from './_lib/guessHandler.js';

type VercelLikeRequest = IncomingMessage & { method?: string; body?: unknown };

export default function handler(req: VercelLikeRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const { status, body } = handleGuess(req.body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
