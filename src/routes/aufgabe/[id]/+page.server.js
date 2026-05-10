// src/routes/aufgabe/[id]/+page.server.js
// Server-Logik für die "Aufgabe bearbeiten" Seite.
// load() lädt die Aufgabe und das Redirect-Ziel.
// actions.aktualisieren speichert Änderungen.
// actions.loeschen löscht die Aufgabe.

import { redirect, fail, error } from '@sveltejs/kit';
import {
  formularZuTask,
  taskLadenById,
  taskAktualisieren,
  taskLoeschen
} from '$lib/server/tasks.js';

/**
 * Validiert ein 'zurueck'-Ziel: nur lokale Pfade akzeptieren
 * (Sicherheit gegen Open Redirect — keine "//host"-Notation).
 */
function zurueckAuslesen(url) {
  const roh = url.searchParams.get('zurueck') ?? '/';
  return roh.startsWith('/') && !roh.startsWith('//') ? roh : '/';
}

export async function load({ params, locals, url }) {
  const task = await taskLadenById(locals.user.id, params.id);
  if (!task) {
    throw error(404, 'Aufgabe nicht gefunden');
  }
  return {
    task,
    zurueck: zurueckAuslesen(url)
  };
}

export const actions = {
  aktualisieren: async ({ request, params, locals, url }) => {
    const formdata = await request.formData();
    const ergebnis = formularZuTask(formdata);

    if (ergebnis.fehler) {
      return fail(400, {
        fehler: ergebnis.fehler,
        titel: formdata.get('titel')?.toString() ?? '',
        beschreibung: formdata.get('beschreibung')?.toString() ?? '',
        kategorie: formdata.get('kategorie')?.toString() ?? '',
        faelligkeitsDatum: formdata.get('faelligkeitsDatum')?.toString() ?? '',
        notiz: formdata.get('notiz')?.toString() ?? ''
      });
    }

    const aktualisiert = await taskAktualisieren(
      locals.user.id,
      params.id,
      ergebnis.daten
    );
    if (!aktualisiert) {
      throw error(404, 'Aufgabe nicht gefunden');
    }

    throw redirect(303, zurueckAuslesen(url));
  },

  loeschen: async ({ params, locals, url }) => {
    const erfolg = await taskLoeschen(locals.user.id, params.id);
    if (!erfolg) {
      throw error(404, 'Aufgabe nicht gefunden');
    }
    throw redirect(303, zurueckAuslesen(url));
  }
};
