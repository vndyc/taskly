<script>
  // --- Props ---
  // Alle drei Werte sind ISO-Datums-Strings (YYYY-MM-DD)
  // für den Wochenstart der jeweiligen Zielwoche.
  let { vorherigeWoche, naechsteWoche, aktuelleWoche, wochenLabel } = $props();
</script>

<div class="navigation">
  <a class="nav-btn" href="?von={vorherigeWoche}" aria-label="Vorherige Woche">‹</a>
  <a class="heute-btn" href="?von={aktuelleWoche}">Heute</a>
  <span class="label">{wochenLabel}</span>
  <a class="nav-btn" href="?von={naechsteWoche}" aria-label="Nächste Woche">›</a>
</div>

<style>
  .navigation {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-btn {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-mittel);
    background: var(--farbe-hg-grauer);
    font-size: 16px;
    color: var(--farbe-text-mittel);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }
  .nav-btn:hover {
    background: var(--farbe-border);
    text-decoration: none;
  }

  .heute-btn {
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-mittel);
    background: var(--farbe-hg-grauer);
    color: var(--farbe-text-mittel);
    text-decoration: none;
  }
  .heute-btn:hover {
    background: var(--farbe-border);
    text-decoration: none;
  }

  .label {
    font-size: 14px;
    font-weight: 600;
    color: var(--farbe-text-mittel);
    min-width: 200px;
    text-align: center;
  }
</style>
