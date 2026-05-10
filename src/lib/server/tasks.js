/* ============================================================
   Taskly — Tasks-Hilfsfunktionen (server-only)
   ============================================================
   Wird von +page.server.js-Dateien und Form Actions
   wiederverwendet. Sämtliche DB-Funktionen filtern immer nach
   userId, damit ein User niemals fremde Aufgaben sieht oder
   ändern kann.

   Konvention: Statt Exceptions zu werfen, geben die Funktionen
   null/false zurück, wenn etwas nicht gefunden oder ungültig
   ist. Der Aufrufer entscheidet, was er damit macht.
   ============================================================ */

import { ObjectId } from 'mongodb';
import { getTasksCollection } from './db.js';

/** Erlaubte Werte für das Feld 'kategorie'. */
export const ERLAUBTE_KATEGORIEN = ['arbeit', 'schule', 'privat'];


/* ------------------------------------------------------------
   Formatierung
   ------------------------------------------------------------ */

/**
 * Wandelt ein Mongo-Dokument in ein Client-freundliches Objekt um.
 * _id (ObjectId) wird zu id (string), damit es im Templating
 * direkt verwendet werden kann.
 */
export function taskFormatieren(t) {
  return {
    id: t._id.toString(),
    titel: t.titel,
    beschreibung: t.beschreibung,
    kategorie: t.kategorie,
    faelligkeitsDatum: t.faelligkeitsDatum,
    notiz: t.notiz,
    erledigt: t.erledigt,
    erstelltAm: t.erstelltAm,
    bearbeitetAm: t.bearbeitetAm
  };
}


/* ------------------------------------------------------------
   Form-Validierung
   ------------------------------------------------------------ */

/**
 * Liest die Felder einer Task aus einem FormData-Objekt aus
 * und validiert sie. Gibt entweder { daten } (gültig) oder
 * { fehler } (ungültig) zurück.
 */
export function formularZuTask(formdata) {
  const titel = formdata.get('titel')?.toString().trim() ?? '';
  const beschreibung = formdata.get('beschreibung')?.toString().trim() ?? '';
  const kategorie = formdata.get('kategorie')?.toString() ?? '';
  const faelligkeitsDatum = formdata.get('faelligkeitsDatum')?.toString() ?? '';
  const notiz = formdata.get('notiz')?.toString().trim() ?? '';

  if (titel.length === 0) return { fehler: 'Titel ist erforderlich' };
  if (titel.length > 100) return { fehler: 'Titel darf maximal 100 Zeichen lang sein' };
  if (!ERLAUBTE_KATEGORIEN.includes(kategorie)) return { fehler: 'Ungültige Kategorie' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(faelligkeitsDatum)) {
    return { fehler: 'Fälligkeitsdatum muss im Format YYYY-MM-DD sein' };
  }

  return {
    daten: { titel, beschreibung, kategorie, faelligkeitsDatum, notiz }
  };
}


/* ------------------------------------------------------------
   Lese-Operationen
   ------------------------------------------------------------ */

/**
 * Lädt Tasks für einen User mit optionalen Filtern.
 * Filter:
 *   { datum }            → genau dieser Tag
 *   { von, bis }         → Datumsbereich (überschreibt 'datum')
 *   { bisExklusiv }      → alle Tasks strikt vor diesem Datum (überfällig)
 *   { kategorie }        → nur diese Kategorie (wenn gültig)
 *   { nurOffen }         → wenn true, nur Tasks mit erledigt === false
 */
export async function tasksLaden(userId, filter = {}) {
  const tasks = await getTasksCollection();
  const dbFilter = { userId };

  if (filter.datum) {
    dbFilter.faelligkeitsDatum = filter.datum;
  }
  if (filter.von && filter.bis) {
    dbFilter.faelligkeitsDatum = { $gte: filter.von, $lte: filter.bis };
  }
  if (filter.bisExklusiv) {
    dbFilter.faelligkeitsDatum = { $lt: filter.bisExklusiv };
  }
  if (filter.kategorie && ERLAUBTE_KATEGORIEN.includes(filter.kategorie)) {
    dbFilter.kategorie = filter.kategorie;
  }
  if (filter.nurOffen === true) {
    dbFilter.erledigt = false;
  }

  const liste = await tasks
    .find(dbFilter)
    .sort({ faelligkeitsDatum: 1, erstelltAm: 1 })
    .toArray();

  return liste.map(taskFormatieren);
}

