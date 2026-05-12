// src/routes/kalender/[datum]/+page.server.js
// Lädt Tasks für den ausgewählten Tag und für den Monat
// (für Mini-Kalender-Markierungen).
// Actions: erledigtToggeln, loeschen, verschieben, duplizieren.

import { error, fail } from '@sveltejs/kit';
import {
  tasksLaden,
  taskAktualisieren,
  taskLoeschen,
  taskLadenById,
  taskErstellen
} from '$lib/server/tasks.js';
import { alsIsoDatum, ausIsoDatum, heuteIso } from '$lib/datum.js';

export async function load({ params, locals }) {
  // --- Validierung des URL-Parameters ---
  const datum = params.datum;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    throw error(400, 'Ungültiges Datum in URL');
  }

  // --- Tag-Tasks ---
  const tagesTasks = await tasksLaden(locals.user.id, { datum });

  // --- Monat-Tasks (für Mini-Kalender-Markierungen) ---
  const datumObj = ausIsoDatum(datum);
  const monatStart = new Date(datumObj.getFullYear(), datumObj.getMonth(), 1);
  const monatEnde = new Date(datumObj.getFullYear(), datumObj.getMonth() + 1, 0);
  const monatTasks = await tasksLaden(locals.user.id, {
    von: alsIsoDatum(monatStart),
    bis: alsIsoDatum(monatEnde)
  });

  return {
    datum,
    tagesTasks,
    monatTasks
  };
}

export const actions = {
  erledigtToggeln: async ({ request, locals }) => {
    const formdata = await request.formData();
    const id = formdata.get('id')?.toString();
    const erledigt = formdata.get('erledigt')?.toString() === 'true';

    if (!id) return fail(400, { fehler: 'ID fehlt' });

    const aktualisiert = await taskAktualisieren(locals.user.id, id, { erledigt });
    if (!aktualisiert) return fail(404, { fehler: 'Aufgabe nicht gefunden' });

    return { erfolg: true };
  },

  loeschen: async ({ request, locals }) => {
    const formdata = await request.formData();
    const id = formdata.get('id')?.toString();

    if (!id) return fail(400, { fehler: 'ID fehlt' });

    const erfolg = await taskLoeschen(locals.user.id, id);
    if (!erfolg) return fail(404, { fehler: 'Aufgabe nicht gefunden' });

    return { erfolg: true };
  },

  verschieben: async ({ request, locals }) => {
    const formdata = await request.formData();
    const id = formdata.get('id')?.toString();
    const neuesDatum = formdata.get('neuesDatum')?.toString();

    if (!id) return fail(400, { fehler: 'ID fehlt' });
    if (!neuesDatum || !/^\d{4}-\d{2}-\d{2}$/.test(neuesDatum)) {
      return fail(400, { fehler: 'Ungültiges Datum' });
    }

    const aktualisiert = await taskAktualisieren(locals.user.id, id, {
      faelligkeitsDatum: neuesDatum
    });
    if (!aktualisiert) return fail(404, { fehler: 'Aufgabe nicht gefunden' });

    return { erfolg: true };
  },

  // Erstellt eine Kopie der Aufgabe mit heutigem Datum und erledigt = false.
  duplizieren: async ({ request, locals }) => {
    const formdata = await request.formData();
    const id = formdata.get('id')?.toString();

    if (!id) return fail(400, { fehler: 'ID fehlt' });

    const original = await taskLadenById(locals.user.id, id);
    if (!original) return fail(404, { fehler: 'Aufgabe nicht gefunden' });

    await taskErstellen(locals.user.id, {
      titel: original.titel,
      beschreibung: original.beschreibung,
      kategorie: original.kategorie,
      faelligkeitsDatum: heuteIso(),
      notiz: original.notiz
    });

    return { erfolg: true };
  }
};
