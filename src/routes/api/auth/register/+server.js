/* ============================================================
   API: POST /api/auth/register
   ============================================================
   Legt einen neuen User an, erstellt direkt eine Session
   und setzt das Session-Cookie.
   ============================================================ */

import { json } from '@sveltejs/kit';
import { getUsersCollection } from '$lib/server/db.js';
import { passwortHashen, sessionErstellen } from '$lib/server/auth.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST({ request, cookies }) {
  const { email, passwort, name } = await request.json();

  // --- Validierung ---
  if (!email || !passwort || !name) {
    return json({ fehler: 'Alle Felder sind erforderlich' }, { status: 400 });
  }
  if (passwort.length < 8) {
    return json({ fehler: 'Passwort muss mindestens 8 Zeichen lang sein' }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return json({ fehler: 'Ungültige E-Mail-Adresse' }, { status: 400 });
  }

  const emailNormalisiert = email.toLowerCase();

  // --- Prüfen, ob die E-Mail bereits registriert ist ---
  const users = await getUsersCollection();
  const vorhandenerUser = await users.findOne({ email: emailNormalisiert });
  if (vorhandenerUser) {
    return json(
      { fehler: 'Diese E-Mail-Adresse ist bereits registriert' },
      { status: 409 }
    );
  }

  // --- Passwort hashen und User anlegen ---
  const passwortHash = await passwortHashen(passwort);
  const ergebnis = await users.insertOne({
    email: emailNormalisiert,
    passwortHash,
    name,
    erstelltAm: new Date()
  });

  // --- Session erstellen und Cookie setzen ---
  const { sessionId, ablaufDatum } = await sessionErstellen(ergebnis.insertedId.toString());

  cookies.set('session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: ablaufDatum
  });

  return json({ erfolg: true });
}
