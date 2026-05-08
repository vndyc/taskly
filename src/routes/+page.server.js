/* ============================================================
   Dashboard (Home) — Server-Load
   ============================================================
   Lädt alle Tasks der aktuellen Woche (Montag bis Sonntag)
   und übergibt sie zusammen mit dem heutigen Datum an die Seite.

   Hinweis: locals.user existiert hier garantiert, weil
   hooks.server.js nicht-eingeloggte User schon vorher abfängt.
   ============================================================ */

import { tasksLaden } from '$lib/server/tasks.js';
import { alsIsoDatum, heuteIso, wochenStart } from '$lib/datum.js';

export async function load({ locals }) {
  // --- Aktuelle Woche bestimmen (Montag bis Sonntag) ---
  const heute = new Date();
  const wStart = wochenStart(heute);
  const wEnde = new Date(wStart);
  wEnde.setDate(wEnde.getDate() + 6);

  const wStartIso = alsIsoDatum(wStart);
  const wEndeIso = alsIsoDatum(wEnde);

  // --- Alle Tasks der aktuellen Woche laden ---
  const tasks = await tasksLaden(locals.user.id, {
    von: wStartIso,
    bis: wEndeIso
  });

  return {
    tasks,
    heuteIso: heuteIso(),
    wStartIso,
    wEndeIso
  };
}
