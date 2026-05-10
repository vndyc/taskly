<script>
  import { goto } from '$app/navigation';
  import TaskZeile from '$lib/components/TaskZeile.svelte';
  import VerschiebenModal from '$lib/components/VerschiebenModal.svelte';
  import {
    ausIsoDatum,
    alsIsoDatum,
    alsLangeAnzeige,
    WOCHENTAGE_KURZ,
    MONATE_LANG
  } from '$lib/datum.js';

  // --- Props ---
  let { data } = $props();

  // --- Lokaler State ---
  let zuVerschieben = $state(null);

  // --- Abgeleitete Werte ---
  const datumObj = $derived(ausIsoDatum(data.datum));
  const langeAnzeige = $derived(alsLangeAnzeige(data.datum));

  const offenAnzahl = $derived(data.tagesTasks.filter((t) => !t.erledigt).length);
  const erledigtAnzahl = $derived(data.tagesTasks.filter((t) => t.erledigt).length);

  // Mini-Kalender Daten: alle Tage des Monats mit Leerzellen für Vor-1.-Tage.
  const miniKalender = $derived.by(() => {
    const jahr = datumObj.getFullYear();
    const monat = datumObj.getMonth();
    const erster = new Date(jahr, monat, 1);
    const tage = [];

    // Leerzellen für Wochentage vor dem 1.
    const startTag = erster.getDay();
    for (let i = 0; i < startTag; i++) tage.push(null);

    // Tage des Monats
    const letzter = new Date(jahr, monat + 1, 0).getDate();
    for (let t = 1; t <= letzter; t++) {
      tage.push({ tag: t, iso: alsIsoDatum(new Date(jahr, monat, t)) });
    }
    return { tage, monatName: MONATE_LANG[monat], jahr };
  });

  // Set aller Iso-Datumswerte mit Tasks (für visuelle Markierung im Mini-Kalender).
  const tagesIsoSet = $derived(new Set(data.monatTasks.map((t) => t.faelligkeitsDatum)));

  // ISO-Datum des 1. im Vor- bzw. Folgemonat (für Mini-Kalender-Navigation).
  const vorherigerMonat = $derived.by(() => {
    const d = new Date(datumObj.getFullYear(), datumObj.getMonth() - 1, 1);
    return alsIsoDatum(d);
  });

  const naechsterMonat = $derived.by(() => {
    const d = new Date(datumObj.getFullYear(), datumObj.getMonth() + 1, 1);
    return alsIsoDatum(d);
  });

  function neueAufgabe() {
    const zurueck = encodeURIComponent(`/kalender/${data.datum}`);
    goto(`/aufgabe/neu?datum=${data.datum}&zurueck=${zurueck}`);
  }

  function tagWaehlen(iso) {
    goto(`/kalender/${iso}`);
  }

  function modalSchliessen() {
    zuVerschieben = null;
  }
</script>

<svelte:head>
  <title>{langeAnzeige} – Taskly</title>
</svelte:head>

