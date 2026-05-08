<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  // --- Props ---
  let { task } = $props();

  // Anzeige-Namen für die Kategorien (gross geschrieben).
  const KATEGORIE_NAMEN = {
    arbeit: 'Arbeit',
    schule: 'Schule',
    privat: 'Privat'
  };

  /** Öffnet die Detail-/Bearbeiten-Seite der Aufgabe. */
  function oeffnen() {
    goto(`/aufgabe/${task.id}`);
  }

  /**
   * Verhindert, dass ein Klick auf die Checkbox die ganze Karte
   * navigieren lässt — das Toggle-Form übernimmt den Klick selbst.
   */
  function checkboxKlick(event) {
    event.stopPropagation();
  }
</script>

<div
  class="karte"
  class:erledigt={task.erledigt}
  role="button"
  tabindex="0"
  onclick={oeffnen}
  onkeydown={(e) => (e.key === 'Enter' ? oeffnen() : null)}
>
  <div class="oben">
    <form
      method="POST"
      action="/?/erledigtToggeln"
      use:enhance
    >
      <input type="hidden" name="id" value={task.id} />
      <input type="hidden" name="erledigt" value={!task.erledigt} />
      <button
        type="submit"
        class="checkbox"
        class:checked={task.erledigt}
        onclick={checkboxKlick}
        aria-label={task.erledigt ? 'Als nicht erledigt markieren' : 'Als erledigt markieren'}
      ></button>
    </form>
    <span class="titel">{task.titel}</span>
  </div>
  <span class="kat-badge kat-{task.kategorie}">{KATEGORIE_NAMEN[task.kategorie]}</span>
</div>

<style>
  .karte {
    text-align: left;
    width: 100%;
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-grosser);
    padding: 16px 18px;
    background: var(--farbe-hg-weiss);
    transition: border-color 0.15s, box-shadow 0.15s;
    display: block;
    cursor: pointer;
  }

  .karte:hover {
    border-color: var(--farbe-primaer-mittel);
    box-shadow: var(--schatten-karte);
  }

  .karte.erledigt {
    background: #fafffe;
    border-color: #e0f4f2;
  }

  .karte:focus-visible {
    outline: 2px solid var(--farbe-primaer);
    outline-offset: 2px;
  }

  .oben {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 8px;
  }

  /* Form-Wrapper soll keine eigene Höhe um die Checkbox machen. */
  form {
    margin: 0;
    padding: 0;
    line-height: 0;
  }

  .checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid var(--farbe-border-stark);
    border-radius: 5px;
    flex-shrink: 0;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    background: var(--farbe-hg-weiss);
    padding: 0;
  }

  .checkbox.checked {
    background: var(--farbe-primaer);
    border-color: var(--farbe-primaer);
  }

  .checkbox.checked::after {
    content: '';
    display: block;
    width: 5px;
    height: 9px;
    border: 2px solid var(--farbe-hg-weiss);
    border-top: none;
    border-left: none;
    transform: rotate(45deg) translate(-1px, -1px);
  }

  .titel {
    font-size: 14px;
    font-weight: 600;
    color: var(--farbe-text);
    line-height: 1.35;
  }

  .karte.erledigt .titel {
    text-decoration: line-through;
    color: var(--farbe-text-extra-hell);
  }
</style>
