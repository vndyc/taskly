/* ============================================================
   API: POST /api/auth/login
   ============================================================
   Prüft die Zugangsdaten, erstellt eine neue Session
   und setzt das Session-Cookie.
   ============================================================ */

import { json } from '@sveltejs/kit';
import { getUsersCollection } from '$lib/server/db.js';
import { passwortPruefen, sessionErstellen } from '$lib/server/auth.js';

export async function POST({ request, cookies }) {
  const { email, passwort } = await request.json();

  if (!email || !passwort) {
    return json({ fehler: 'E-Mail und Passwort erforderlich' }, { status: 400 });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email: email.toLowerCase() });

  // Bewusst gleiche Fehlermeldung für "User nicht gefunden" und
  // "Passwort falsch", damit keine Rückschlüsse auf existierende
  // E-Mail-Adressen möglich sind.
  if (!user) {
    return json({ fehler: 'E-Mail oder Passwort falsch' }, { status: 401 });
  }

  const passwortKorrekt = await passwortPruefen(passwort, user.passwortHash);
  if (!passwortKorrekt) {
    return json({ fehler: 'E-Mail oder Passwort falsch' }, { status: 401 });
  }

  // --- Session erstellen und Cookie setzen ---
  const { sessionId, ablaufDatum } = await sessionErstellen(user._id.toString());

  cookies.set('session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: ablaufDatum
  });

  return json({ erfolg: true });
}