<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-sub">Tagesansicht</div>

    <div class="mini-kal">
      <div class="monats-nav">
        <a
          class="monats-btn"
          href="/kalender/{vorherigerMonat}"
          aria-label="Vorheriger Monat"
        >‹</a>
        <span class="monats-label">{miniKalender.monatName} {miniKalender.jahr}</span>
        <a
          class="monats-btn"
          href="/kalender/{naechsterMonat}"
          aria-label="Nächster Monat"
        >›</a>
      </div>

      <div class="mini-grid">
        {#each WOCHENTAGE_KURZ as wt (wt)}
          <div class="mini-zelle kopf">{wt}</div>
        {/each}
        {#each miniKalender.tage as zelle, i (i)}
          {#if zelle === null}
            <div class="mini-zelle leer"></div>
          {:else}
            <button
              type="button"
              class="mini-zelle"
              class:aktiv={zelle.iso === data.datum}
              class:hat-tasks={tagesIsoSet.has(zelle.iso)}
              onclick={() => tagWaehlen(zelle.iso)}
            >
              {zelle.tag}
            </button>
          {/if}
        {/each}
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">Offen heute</div>
      <div class="stat-wert">{offenAnzahl}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Erledigt heute</div>
      <div class="stat-wert">{erledigtAnzahl}</div>
    </div>
  </aside>

  <section class="main">
    <a href="/kalender" class="zurueck">← Zurück zur Wochenansicht</a>

    <div class="kopf">
      <div>
        <h1>{langeAnzeige}</h1>
        <div class="sub">{offenAnzahl} offen, {erledigtAnzahl} erledigt</div>
      </div>
      <button type="button" class="btn-primaer" onclick={neueAufgabe}>
        <span>+</span> Neue Aufgabe
      </button>
    </div>

    {#if data.tagesTasks.length === 0}
      <div class="leer">
        <p>Keine Aufgaben für diesen Tag.</p>
        <button type="button" class="btn-primaer" onclick={neueAufgabe}>
          Aufgabe hinzufügen
        </button>
      </div>
    {:else}
      <div class="liste">
        {#each data.tagesTasks as task (task.id)}
          <TaskZeile
            {task}
            onVerschieben={(t) => (zuVerschieben = t)}
            zurueck="/kalender/{data.datum}"
          />
        {/each}
      </div>
    {/if}
  </section>
</div>

{#if zuVerschieben}
  <VerschiebenModal task={zuVerschieben} onSchliessen={modalSchliessen} />
{/if}

<style>
  .layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: calc(100vh - 60px);
  }

  /* --- Sidebar --- */
  .sidebar {
    border-right: 1px solid var(--farbe-border);
    padding: 32px 24px;
    background: var(--farbe-hg-grau);
    overflow: hidden;
    min-width: 0;
  }
  .sidebar-sub {
    font-size: 12px;
    color: var(--farbe-text-sehr-hell);
    margin-bottom: 20px;
  }

  /* --- Monats-Navigation --- */
  .monats-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .monats-btn {
    width: 26px;
    height: 26px;
    border-radius: 5px;
    background: var(--farbe-hg-grauer);
    font-size: 14px;
    color: var(--farbe-text-mittel);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }
  .monats-btn:hover {
    background: var(--farbe-border);
    text-decoration: none;
  }
  .monats-label {
    font-size: 13px;
    font-weight: 700;
    color: var(--farbe-text);
  }

  /* --- Mini-Kalender --- */
  .mini-kal {
    background: var(--farbe-hg-weiss);
    border: 1px solid var(--farbe-border);
    border-radius: var(--radius-gross);
    padding: 14px;
    margin-bottom: 24px;
    width: 100%;
    box-sizing: border-box;
  }
.mini-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: 28px;
  column-gap: 2px;
  row-gap: 4px;
  width: 100%;
}
  .mini-zelle {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--farbe-text-mittel);
    border-radius: 5px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
  }
  .mini-zelle.kopf {
    color: var(--farbe-text-extra-hell);
    font-weight: 600;
    cursor: default;
  }
  .mini-zelle.leer {
    visibility: hidden;
  }
  .mini-zelle:not(.kopf):not(.leer):hover {
    background: var(--farbe-hg-grauer);
  }
  .mini-zelle.hat-tasks {
    font-weight: 700;
    color: var(--farbe-primaer);
  }
  .mini-zelle.aktiv {
    background: var(--farbe-primaer);
    color: var(--farbe-hg-weiss) !important;
    font-weight: 700;
  }

  /* --- Stats --- */
  .stat {
    background: var(--farbe-hg-weiss);
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-gross);
    padding: 14px 16px;
    margin-bottom: 8px;
  }
  .stat-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--farbe-text-extra-hell);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .stat-wert {
    font-size: 22px;
    font-weight: 700;
    color: var(--farbe-primaer);
  }

  /* --- Hauptbereich --- */
  .main {
    padding: 36px 48px;
  }
  .zurueck {
    display: inline-block;
    font-size: 13px;
    color: var(--farbe-text-mittel);
    margin-bottom: 16px;
    text-decoration: none;
  }
  .zurueck:hover {
    color: var(--farbe-primaer);
  }
  .kopf {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 16px;
    flex-wrap: wrap;
  }
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--farbe-text);
  }
  .sub {
    font-size: 13px;
    color: var(--farbe-text-hell);
    margin-top: 4px;
  }
  .liste {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .leer {
    text-align: center;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .leer p {
    font-size: 15px;
    color: var(--farbe-text-hell);
  }

  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .main {
      padding: 24px;
    }
  }
</style>
