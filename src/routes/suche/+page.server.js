// src/routes/suche/+page.server.js
// Lädt Suchergebnisse mit Volltextsuche und optionalen Filtern.

import { tasksSuchen, ERLAUBTE_KATEGORIEN } from '$lib/server/tasks.js';

export async function load({ url, locals }) {
  const suchbegriff = url.searchParams.get('q') ?? '';

  const kategorieRoh = url.searchParams.get('kategorie');
  const aktiveKategorie = ERLAUBTE_KATEGORIEN.includes(kategorieRoh)
    ? kategorieRoh
    : 'alle';

  const statusRoh = url.searchParams.get('status');
  const aktiverStatus = ['offen', 'erledigt'].includes(statusRoh)
    ? statusRoh
    : 'alle';

  // Suche nur ausführen, wenn ein Suchbegriff ODER ein Filter gesetzt ist.
  const hatFilter =
    suchbegriff.trim().length > 0 ||
    aktiveKategorie !== 'alle' ||
    aktiverStatus !== 'alle';

  const treffer = hatFilter
    ? await tasksSuchen(locals.user.id, {
        suchbegriff,
        kategorie: aktiveKategorie !== 'alle' ? aktiveKategorie : undefined,
        status: aktiverStatus !== 'alle' ? aktiverStatus : undefined
      })
    : [];

  return {
    suchbegriff,
    aktiveKategorie,
    aktiverStatus,
    treffer,
    hatFilter
  };
}
