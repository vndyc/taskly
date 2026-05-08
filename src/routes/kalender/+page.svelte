<script>
  import WochenNavigation from '$lib/components/WochenNavigation.svelte';
  import WochenTag from '$lib/components/WochenTag.svelte';
  import {
    ausIsoDatum,
    alsIsoDatum,
    alsWochenAnzeige,
    tageDerWoche,
    wochenStart
  } from '$lib/datum.js';

  // --- Props ---
  let { data } = $props();

  // Anzeige-Namen für die Kategorien (gross geschrieben).
  const KATEGORIE_NAMEN = { arbeit: 'Arbeit', schule: 'Schule', privat: 'Privat' };

  // --- Abgeleitete Werte ---
  const wStart = $derived(ausIsoDatum(data.wStartIso));
  const wEnde = $derived(ausIsoDatum(data.wEndeIso));
  const wochenLabel = $derived(alsWochenAnzeige(wStart, wEnde));
  const tage = $derived(tageDerWoche(wStart));

  const vorherigeWoche = $derived.by(() => {
    const d = new Date(wStart);
    d.setDate(d.getDate() - 7);
    return alsIsoDatum(d);
  });

  const naechsteWoche = $derived.by(() => {
    const d = new Date(wStart);
    d.setDate(d.getDate() + 7);
    return alsIsoDatum(d);
  });

  const aktuelleWoche = $derived(alsIsoDatum(wochenStart(new Date())));

  /** Liefert die Tasks, die an einem bestimmten Tag fällig sind. */
  function tasksFuerTag(tag) {
    const iso = alsIsoDatum(tag);
    return data.tasks.filter((t) => t.faelligkeitsDatum === iso);
  }

  /** Baut die Filter-URL (behält ?von= bei und setzt/entfernt ?kategorie=). */
  function filterUrl(filter) {
    const params = new URLSearchParams();
    params.set('von', data.wStartIso);
    if (filter !== 'alle') params.set('kategorie', filter);
    return `?${params.toString()}`;
  }
</script>

<svelte:head>
  <title>Kalender – Taskly</title>
</svelte:head>

<div class="seite">
  <header class="kopf">
    <h1>Wochenansicht</h1>
    <WochenNavigation
      {vorherigeWoche}
      {naechsteWoche}
      {aktuelleWoche}
      {wochenLabel}
    />
  </header>

  <div class="filter">
    {#each ['alle', 'arbeit', 'schule', 'privat'] as f (f)}
      <a
        class="chip"
        class:aktiv={data.aktiverFilter === f}
        href={filterUrl(f)}
      >
        {f === 'alle' ? 'Alle' : KATEGORIE_NAMEN[f]}
      </a>
    {/each}
  </div>

  <div class="wochen-grid">
    {#each tage as tag (alsIsoDatum(tag))}
      {@const iso = alsIsoDatum(tag)}
      <WochenTag
        {tag}
        tasks={tasksFuerTag(tag)}
        istHeute={iso === data.heuteIso}
        href="/kalender/{iso}"
      />
    {/each}
  </div>
</div>

<style>
  .seite {
    padding: 36px 48px;
  }

  .kopf {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--farbe-text);
  }

  /* --- Kategorie-Filter (Chips) --- */
  .filter {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .chip {
    padding: 6px 16px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
    border: 1.5px solid var(--farbe-border);
    background: var(--farbe-hg-weiss);
    color: var(--farbe-text-mittel);
    text-decoration: none;
  }
  .chip:hover {
    text-decoration: none;
    border-color: var(--farbe-text-extra-hell);
  }
  .chip.aktiv {
    background: var(--farbe-primaer);
    border-color: var(--farbe-primaer);
    color: var(--farbe-hg-weiss);
  }

  /* --- Wochen-Grid (7 Tage) --- */
  .wochen-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
  }
  @media (max-width: 1024px) {
    .wochen-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (max-width: 640px) {
    .wochen-grid {
      grid-template-columns: 1fr 1fr;
    }
    .seite {
      padding: 24px;
    }
  }
</style>
