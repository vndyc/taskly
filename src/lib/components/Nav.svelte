<script>
  import { page } from '$app/state';
  import { goto, invalidateAll } from '$app/navigation';
  import { alsKurzeAnzeige } from '$lib/datum.js';

  // --- Props ---
  let { user } = $props();

  // --- Lokaler State ---
  let menuOffen = $state(false);

  // --- Konstanten ---
  const heute = alsKurzeAnzeige(new Date());

  // --- Abgeleitete Werte ---
  const initiale = $derived(user?.name?.charAt(0).toUpperCase() ?? '?');

  /**
   * Prüft, ob ein Pfad als "aktiv" markiert werden soll.
   * '/' ist nur exakt aktiv; andere Pfade matchen per Präfix
   * (damit z.B. /kalender/2026-04-22 den Kalender-Tab markiert).
   */
  function istAktiv(pfad) {
    const aktuell = page.url.pathname;
    if (pfad === '/') return aktuell === '/';
    return aktuell.startsWith(pfad);
  }

  /**
   * Loggt den User aus, invalidiert die Daten und navigiert zum Login.
   */
  async function ausloggen() {
    await fetch('/api/auth/logout', { method: 'POST' });
    await invalidateAll();
    await goto('/login');
  }
</script>

<nav class="nav">
  <a href="/" class="nav-logo">
    <span class="nav-logo-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.5l4 4 10-10"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span>taskly</span>
  </a>

  <div class="nav-links">
    <a
      href="/"
      class="nav-link"
      class:active={istAktiv('/') && page.url.pathname === '/'}
    >
      Home
    </a>
    <a
      href="/kalender"
      class="nav-link"
      class:active={istAktiv('/kalender')}
    >
      Kalender
    </a>
    <a
      href="/suche"
      class="nav-link"
      class:active={istAktiv('/suche')}
    >
      Suche
    </a>
  </div>

  <div class="nav-right">
    <span class="nav-date">{heute}</span>
    <button
      type="button"
      class="nav-avatar"
      onclick={() => (menuOffen = !menuOffen)}
      aria-label="Benutzermenü"
      aria-expanded={menuOffen}
    >
      {initiale}
    </button>

    {#if menuOffen}
      <div class="nav-menu" role="menu">
        <div class="nav-menu-name">{user?.name}</div>
        <div class="nav-menu-email">{user?.email}</div>
        <hr />
        <button type="button" class="nav-menu-item" onclick={ausloggen}>
          Abmelden
        </button>
      </div>
    {/if}
  </div>
</nav>

<style>
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 60px;
    border-bottom: 1px solid var(--farbe-border);
    background: var(--farbe-hg-weiss);
    position: relative;
  }

  /* --- Logo --- */
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    font-weight: 700;
    font-size: 17px;
    color: var(--farbe-text);
    letter-spacing: -0.3px;
    text-decoration: none;
  }

  .nav-logo:hover {
    text-decoration: none;
  }

  .nav-logo-icon {
    width: 30px;
    height: 30px;
    background: var(--farbe-primaer);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-logo-icon svg {
    width: 16px;
    height: 16px;
  }

  /* --- Tabs (zentriert) --- */
  .nav-links {
    display: flex;
    gap: 4px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .nav-link {
    padding: 7px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--farbe-text-mittel);
    text-decoration: none;
  }

  .nav-link:hover {
    background: var(--farbe-hg-grauer);
    text-decoration: none;
  }

  .nav-link.active {
    background: var(--farbe-primaer-hell);
    color: var(--farbe-primaer);
    font-weight: 600;
  }

  /* --- Rechter Bereich: Datum + Avatar + Menu --- */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
  }

  .nav-date {
    font-size: 13px;
    color: var(--farbe-text-sehr-hell);
  }

  .nav-avatar {
    width: 32px;
    height: 32px;
    background: var(--farbe-primaer);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--farbe-hg-weiss);
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
  }

  /* --- Drop-down Menü --- */
  .nav-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--farbe-hg-weiss);
    border: 1px solid var(--farbe-border);
    border-radius: var(--radius-gross);
    box-shadow: var(--schatten-karte);
    min-width: 200px;
    padding: 12px;
    z-index: 100;
  }

  .nav-menu-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--farbe-text);
  }

  .nav-menu-email {
    font-size: 12px;
    color: var(--farbe-text-hell);
    margin-top: 2px;
  }

  .nav-menu hr {
    border: none;
    border-top: 1px solid var(--farbe-border);
    margin: 10px 0;
  }

  .nav-menu-item {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 8px 10px;
    font-size: 13px;
    color: var(--farbe-text-mittel);
    border-radius: 6px;
    cursor: pointer;
  }

  .nav-menu-item:hover {
    background: var(--farbe-hg-grauer);
  }
</style>