/**
 * Lädt eine einzelne Task. Gibt null zurück, wenn die ID
 * ungültig ist oder die Task nicht (mehr) zum User gehört.
 */
export async function taskLadenById(userId, id) {
  if (!ObjectId.isValid(id)) return null;
  const tasks = await getTasksCollection();
  const t = await tasks.findOne({ _id: new ObjectId(id), userId });
  return t ? taskFormatieren(t) : null;
}


/* ------------------------------------------------------------
   Schreib-Operationen
   ------------------------------------------------------------ */

/**
 * Erstellt eine neue Task. Erwartet bereits validierte Daten
 * (z.B. via formularZuTask).
 */
export async function taskErstellen(userId, daten) {
  const tasks = await getTasksCollection();
  const neueAufgabe = {
    userId,
    titel: daten.titel,
    beschreibung: daten.beschreibung,
    kategorie: daten.kategorie,
    faelligkeitsDatum: daten.faelligkeitsDatum,
    notiz: daten.notiz,
    erledigt: false,
    erstelltAm: new Date(),
    bearbeitetAm: new Date()
  };
  const ergebnis = await tasks.insertOne(neueAufgabe);
  return taskFormatieren({ ...neueAufgabe, _id: ergebnis.insertedId });
}

/**
 * Aktualisiert eine Task und setzt automatisch bearbeitetAm.
 * Gibt die aktualisierte Task zurück oder null, wenn die ID
 * ungültig ist oder die Task nicht zum User gehört.
 */
export async function taskAktualisieren(userId, id, aenderungen) {
  if (!ObjectId.isValid(id)) return null;
  const tasks = await getTasksCollection();
  const update = { ...aenderungen, bearbeitetAm: new Date() };
  const ergebnis = await tasks.findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: update },
    { returnDocument: 'after' }
  );
  return ergebnis ? taskFormatieren(ergebnis) : null;
}

/**
 * Löscht eine Task. Gibt true zurück bei Erfolg, false sonst
 * (ungültige ID oder Task gehört nicht zum User).
 */
export async function taskLoeschen(userId, id) {
  if (!ObjectId.isValid(id)) return false;
  const tasks = await getTasksCollection();
  const ergebnis = await tasks.deleteOne({ _id: new ObjectId(id), userId });
  return ergebnis.deletedCount > 0;
}


/* ------------------------------------------------------------
   Suche
   ------------------------------------------------------------ */

/**
 * Sucht Tasks nach Suchbegriff in titel, beschreibung und notiz.
 * Optional gefiltert nach Kategorie und Status.
 * @param {string} userId
 * @param {object} optionen
 * @param {string} optionen.suchbegriff - Volltextsuche, kann leer sein
 * @param {string} [optionen.kategorie] - 'arbeit' | 'schule' | 'privat'
 * @param {string} [optionen.status] - 'offen' | 'erledigt'
 * @returns {Promise<Array>}
 */
export async function tasksSuchen(userId, optionen = {}) {
  const tasks = await getTasksCollection();
  const dbFilter = { userId };

  // --- Volltext-Filter (nur wenn Suchbegriff vorhanden) ---
  const begriff = optionen.suchbegriff?.trim();
  if (begriff) {
    // Regex-Sonderzeichen escapen, damit sie wörtlich gesucht werden
    // (sonst könnten User-Eingaben wie ".*" das Verhalten ändern).
    const escaped = begriff.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = { $regex: escaped, $options: 'i' };
    dbFilter.$or = [
      { titel: regex },
      { beschreibung: regex },
      { notiz: regex }
    ];
  }

  // --- Kategorie-Filter ---
  if (optionen.kategorie && ERLAUBTE_KATEGORIEN.includes(optionen.kategorie)) {
    dbFilter.kategorie = optionen.kategorie;
  }

  // --- Status-Filter ---
  if (optionen.status === 'offen') {
    dbFilter.erledigt = false;
  } else if (optionen.status === 'erledigt') {
    dbFilter.erledigt = true;
  }

  const liste = await tasks
    .find(dbFilter)
    .sort({ faelligkeitsDatum: -1, erstelltAm: -1 })
    .toArray();

  return liste.map(taskFormatieren);
}
