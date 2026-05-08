// src/routes/aufgabe/neu/+page.server.js
// Server-Logik für die "Neue Aufgabe" Seite.
// load() liefert das heutige Datum als Default fürs Datumsfeld.
// actions.default speichert eine neue Aufgabe.

import { redirect, fail } from '@sveltejs/kit';
import { formularZuTask, taskErstellen } from '$lib/server/tasks.js';
import { heuteIso } from '$lib/datum.js';

export function load() {
  return {
    heuteIso: heuteIso()
  };
}

export const actions = {
  default: async ({ request, locals }) => {
    const formdata = await request.formData();
    const ergebnis = formularZuTask(formdata);

    // Validierung schlug fehl → Fehler + alte Werte zurückgeben
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

    // Task erstellen
    await taskErstellen(locals.user.id, ergebnis.daten);

    // Zurück zum Dashboard
    throw redirect(303, '/');
  }
};
