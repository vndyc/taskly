<script>
  // Globaler CSS-Import (Variablen, Reset, Helper-Klassen)
  import '../app.css';

  import { page } from '$app/state';
  import Nav from '$lib/components/Nav.svelte';

  // --- Props (Children + serverseitige Daten aus +layout.server.js) ---
  let { children, data } = $props();

  // Routen, auf denen die Nav NICHT angezeigt werden soll.
  const ohneNav = ['/login', '/register'];

  // Nav nur einblenden, wenn ein User eingeloggt ist UND
  // die aktuelle Route nicht zu den auth-Routen gehört.
  const zeigtNav = $derived(data.user && !ohneNav.includes(page.url.pathname));
</script>

{#if zeigtNav}
  <Nav user={data.user} />
{/if}

<main>
  {@render children()}
</main>

<style>
  main {
    min-height: calc(100vh - 60px); /* 60px = Nav-Höhe */
    background: #fff;
  }
</style>
