<script>
  import { enhance } from '$app/forms';

  // --- Props ---
  let { task, action = '?/loeschen', onSchliessen } = $props();

  /** Klick auf das Overlay (nicht auf das Modal selbst) schliesst. */
  function ueberlagerungKlick(event) {
    if (event.target === event.currentTarget) onSchliessen?.();
  }

  /** Escape-Taste schliesst den Dialog. */
  function escapeTaste(event) {
    if (event.key === 'Escape') onSchliessen?.();
  }

  /**
   * use:enhance-Callback: nach Server-Antwort zuerst Standard-Update,
   * dann Modal schliessen — aber nur bei Erfolg.
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
  aria-labelledby="loeschen-titel"
>
  <div class="modal">
    <h2 id="loeschen-titel">Aufgabe löschen?</h2>
    <p class="sub">
      „{task.titel}" wird unwiderruflich gelöscht. Bist du sicher?
    </p>

    <form method="POST" {action} use:enhance={submitHandler}>
      <input type="hidden" name="id" value={task.id} />
      <div class="aktionen">
        <button
          type="button"
          class="btn-sekundaer"
          onclick={() => onSchliessen?.()}
        >
          Abbrechen
        </button>
        <button type="submit" class="btn-gefahr">
          Löschen
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
    color: var(--farbe-text-mittel);
    margin-bottom: 24px;
    line-height: 1.5;
  }
  .aktionen {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
</style>
