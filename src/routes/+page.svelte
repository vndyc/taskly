<script>
	let { data } = $props();
</script>

<h1>Test: Daten aus load()</h1>

<p>Heutiges Datum: {data.heuteIso}</p>
<p>Woche von {data.wStartIso} bis {data.wEndeIso}</p>
<p>Anzahl Tasks in dieser Woche: {data.tasks.length}</p>

<h2>Tasks (raw)</h2>
<pre>{JSON.stringify(data.tasks, null, 2)}</pre>