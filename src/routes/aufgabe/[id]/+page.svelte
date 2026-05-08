<script>
  import AufgabeFormular from '$lib/components/AufgabeFormular.svelte';

  // --- Props ---
  let { data, form } = $props();

  // Untertitel mit Erstellt- und Bearbeitet-Datum.
  const meta = $derived.by(() => {
    const erstellt = new Date(data.task.erstelltAm).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const bearbeitet = new Date(data.task.bearbeitetAm).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return `Erstellt am ${erstellt}, zuletzt bearbeitet am ${bearbeitet}`;
  });
</script>

<svelte:head>
  <title>{data.task.titel} bearbeiten – Taskly</title>
</svelte:head>

<div class="seite">
  <AufgabeFormular
    titelDesFormulars="Aufgabe bearbeiten"
    untertitel={meta}
    startwerte={data.task}
    speichernAction="?/aktualisieren"
    loeschenAction="?/loeschen"
    speichernText="Änderungen speichern"
    zeigeLoeschen={true}
    {form}
  />
</div>

<style>
  .seite {
    min-height: calc(100vh - 60px);
    background: var(--farbe-hg-grau);
    padding: 20px;
  }
</style>
