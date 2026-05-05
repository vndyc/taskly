/* ============================================================
   API: POST /api/auth/logout
   ============================================================
   Löscht die Session in der DB und entfernt das Session-Cookie.
   ============================================================ */

import { json } from '@sveltejs/kit';
import { sessionLoeschen } from '$lib/server/auth.js';

export async function POST({ cookies }) {
  const sessionId = cookies.get('session');
  await sessionLoeschen(sessionId);
  cookies.delete('session', { path: '/' });
  return json({ erfolg: true });
}
