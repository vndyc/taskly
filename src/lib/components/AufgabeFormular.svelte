<script>
  import { enhance } from '$app/forms';
  import LoeschenModal from '$lib/components/LoeschenModal.svelte';

  // --- Props ---
  let {
    titelDesFormulars = 'Neue Aufgabe erstellen',
    untertitel = 'Alle mit * markierten Felder sind Pflichtfelder',
    startwerte = {},
    speichernAction = null,
    loeschenAction = null,
    speichernText = 'Aufgabe speichern',
    form = null,
    zeigeLoeschen = false,
    zurueck = '/'
  } = $props();

  // --- Lokaler State ---
  let zeigeLoeschModal = $state(false);

  // Auswählbare Kategorien (als Pill-Buttons gerendert).
  const KATEGORIEN = [
    { wert: 'arbeit', label: 'Arbeit' },
    { wert: 'schule', label: 'Schule' },
    { wert: 'privat', label: 'Privat' }
  ];

  // Kategorie braucht reaktiven State, weil sie nicht über
  // ein natives Radio-Input gewählt wird (sondern über Buttons).
  let kategorie = $state('arbeit');

  $effect(() => {
    // Synchronisiert die kategorie-Variable mit den Props.
    // Läuft initial UND wenn form/startwerte sich ändern
    // (z.B. nach Validierungsfehler).
    kategorie = form?.kategorie ?? startwerte.kategorie ?? 'arbeit';
  });

  // Aktuelles Fehler-Objekt von der Form Action.
  const fehler = $derived(form?.fehler ?? null);
</script>

<form method="POST" action={speichernAction ?? undefined} use:enhance class="formular">
  <header>
    <h1>{titelDesFormulars}</h1>
    <p class="untertitel">{untertitel}</p>
  </header>

  {#if fehler}
    <div class="fehler" role="alert">{fehler}</div>
  {/if}

  <label class="feld">
    <span>Titel *</span>
    <input
      type="text"
      name="titel"
      value={form?.titel ?? startwerte.titel ?? ''}
      maxlength="100"
      required
    />
  </label>

  <label class="feld">
    <span>Beschreibung</span>
    <textarea
      name="beschreibung"
      rows="3"
      maxlength="500"
    >{form?.beschreibung ?? startwerte.beschreibung ?? ''}</textarea>
  </label>

  <div class="feld">
    <span class="feld-label">Kategorie *</span>
    <div class="chip-reihe" role="radiogroup" aria-label="Kategorie">
      {#each KATEGORIEN as kat (kat.wert)}
        <button
          type="button"
          class="chip"
          class:aktiv={kategorie === kat.wert}
          role="radio"
          aria-checked={kategorie === kat.wert}
          onclick={() => (kategorie = kat.wert)}
        >
          {kat.label}
        </button>
      {/each}
    </div>
    <input type="hidden" name="kategorie" value={kategorie} />
  </div>

  <label class="feld">
    <span>Fälligkeitsdatum *</span>
    <input
      type="date"
      name="faelligkeitsDatum"
      value={form?.faelligkeitsDatum ?? startwerte.faelligkeitsDatum ?? ''}
      required
    />
  </label>

  <label class="feld">
    <span>Notiz</span>
    <input
      type="text"
      name="notiz"
      value={form?.notiz ?? startwerte.notiz ?? ''}
      maxlength="200"
    />
  </label>

  <div class="aktionen">
    <a href={zurueck} class="btn-sekundaer">Abbrechen</a>
    <button type="submit" class="btn-primaer">{speichernText}</button>
  </div>
</form>

{#if zeigeLoeschen && loeschenAction}
  <div class="loeschen-form">
    <button
      type="button"
      class="btn-gefahr"
      onclick={() => (zeigeLoeschModal = true)}
    >
      Aufgabe löschen
    </button>
  </div>
{/if}

{#if zeigeLoeschModal && startwerte.id}
  <LoeschenModal
    task={startwerte}
    action={loeschenAction}
    onSchliessen={() => (zeigeLoeschModal = false)}
  />
{/if}

<style>
  .formular {
    max-width: 540px;
    margin: 40px auto 16px;
    padding: 40px;
    background: var(--farbe-hg-weiss);
    border-radius: var(--radius-gross);
  }

  header {
    margin-bottom: 28px;
  }
  h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--farbe-text);
    margin-bottom: 4px;
  }
  .untertitel {
    font-size: 13px;
    color: var(--farbe-text-hell);
  }

  /* --- Felder --- */
  .feld {
    display: block;
    margin-bottom: 18px;
  }
  .feld span,
  .feld-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--farbe-text);
    margin-bottom: 6px;
  }
  .feld input[type='text'],
  .feld input[type='date'],
  .feld textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid var(--farbe-border);
    border-radius: var(--radius-mittel);
    font-size: 14px;
    color: var(--farbe-text);
    font-family: inherit;
  }
  .feld input:focus,
  .feld textarea:focus {
    outline: none;
    border-color: var(--farbe-primaer);
  }
  .feld textarea {
    resize: vertical;
    min-height: 80px;
  }

  /* --- Kategorie-Chips --- */
  .chip-reihe {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .chip {
    padding: 7px 18px;
    border-radius: 99px;
    font-size: 13px;
    font-weight: 600;
    border: 1.5px solid var(--farbe-border);
    background: var(--farbe-hg-weiss);
    color: var(--farbe-text-mittel);
    cursor: pointer;
  }
  .chip.aktiv {
    background: var(--farbe-primaer-mittel);
    border-color: var(--farbe-primaer);
    color: var(--farbe-primaer);
  }

  /* --- Fehler-Banner --- */
  .fehler {
    background: var(--farbe-fehler-bg);
    color: var(--farbe-fehler);
    padding: 10px 14px;
    border-radius: var(--radius-mittel);
    font-size: 13px;
    margin-bottom: 16px;
  }

  /* --- Aktionen --- */
  .aktionen {
    display: flex;
    gap: 10px;
    margin-top: 24px;
    justify-content: center;
    align-items: center;
  }
  .aktionen .btn-sekundaer {
    text-decoration: none;
  }

  /* --- Löschen-Form (zweites Form unter dem Hauptformular) --- */
  .loeschen-form {
    max-width: 540px;
    margin: 0 auto 40px;
    padding: 0 40px;
    text-align: center;
  }
</style>
