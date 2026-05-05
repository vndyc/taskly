/* ============================================================
   Taskly — MongoDB-Connection (Singleton)
   ============================================================
   Diese Datei liegt unter src/lib/server/, damit SvelteKit den
   Code niemals ins Frontend-Bundle gibt — die DB-Credentials
   bleiben so garantiert serverseitig.

   Singleton-Pattern: Es gibt nur eine MongoClient-Instanz für
   die ganze App, nicht eine Verbindung pro Request.
   ============================================================ */

import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

// Connection-String aus den Umgebungsvariablen.
// Wir nutzen $env/dynamic/private, NICHT process.env.
const verbindungsUrl = env.DB_URI;

if (!verbindungsUrl) {
  throw new Error('DB_URI fehlt in .env');
}

// Eine einzige Client-Instanz für die ganze App.
const client = new MongoClient(verbindungsUrl);

// Flag, damit connect() nur ein einziges Mal aufgerufen wird.
let connected = false;

/**
 * Stellt bei Bedarf die Verbindung her und gibt die Datenbank zurück.
 * Der DB-Name kommt aus dem Connection-String (z.B. .../taskly?...).
 * @returns {Promise<import('mongodb').Db>}
 */
async function getDb() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db();
}


/* ------------------------------------------------------------
   Convenience-Getter für die einzelnen Collections
   ------------------------------------------------------------ */

/**
 * Gibt die 'tasks'-Collection zurück.
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getTasksCollection() {
  const db = await getDb();
  return db.collection('tasks');
}

/**
 * Gibt die 'users'-Collection zurück und stellt einen
 * unique Index auf 'email' sicher (idempotent — createIndex
 * tut nichts, wenn der Index bereits existiert).
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getUsersCollection() {
  const db = await getDb();
  const collection = db.collection('users');
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

/**
 * Gibt die 'sessions'-Collection zurück und stellt einen
 * TTL-Index auf 'ablaufDatum' sicher. Mit expireAfterSeconds: 0
 * löscht MongoDB Sessions automatisch, sobald das Ablauf-Datum
 * erreicht ist.
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getSessionsCollection() {
  const db = await getDb();
  const collection = db.collection('sessions');
  await collection.createIndex({ ablaufDatum: 1 }, { expireAfterSeconds: 0 });
  return collection;
}
