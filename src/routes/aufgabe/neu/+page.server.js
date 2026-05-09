// src/routes/aufgabe/neu/+page.server.js
// Server-Logik für die "Neue Aufgabe" Seite.
// load() liefert das heutige Datum als Default fürs Datumsfeld.
// actions.default speichert eine neue Aufgabe.

import { redirect, fail } from '@sveltejs/kit';
import { formularZuTask, taskErstellen } from '$lib/server/tasks.js';
import { heuteIso } from '$lib/datum.js';

export function load({ url }) {
  const datumParam = url.searchParams.get('datum');
  const startDatum =
    datumParam && /^\d{4}-\d{2}-\d{2}$/.test(datumParam)
      ? datumParam
      : heuteIso();

  // 'zurueck' als optionales Redirect-Ziel.
  // Whitelist: nur lokale Pfade akzeptieren (Sicherheit gegen Open Redirect).
  const zurueckRoh = url.searchParams.get('zurueck') ?? '/';
  const zurueck =
    zurueckRoh.startsWith('/') && !zurueckRoh.startsWith('//') ? zurueckRoh : '/';

  return {
    heuteIso: startDatum,
    zurueck
  };
}

export const actions = {
  default: async ({ request, locals, url }) => {
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

    // Redirect-Ziel aus URL lesen, mit Sicherheits-Whitelist
    // (nur lokale Pfade, kein "//host" und kein externer URL).
    const zurueckRoh = url.searchParams.get('zurueck') ?? '/';
    const zurueck =
      zurueckRoh.startsWith('/') && !zurueckRoh.startsWith('//') ? zurueckRoh : '/';

    throw redirect(303, zurueck);
  }
};
