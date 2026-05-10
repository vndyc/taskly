<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { ausIsoDatum, heuteIso } from '$lib/datum.js';

  // --- Props ---
  let { task } = $props();

  const KATEGORIE_NAMEN = {
    arbeit: 'Arbeit',
    schule: 'Schule',
    privat: 'Privat'
  };

  // Wie viele Tage liegt die Aufgabe in der Vergangenheit?
  const tageZurueck = $derived.by(() => {
    const heute = ausIsoDatum(heuteIso());
    const faellig = ausIsoDatum(task.faelligkeitsDatum);
    const diffMs = heute.getTime() - faellig.getTime();
    const diffTage = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffTage;
  });

  // Anzeige-Text für die Verspätung.
  const verspaetungsText = $derived.by(() => {
    if (tageZurueck === 1) return 'seit gestern';
    return `seit ${tageZurueck} Tagen`;
  });

  /** Öffnet die Bearbeiten-Seite mit Rücksprung zum Dashboard. */
  function oeffnen() {
    goto(`/aufgabe/${task.id}?zurueck=${encodeURIComponent('/')}`);
  }

  /** Verhindert, dass der Klick auf die Checkbox die Karte navigiert. */
  function checkboxKlick(event) {
    event.stopPropagation();
  }
</script>

<div
  class="karte"
  role="button"
  tabindex="0"
  onclick={oeffnen}
  onkeydown={(e) => (e.key === 'Enter' ? oeffnen() : null)}
>
  <form method="POST" action="/?/erledigtToggeln" use:enhance>
    <input type="hidden" name="id" value={task.id} />
    <input type="hidden" name="erledigt" value="true" />
    <button
      type="submit"
      class="checkbox"
      onclick={checkboxKlick}
      aria-label="Als erledigt markieren"
    ></button>
  </form>

  <div class="inhalt">
    <div class="oben">
      <span class="titel">{task.titel}</span>
      <span class="warnung">{verspaetungsText}</span>
    </div>
    <span class="kat-badge kat-{task.kategorie}">
      {KATEGORIE_NAMEN[task.kategorie]}
    </span>
  </div>
</div>

<style>
  .karte {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--farbe-hg-weiss);
    border: 1.5px solid #ffd0cc;
    border-left: 4px solid var(--farbe-fehler);
    border-radius: var(--radius-grosser);
    padding: 14px 18px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .karte:hover {
    border-color: var(--farbe-fehler);
    box-shadow: 0 4px 12px rgba(204, 68, 68, 0.08);
  }

  /* Form-Wrapper soll keine eigene Höhe um die Checkbox machen. */
  form {
    margin: 0;
    padding: 0;
    line-height: 0;
  }

  .checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid #ffb3b0;
    border-radius: 5px;
    flex-shrink: 0;
    background: var(--farbe-hg-weiss);
    cursor: pointer;
    padding: 0;
  }
  .checkbox:hover {
    border-color: var(--farbe-fehler);
  }

  .inhalt {
    flex: 1;
    min-width: 0;
  }
  .oben {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }
  .titel {
    font-size: 14px;
    font-weight: 600;
    color: var(--farbe-text);
    flex: 1;
    min-width: 0;
  }
  .warnung {
    font-size: 11px;
    font-weight: 600;
    color: var(--farbe-fehler);
    background: var(--farbe-fehler-bg);
    padding: 3px 8px;
    border-radius: 99px;
    white-space: nowrap;
  }
</style>
