<script>
  import AufgabeFormular from '$lib/components/AufgabeFormular.svelte';

  // --- Props ---
  let { data, form } = $props();

  // Heute als Default fürs Datumsfeld vorbelegen.
  const startwerte = $derived({ faelligkeitsDatum: data.heuteIso });
</script>

<svelte:head>
  <title>Neue Aufgabe – Taskly</title>
</svelte:head>

<div class="seite">
  <AufgabeFormular
    titelDesFormulars="Neue Aufgabe erstellen"
    untertitel="Alle mit * markierten Felder sind Pflichtfelder"
    {startwerte}
    speichernAction={null}
    speichernText="Aufgabe speichern"
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
