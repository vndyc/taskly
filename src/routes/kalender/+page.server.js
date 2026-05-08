// src/routes/kalender/+page.server.js
// Lädt die Tasks für die aktuelle (oder per ?von= angefragte) Woche.
// Optional: ?kategorie=arbeit|schule|privat filtert die Tasks.

import { tasksLaden, ERLAUBTE_KATEGORIEN } from '$lib/server/tasks.js';
import { alsIsoDatum, ausIsoDatum, wochenStart, heuteIso } from '$lib/datum.js';

export async function load({ url, locals }) {
  // --- Welche Woche soll angezeigt werden? ---
  const vonParam = url.searchParams.get('von');
  const startDatum = vonParam
    ? wochenStart(ausIsoDatum(vonParam))
    : wochenStart(new Date());

  const endeDatum = new Date(startDatum);
  endeDatum.setDate(endeDatum.getDate() + 6);

  const wStartIso = alsIsoDatum(startDatum);
  const wEndeIso = alsIsoDatum(endeDatum);

  // --- Filter aus URL ---
  const kategorie = url.searchParams.get('kategorie');
  const aktiverFilter = ERLAUBTE_KATEGORIEN.includes(kategorie) ? kategorie : 'alle';

  // --- Tasks laden, optional gefiltert ---
  const filter = { von: wStartIso, bis: wEndeIso };
  if (aktiverFilter !== 'alle') {
    filter.kategorie = aktiverFilter;
  }
  const tasks = await tasksLaden(locals.user.id, filter);

  return {
    tasks,
    wStartIso,
    wEndeIso,
    aktiverFilter,
    heuteIso: heuteIso()
  };
}
