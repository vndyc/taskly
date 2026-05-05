/* ============================================================
   Taskly — Authentifizierungs-Hilfsfunktionen
   ============================================================
   Server-only: Passwort-Hashing mit bcrypt und Session-Verwaltung
   über die MongoDB 'sessions'-Collection.
   ============================================================ */

import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getSessionsCollection, getUsersCollection } from './db.js';

/** Gültigkeitsdauer einer Session in Millisekunden (7 Tage). */
const SESSION_DAUER_MS = 1000 * 60 * 60 * 24 * 7;


/* ------------------------------------------------------------
   Passwort-Hashing
   ------------------------------------------------------------ */

/**
 * Hasht ein Klartext-Passwort mit bcrypt (Salt-Rounds 10).
 * @param {string} passwort
 * @returns {Promise<string>}
 */
export async function passwortHashen(passwort) {
  return bcrypt.hash(passwort, 10);
}

/**
 * Vergleicht ein Klartext-Passwort mit einem bcrypt-Hash.
 * @param {string} passwort
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function passwortPruefen(passwort, hash) {
  return bcrypt.compare(passwort, hash);
}


/* ------------------------------------------------------------
   Session-Verwaltung
   ------------------------------------------------------------ */

/**
 * Erstellt eine neue Session für den angegebenen User und
 * speichert sie in der 'sessions'-Collection.
 * @param {string} userId
 * @returns {Promise<{ sessionId: string, ablaufDatum: Date }>}
 */
export async function sessionErstellen(userId) {
  const sessionId = crypto.randomUUID();
  const ablaufDatum = new Date(Date.now() + SESSION_DAUER_MS);

  const sessions = await getSessionsCollection();
  await sessions.insertOne({
    sessionId,
    userId,
    ablaufDatum,
    erstelltAm: new Date()
  });

  return { sessionId, ablaufDatum };
}

/**
 * Lädt den User zur angegebenen Session-ID.
 * Gibt null zurück, wenn die Session fehlt, abgelaufen ist oder
 * der zugehörige User nicht mehr existiert. Abgelaufene Sessions
 * werden dabei aus der DB entfernt.
 * Der passwortHash wird bewusst NICHT mitgegeben.
 * @param {string|null|undefined} sessionId
 * @returns {Promise<{ id: string, email: string, name: string } | null>}
 */
export async function userAusSession(sessionId) {
  if (!sessionId) return null;

  const sessions = await getSessionsCollection();
  const session = await sessions.findOne({ sessionId });

  // Session nicht gefunden oder abgelaufen → ggf. aufräumen.
  if (!session || session.ablaufDatum < new Date()) {
    if (session) {
      await sessions.deleteOne({ sessionId });
    }
    return null;
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(session.userId) });

  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  };
}

/**
 * Löscht eine Session aus der DB (z.B. beim Logout).
 * @param {string|null|undefined} sessionId
 * @returns {Promise<void>}
 */
export async function sessionLoeschen(sessionId) {
  if (!sessionId) return;
  const sessions = await getSessionsCollection();
  await sessions.deleteOne({ sessionId });
}
