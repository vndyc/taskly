<script>
  import { enhance } from '$app/forms';
  import { alsLangeAnzeige, heuteIso } from '$lib/datum.js';

  // --- Props ---
  let { task, onSchliessen } = $props();

  // --- Lokaler State ---
  let neuesDatum = $state('');

  $effect(() => {
    // Bei jedem neuen task das neuesDatum auf dessen Fälligkeit setzen.
    neuesDatum = task.faelligkeitsDatum;
  });

  // Hübsch formatierte Datums-Anzeige für die Vorschau-Box.
  const datumsAnzeige = $derived(neuesDatum ? alsLangeAnzeige(neuesDatum) : '');

  /** Klick auf das dunkle Overlay (nicht auf das Modal selbst) schliesst. */
  function ueberlagerungKlick(event) {
    if (event.target === event.currentTarget) {
      onSchliessen?.();
    }
  }

  /** Escape-Taste schliesst den Dialog. */
  function escapeTaste(event) {
    if (event.key === 'Escape') {
      onSchliessen?.();
    }
  }

  /**
   * use:enhance-Callback. Läuft vor dem Submit und liefert eine
   * Funktion, die nach der Server-Antwort ausgeführt wird:
   * Erst Standard-Update (UI/Daten), dann Modal schliessen.
   */
  function submitHandler() {
    return async ({ result, update }) => {
      await update();
      if (result.type === 'success' || result.type === 'redirect') {
        onSchliessen?.();
      }
    };
  }
</script>

<div
  class="ueberlagerung"
  onclick={ueberlagerungKlick}
  onkeydown={escapeTaste}
  role="dialog"
  tabindex="-1"
  aria-modal="true"
  aria-labelledby="verschieben-titel"
>
  <div class="modal">
    <h2 id="verschieben-titel">Aufgabe verschieben</h2>
    <p class="sub">Wähle ein neues Datum für „{task.titel}"</p>

    <form method="POST" action="?/verschieben" use:enhance={submitHandler}>
      <input type="hidden" name="id" value={task.id} />

      <label class="feld">
        <span>Neues Datum</span>
        <input
          type="date"
          name="neuesDatum"
          bind:value={neuesDatum}
          min={heuteIso()}
          required
        />
      </label>

      {#if neuesDatum}
        <div class="vorschau">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <div>
            <div class="vorschau-label">NEUES DATUM</div>
            <div class="vorschau-wert">{datumsAnzeige}</div>
          </div>
        </div>
      {/if}

      <div class="aktionen">
        <button
          type="button"
          class="btn-sekundaer"
          onclick={() => onSchliessen?.()}
        >
          Abbrechen
        </button>
        <button type="submit" class="btn-primaer">
          Verschieben
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .ueberlagerung {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    background: var(--farbe-hg-weiss);
    border-radius: var(--radius-gross);
    box-shadow: var(--schatten-modal);
    padding: 32px;
    max-width: 480px;
    width: 100%;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 6px;
    color: var(--farbe-text);
  }
  .sub {
    font-size: 13px;
    color: var(--farbe-text-hell);
    margin-bottom: 24px;
  }

  /* --- Datums-Feld --- */
  .feld {
    display: block;
    margin-bottom: 20px;
  }
  .feld span {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--farbe-text-mittel);
    margin-bottom: 6px;
  }
  .feld input {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-mittel);
    font-size: 14px;
    font-family: inherit;
  }
  .feld input:focus {
    outline: none;
    border-color: var(--farbe-primaer);
  }

  /* --- Vorschau-Box --- */
  .vorschau {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--farbe-primaer-hell);
    border-radius: var(--radius-mittel);
    padding: 14px 16px;
    color: var(--farbe-primaer);
    margin-bottom: 20px;
  }
  .vorschau-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--farbe-text-mittel);
  }
  .vorschau-wert {
    font-size: 15px;
    font-weight: 700;
    color: var(--farbe-primaer);
  }

  /* --- Aktionen --- */
  .aktionen {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
</style>
