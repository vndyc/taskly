/* ============================================================
   Dashboard (Home) — Server-Load
   ============================================================
   Lädt alle Tasks der aktuellen Woche (Montag bis Sonntag)
   und übergibt sie zusammen mit dem heutigen Datum an die Seite.

   Hinweis: locals.user existiert hier garantiert, weil
   hooks.server.js nicht-eingeloggte User schon vorher abfängt.
   ============================================================ */

import { fail } from '@sveltejs/kit';
import {
  tasksLaden,
  taskAktualisieren,
  taskLoeschen,
  ERLAUBTE_KATEGORIEN
} from '$lib/server/tasks.js';
import { alsIsoDatum, heuteIso, wochenStart } from '$lib/datum.js';

export async function load({ locals, url }) {
  // --- Aktuelle Woche bestimmen (Montag bis Sonntag) ---
  const heute = new Date();
  const wStart = wochenStart(heute);
  const wEnde = new Date(wStart);
  wEnde.setDate(wEnde.getDate() + 6);

  const wStartIso = alsIsoDatum(wStart);
  const wEndeIso = alsIsoDatum(wEnde);

  // --- Filter aus URL ---
  const kategorie = url.searchParams.get('kategorie');
  const aktiverFilter = ERLAUBTE_KATEGORIEN.includes(kategorie) ? kategorie : 'alle';

  // --- Tasks laden ---
  // Wir laden bewusst ALLE Tasks der Woche (ohne Kategorie-Filter
  // auf Server-Seite), weil die Stats alle Kategorien zählen sollen.
  // Der Filter wird im Frontend auf die heutigen Tasks angewendet.
  const tasks = await tasksLaden(locals.user.id, {
    von: wStartIso,
    bis: wEndeIso
  });

  // --- Überfällige Tasks (vor heute, noch offen) ---
  const ueberfaellig = await tasksLaden(locals.user.id, {
    bisExklusiv: heuteIso(),
    nurOffen: true
  });

  return {
    tasks,
    ueberfaellig,
    heuteIso: heuteIso(),
    wStartIso,
    wEndeIso,
    aktiverFilter
  };
}


/* ------------------------------------------------------------
   Form Actions
   ------------------------------------------------------------ */

export const actions = {
  // Toggelt das 'erledigt'-Flag einer Aufgabe.
  erledigtToggeln: async ({ request, locals }) => {
    const formdata = await request.formData();
    const id = formdata.get('id')?.toString();
    const erledigt = formdata.get('erledigt')?.toString() === 'true';

    if (!id) {
      return fail(400, { fehler: 'ID fehlt' });
    }

    const aktualisiert = await taskAktualisieren(locals.user.id, id, { erledigt });
    if (!aktualisiert) {
      return fail(404, { fehler: 'Aufgabe nicht gefunden' });
    }

    return { erfolg: true };
  },

  // Löscht eine Aufgabe.
  loeschen: async ({ request, locals }) => {
    const formdata = await request.formData();
    const id = formdata.get('id')?.toString();

    if (!id) {
      return fail(400, { fehler: 'ID fehlt' });
    }

    const erfolg = await taskLoeschen(locals.user.id, id);
    if (!erfolg) {
      return fail(404, { fehler: 'Aufgabe nicht gefunden' });
    }

    return { erfolg: true };
  }
};
