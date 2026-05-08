<script>
  import { WOCHENTAGE_KURZ } from '$lib/datum.js';

  // --- Props ---
  let { tag, tasks, istHeute, href } = $props();
</script>

<a class="tag" class:heute={istHeute} {href}>
  <div class="tag-kopf">
    <div class="wochentag">{WOCHENTAGE_KURZ[tag.getDay()]}</div>
    <div class="tag-num">{tag.getDate()}</div>
  </div>
  <div class="tag-tasks">
    {#if tasks.length === 0}
      <span class="leer">Keine Aufgaben</span>
    {:else}
      {#each tasks as t (t.id)}
        <span class="mini-task kat-{t.kategorie}" class:erledigt={t.erledigt}>
          {t.titel}
        </span>
      {/each}
    {/if}
  </div>
</a>

<style>
  .tag {
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-gross);
    overflow: hidden;
    min-height: 280px;
    background: var(--farbe-hg-weiss);
    display: flex;
    flex-direction: column;
    transition: border-color 0.15s;
    text-decoration: none;
    color: inherit;
  }
  .tag:hover {
    border-color: var(--farbe-primaer-akzent);
    text-decoration: none;
  }
  .tag.heute {
    border-color: var(--farbe-primaer);
  }

  /* --- Tag-Kopf (Wochentag + Datum) --- */
  .tag-kopf {
    padding: 12px 8px;
    text-align: center;
    border-bottom: 1px solid var(--farbe-border);
  }
  .tag.heute .tag-kopf {
    background: var(--farbe-primaer-hell);
  }
  .wochentag {
    font-size: 10px;
    font-weight: 700;
    color: var(--farbe-text-sehr-hell);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .tag-num {
    font-size: 18px;
    font-weight: 700;
    color: var(--farbe-text);
    margin-top: 3px;
  }
  .tag.heute .tag-num {
    color: var(--farbe-primaer);
  }

  /* --- Mini-Task-Liste --- */
  .tag-tasks {
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
  }
  .leer {
    font-size: 12px;
    color: var(--farbe-text-extra-hell);
    font-style: italic;
    padding: 8px 4px;
    text-align: center;
  }
  .mini-task {
    background: var(--farbe-hg-grauer);
    border-radius: 6px;
    padding: 5px 7px;
    font-size: 11px;
    color: var(--farbe-text-mittel);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mini-task.kat-arbeit {
    background: var(--kat-arbeit-bg);
    color: var(--kat-arbeit-text);
  }
  .mini-task.kat-schule {
    background: var(--kat-schule-bg);
    color: var(--kat-schule-text);
  }
  .mini-task.kat-privat {
    background: var(--kat-privat-bg);
    color: var(--kat-privat-text);
  }
  .mini-task.erledigt {
    background: var(--farbe-hg-grauer);
    color: var(--farbe-text-extra-hell);
    text-decoration: line-through;
  }
</style>
