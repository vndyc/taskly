<script>
  import TaskKarte from '$lib/components/TaskKarte.svelte';

  // --- Props ---
  let { data } = $props();

  // Anzeige-Namen für die Kategorien (gross geschrieben).
  const KATEGORIE_NAMEN = { arbeit: 'Arbeit', schule: 'Schule', privat: 'Privat' };

  // --- Lokaler State für die Filter-Pills ---
  // Wird direkt von den Buttons gesetzt und über versteckte Inputs
  // beim Submit ans Form weitergereicht.
  let aktiveKategorie = $state(data.aktiveKategorie);
  let aktiverStatus = $state(data.aktiverStatus);

  // Sync mit Server-Daten, falls die URL-Parameter sich ändern
  // (z.B. nach Submit, Browser-Back oder externem Link).
  $effect(() => {
    aktiveKategorie = data.aktiveKategorie;
    aktiverStatus = data.aktiverStatus;
  });
</script>

<svelte:head>
  <title>Suche – Taskly</title>
</svelte:head>

<div class="seite">
  <header class="kopf">
    <h1>Aufgaben suchen</h1>
    <p class="sub">Finde Aufgaben nach Begriff, Kategorie oder Status.</p>
  </header>

  <form method="GET" class="suchformular">
    <div class="suchfeld">
      <span class="such-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="search"
        name="q"
        placeholder="Suchbegriff eingeben…"
        value={data.suchbegriff}
        aria-label="Suchbegriff"
      />
    </div>

    <div class="filter-block">
      <div class="filter-label">Kategorie</div>
      <div class="filter-pills">
        {#each ['alle', 'arbeit', 'schule', 'privat'] as k (k)}
          <button
            type="button"
            class="chip"
            class:aktiv={aktiveKategorie === k}
            onclick={() => (aktiveKategorie = k)}
          >
            {k === 'alle' ? 'Alle' : KATEGORIE_NAMEN[k]}
          </button>
        {/each}
      </div>
      <input
        type="hidden"
        name="kategorie"
        value={aktiveKategorie === 'alle' ? '' : aktiveKategorie}
      />
    </div>

    <div class="filter-block">
      <div class="filter-label">Status</div>
      <div class="filter-pills">
        {#each [
          { wert: 'alle', label: 'Alle' },
          { wert: 'offen', label: 'Offen' },
          { wert: 'erledigt', label: 'Erledigt' }
        ] as s (s.wert)}
          <button
            type="button"
            class="chip"
            class:aktiv={aktiverStatus === s.wert}
            onclick={() => (aktiverStatus = s.wert)}
          >
            {s.label}
          </button>
        {/each}
      </div>
      <input
        type="hidden"
        name="status"
        value={aktiverStatus === 'alle' ? '' : aktiverStatus}
      />
    </div>

    <div class="formular-aktionen">
      <a href="/suche" class="btn-sekundaer">Filter zurücksetzen</a>
      <button type="submit" class="btn-primaer">Suchen</button>
    </div>
  </form>

  {#if !data.hatFilter}
    <div class="leer">
      <div class="leer-emoji" aria-hidden="true">🔍</div>
      <p class="leer-titel">Bereit zum Suchen</p>
      <p class="leer-sub">Gib einen Suchbegriff ein oder setze einen Filter.</p>
    </div>
  {:else if data.treffer.length === 0}
    <div class="leer">
      <div class="leer-emoji" aria-hidden="true">🤷</div>
      <p class="leer-titel">Keine Aufgaben gefunden</p>
      <p class="leer-sub">Probiere andere Suchbegriffe oder Filter.</p>
    </div>
  {:else}
    <div class="ergebnisse">
      <p class="ergebnisse-anzahl">
        {data.treffer.length}
        {data.treffer.length === 1 ? 'Aufgabe' : 'Aufgaben'} gefunden
      </p>
      <div class="treffer-grid">
        {#each data.treffer as task (task.id)}
          {@const params = new URLSearchParams(
            Object.fromEntries(
              [
                ['q', data.suchbegriff],
                ['kategorie', aktiveKategorie === 'alle' ? '' : aktiveKategorie],
                ['status', aktiverStatus === 'alle' ? '' : aktiverStatus]
              ].filter(([_, v]) => v)
            )
          ).toString()}
          <TaskKarte
            {task}
            zurueck={params ? `/suche?${params}` : '/suche'}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .seite {
    padding: 36px 48px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .kopf {
    margin-bottom: 28px;
  }
  h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--farbe-text);
    margin-bottom: 4px;
  }
  .sub {
    font-size: 13px;
    color: var(--farbe-text-hell);
  }

  /* --- Suchformular --- */
  .suchformular {
    background: var(--farbe-hg-weiss);
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-gross);
    padding: 24px;
    margin-bottom: 28px;
  }
  .suchfeld {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--farbe-hg-grauer);
    border-radius: var(--radius-mittel);
    padding: 10px 16px;
    margin-bottom: 20px;
  }
  .such-icon {
    color: var(--farbe-text-extra-hell);
    display: flex;
    align-items: center;
  }
  .suchfeld input {
    border: none;
    background: none;
    outline: none;
    font-size: 15px;
    color: var(--farbe-text);
    flex: 1;
  }
  .suchfeld input::placeholder {
    color: var(--farbe-text-extra-hell);
  }
  .suchfeld:focus-within {
    background: var(--farbe-hg-weiss);
    box-shadow: 0 0 0 1.5px var(--farbe-primaer);
  }

  /* --- Filter-Blöcke --- */
  .filter-block {
    margin-bottom: 16px;
  }
  .filter-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--farbe-text-mittel);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
  }
  .filter-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .chip {
    padding: 6px 16px;
    border-radius: 99px;
    font-size: 13px;
    font-weight: 600;
    border: 1.5px solid var(--farbe-border);
    background: var(--farbe-hg-weiss);
    color: var(--farbe-text-mittel);
    cursor: pointer;
    transition: all 0.15s;
  }
  .chip:hover {
    border-color: var(--farbe-text-extra-hell);
  }
  .chip.aktiv {
    background: var(--farbe-primaer);
    border-color: var(--farbe-primaer);
    color: var(--farbe-hg-weiss);
  }

  /* --- Aktionen --- */
  .formular-aktionen {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: flex-end;
    align-items: center;
  }
  .formular-aktionen .btn-sekundaer {
    text-decoration: none;
  }

  /* --- Ergebnisse --- */
  .ergebnisse-anzahl {
    font-size: 13px;
    color: var(--farbe-text-mittel);
    margin-bottom: 16px;
  }
  .treffer-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  @media (max-width: 1100px) {
    .treffer-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 768px) {
    .seite {
      padding: 24px;
    }
    .treffer-grid {
      grid-template-columns: 1fr;
    }
  }

  /* --- Leerzustände --- */
  .leer {
    text-align: center;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .leer-emoji {
    font-size: 48px;
    line-height: 1;
  }
  .leer-titel {
    font-size: 18px;
    font-weight: 700;
    color: var(--farbe-text);
    margin-top: 8px;
  }
  .leer-sub {
    font-size: 14px;
    color: var(--farbe-text-hell);
  }
</style>
