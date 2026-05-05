<script>
  import { goto, invalidateAll } from '$app/navigation';

  // --- Formular-State (Svelte 5 Runes) ---
  let email = $state('');
  let passwort = $state('');
  let fehler = $state('');
  let laedt = $state(false);

  /**
   * Schickt das Login-Formular ab.
   * @param {SubmitEvent} e
   */
  async function abschicken(e) {
    e.preventDefault();
    fehler = '';
    laedt = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, passwort })
      });
      const daten = await res.json();

      if (!res.ok) {
        throw new Error(daten.fehler ?? 'Anmeldung fehlgeschlagen');
      }

      await invalidateAll();
      await goto('/');
    } catch (e) {
      fehler = e.message;
    } finally {
      laedt = false;
    }
  }
</script>

<svelte:head>
  <title>Anmelden – Taskly</title>
</svelte:head>

<div class="seite">
  <div class="karte">
    <div class="logo-block">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4 4 10-10"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1>taskly</h1>
    </div>

    <p class="untertitel">Willkommen zurück</p>

    <form onsubmit={abschicken}>
      {#if fehler}
        <div class="fehler" role="alert">{fehler}</div>
      {/if}

      <label class="feld">
        <span>E-Mail</span>
        <input
          type="email"
          bind:value={email}
          required
          autocomplete="email"
        />
      </label>

      <label class="feld">
        <span>Passwort</span>
        <input
          type="password"
          bind:value={passwort}
          required
          autocomplete="current-password"
        />
      </label>

      <button type="submit" class="btn-primaer voll" disabled={laedt}>
        {laedt ? 'Wird angemeldet…' : 'Anmelden'}
      </button>
    </form>

    <p class="hinweis">
      Noch kein Konto? <a href="/register">Jetzt registrieren</a>
    </p>
  </div>
</div>

<style>
  .seite {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--farbe-hg-grau);
    padding: 20px;
  }

  .karte {
    background: var(--farbe-hg-weiss);
    border-radius: var(--radius-gross);
    box-shadow: var(--schatten-modal);
    padding: 40px;
    max-width: 420px;
    width: 100%;
  }

  .logo-block {
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
    margin-bottom: 6px;
  }

  .logo-block .logo-icon {
    width: 36px;
    height: 36px;
    background: var(--farbe-primaer);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-block .logo-icon svg {
    width: 20px;
    height: 20px;
  }

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--farbe-text);
  }

  .untertitel {
    text-align: center;
    font-size: 14px;
    color: var(--farbe-text-hell);
    margin-bottom: 32px;
  }

  .feld {
    display: block;
    margin-bottom: 16px;
  }

  .feld span {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--farbe-text);
    margin-bottom: 6px;
  }

  .feld input {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-mittel);
    font-size: 14px;
  }

  .feld input:focus {
    outline: none;
    border-color: var(--farbe-primaer);
  }

  .btn-primaer.voll {
    width: 100%;
    justify-content: center;
    padding: 12px;
    margin-top: 8px;
  }

  .fehler {
    background: var(--farbe-fehler-bg);
    color: var(--farbe-fehler);
    padding: 10px 14px;
    border-radius: var(--radius-mittel);
    font-size: 13px;
    margin-bottom: 16px;
  }

  .hinweis {
    text-align: center;
    font-size: 13px;
    color: var(--farbe-text-hell);
    margin-top: 24px;
  }
</style>
