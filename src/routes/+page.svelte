<script>
  import { goto } from '$app/navigation';
  import TaskKarte from '$lib/components/TaskKarte.svelte';
  import { alsHeaderDatum } from '$lib/datum.js';

  // --- Props ---
  let { data } = $props();

  const heuteHeader = alsHeaderDatum(new Date());

  // --- Abgeleitete Werte ---
  const heutigeTasks = $derived(
    data.tasks.filter((t) => t.faelligkeitsDatum === data.heuteIso)
  );

  const heuteErledigt = $derived(
    heutigeTasks.filter((t) => t.erledigt).length
  );

  const wocheErledigt = $derived(
    data.tasks.filter((t) => t.erledigt).length
  );

  // Tageszeit-abhängige Begrüssung mit User-Namen.
  const begruessung = $derived.by(() => {
    const stunde = new Date().getHours();
    const teil = stunde < 11 ? 'Guten Morgen' : stunde < 18 ? 'Guten Tag' : 'Guten Abend';
    return data.user?.name ? `${teil}, ${data.user.name}` : teil;
  });

  // Anzahl Aufgaben pro Kategorie für heute.
  const kategorienHeute = $derived.by(() => {
    const zaehler = { arbeit: 0, schule: 0, privat: 0 };
    for (const t of heutigeTasks) {
      zaehler[t.kategorie] = (zaehler[t.kategorie] ?? 0) + 1;
    }
    return zaehler;
  });

  function neueAufgabe() {
    goto('/aufgabe/neu');
  }
</script>

<svelte:head>
  <title>Home – Taskly</title>
</svelte:head>

<div class="layout">
  <aside class="sidebar">
    <div class="gruss">
      <h2>{begruessung}</h2>
      <p>Was planst du heute zu tun?</p>
    </div>

    {#if heutigeTasks.length > 0}
      <div class="fortschritt">
        <div class="fortschritt-text">
          {heuteErledigt} von {heutigeTasks.length} Aufgaben heute
        </div>
        <div class="fortschritt-bar">
          <div
            class="fortschritt-fuellung"
            style="width: {(heuteErledigt / heutigeTasks.length) * 100}%"
          ></div>
        </div>
      </div>
    {/if}

    <div class="stat">
      <div class="stat-label">Heute erledigt</div>
      <div class="stat-wert">
        <strong>{heuteErledigt}</strong>
        <span class="stat-total"> / {heutigeTasks.length}</span>
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">Erledigt diese Woche</div>
      <div class="stat-wert">
        <strong>{wocheErledigt}</strong>
      </div>
    </div>

    <div class="kat-block">
      <div class="kat-titel">Kategorien heute</div>
      <div class="kat-zeile">
        <span class="kat-dot" style="background: var(--kat-arbeit-dot)"></span>
        <span>Arbeit</span>
        <span class="kat-zaehler">{kategorienHeute.arbeit}</span>
      </div>
      <div class="kat-zeile">
        <span class="kat-dot" style="background: var(--kat-schule-dot)"></span>
        <span>Schule</span>
        <span class="kat-zaehler">{kategorienHeute.schule}</span>
      </div>
      <div class="kat-zeile">
        <span class="kat-dot" style="background: var(--kat-privat-dot)"></span>
        <span>Privat</span>
        <span class="kat-zaehler">{kategorienHeute.privat}</span>
      </div>
    </div>
  </aside>

  <section class="main">
    <div class="kopf">
      <h1>Heutige Tasks – {heuteHeader}</h1>
      <button type="button" class="btn-primaer" onclick={neueAufgabe}>
        <span>+</span> Neue Aufgabe
      </button>
    </div>

    {#if heutigeTasks.length === 0}
      <div class="leer">
        <div class="leer-emoji" aria-hidden="true">🌱</div>
        <p class="leer-titel">Heute ist noch unbeschrieben</p>
        <p class="leer-sub">Was möchtest du heute angehen?</p>
        <button type="button" class="btn-primaer" onclick={neueAufgabe}>
          Erste Aufgabe erstellen
        </button>
      </div>
    {:else}
      <div class="task-grid">
        {#each heutigeTasks as task (task.id)}
          <TaskKarte {task} />
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    min-height: calc(100vh - 60px);
  }

  /* --- Sidebar --- */
  .sidebar {
    border-right: 1px solid var(--farbe-border);
    padding: 32px 24px;
    background: var(--farbe-hg-grau);
  }

  .gruss h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--farbe-text);
    margin-bottom: 4px;
  }
  .gruss p {
    font-size: 13px;
    color: var(--farbe-text-hell);
    margin-bottom: 28px;
  }

  /* --- Stats-Karten --- */
  .stat {
    background: var(--farbe-hg-weiss);
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-gross);
    padding: 16px 18px;
    margin-bottom: 12px;
  }
  .stat-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--farbe-text-sehr-hell);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .stat-wert strong {
    font-size: 28px;
    font-weight: 700;
    color: var(--farbe-primaer);
  }
  .stat-total {
    font-size: 14px;
    color: var(--farbe-text-extra-hell);
    font-weight: 600;
  }

  /* --- Kategorien-Block --- */
  .kat-block {
    margin-top: 24px;
  }
  .kat-titel {
    font-size: 11px;
    font-weight: 600;
    color: var(--farbe-text-sehr-hell);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }
  .kat-zeile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--farbe-text-mittel);
  }
  .kat-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .kat-zaehler {
    margin-left: auto;
    font-size: 12px;
    color: var(--farbe-text-extra-hell);
    font-weight: 600;
  }

  /* --- Hauptbereich --- */
  .main {
    padding: 36px 48px;
  }
  .kopf {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .kopf h1 {
    font-size: 13px;
    font-weight: 700;
    color: var(--farbe-text-extra-hell);
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  .task-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  @media (max-width: 1100px) {
    .task-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .task-grid {
      grid-template-columns: 1fr;
    }
    .main {
      padding: 24px;
    }
  }

  /* --- Fortschrittsbalken --- */
  .fortschritt {
    margin-bottom: 24px;
  }
  .fortschritt-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--farbe-text-mittel);
    margin-bottom: 8px;
  }
  .fortschritt-bar {
    width: 100%;
    height: 8px;
    background: var(--farbe-hg-grauer);
    border-radius: 99px;
    overflow: hidden;
  }
  .fortschritt-fuellung {
    height: 100%;
    background: var(--farbe-primaer);
    border-radius: 99px;
    transition: width 0.3s ease;
  }

  /* --- Leerer Zustand --- */
  .leer {
    text-align: center;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
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
    margin-bottom: 8px;
  }
</style>
