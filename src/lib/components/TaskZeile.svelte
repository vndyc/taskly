<script>
  import { enhance } from '$app/forms';

  // --- Props ---
  let { task, onVerschieben } = $props();

  const KATEGORIE_NAMEN = {
    arbeit: 'Arbeit',
    schule: 'Schule',
    privat: 'Privat'
  };

  // --- Lokaler State ---
  let menuOffen = $state(false);

  function menuToggle() {
    menuOffen = !menuOffen;
  }

  function menuSchliessen() {
    menuOffen = false;
  }

  function verschieben() {
    menuSchliessen();
    onVerschieben?.(task);
  }

  function loeschenBestaetigen(event) {
    if (!confirm(`"${task.titel}" wirklich löschen?`)) {
      event.preventDefault();
    }
  }
</script>

<div class="zeile" class:erledigt={task.erledigt}>
  <div class="reihe">
    <div class="links">
      <form method="POST" action="?/erledigtToggeln" use:enhance>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="erledigt" value={!task.erledigt} />
        <button
          type="submit"
          class="checkbox"
          class:checked={task.erledigt}
          aria-label={task.erledigt ? 'Als nicht erledigt markieren' : 'Als erledigt markieren'}
        ></button>
      </form>

      <div class="inhalt">
        <div class="titel">{task.titel}</div>
        {#if task.beschreibung}
          <div class="beschreibung">{task.beschreibung}</div>
        {/if}
        <span class="kat-badge kat-{task.kategorie}">
          {KATEGORIE_NAMEN[task.kategorie]}
        </span>
        {#if task.notiz}
          <div class="notiz">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <em>Notiz: {task.notiz}</em>
          </div>
        {/if}
      </div>
    </div>

    <div class="aktionen">
      <button
        type="button"
        class="menu-button"
        onclick={menuToggle}
        aria-label="Aktionen"
        aria-expanded={menuOffen}
      >
        ⋯
      </button>
      {#if menuOffen}
        <div class="menu" role="menu">
          <a
            href="/aufgabe/{task.id}"
            class="menu-item"
            onclick={menuSchliessen}
          >
            Bearbeiten
          </a>
          <button
            type="button"
            class="menu-item"
            onclick={verschieben}
          >
            Verschieben
          </button>
          <form
            method="POST"
            action="?/loeschen"
            use:enhance
            onsubmit={menuSchliessen}
          >
            <input type="hidden" name="id" value={task.id} />
            <button
              type="submit"
              class="menu-item gefahr"
              onclick={loeschenBestaetigen}
            >
              Löschen
            </button>
          </form>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .zeile {
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-grosser);
    padding: 18px 20px;
    background: var(--farbe-hg-weiss);
  }
  .zeile.erledigt {
    background: #fafffe;
    border-color: #e0f4f2;
  }

  .reihe {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .links {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  /* Form-Wrapper sollen keine eigene Höhe um die Checkbox machen. */
  form {
    margin: 0;
    padding: 0;
    line-height: 0;
  }

  /* --- Checkbox --- */
  .checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid var(--farbe-border-stark);
    border-radius: 5px;
    flex-shrink: 0;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
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
    width: 6px;
    height: 10px;
    border: 2px solid var(--farbe-hg-weiss);
    border-top: none;
    border-left: none;
    transform: rotate(45deg) translate(-1px, -1px);
  }

  /* --- Inhalt --- */
  .inhalt {
    flex: 1;
    min-width: 0;
  }
  .titel {
    font-size: 15px;
    font-weight: 600;
    color: var(--farbe-text);
    margin-bottom: 4px;
  }
  .zeile.erledigt .titel {
    text-decoration: line-through;
    color: var(--farbe-text-extra-hell);
  }
  .beschreibung {
    font-size: 13px;
    color: var(--farbe-text-mittel);
    margin-bottom: 8px;
  }
  .notiz {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--farbe-text-hell);
  }
  .notiz em {
    font-style: italic;
  }

  /* --- Aktions-Menü --- */
  .aktionen {
    position: relative;
  }
  .menu-button {
    background: none;
    border: none;
    font-size: 18px;
    color: var(--farbe-text-extra-hell);
    padding: 4px 10px;
    border-radius: 6px;
    line-height: 1;
    cursor: pointer;
  }
  .menu-button:hover {
    background: var(--farbe-hg-grauer);
    color: var(--farbe-text-mittel);
  }
  .menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--farbe-hg-weiss);
    border: 1px solid var(--farbe-border);
    border-radius: var(--radius-mittel);
    box-shadow: var(--schatten-karte);
    min-width: 140px;
    padding: 4px;
    z-index: 10;
    display: flex;
    flex-direction: column;
  }
  .menu-item {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 9px 14px;
    font-size: 13px;
    color: var(--farbe-text-mittel);
    border-radius: 6px;
    text-decoration: none;
    cursor: pointer;
    font-family: inherit;
  }
  .menu-item:hover {
    background: var(--farbe-primaer-hell);
    color: var(--farbe-primaer);
    text-decoration: none;
  }
  .menu-item.gefahr:hover {
    background: var(--farbe-fehler-bg);
    color: var(--farbe-fehler);
  }
</style>
