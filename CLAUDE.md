# Taskly — Projektkontext

Diese Datei beschreibt das Projekt für Claude Code. Sie wird automatisch
gelesen und gibt Kontext für alle Code-Generierungen und -Änderungen.

---

## Projektkontext

Taskly ist eine SvelteKit-Webapp für ein Hochschulprojekt (ZHAW, Modul Prototyping).
Es ist eine persönliche To-do-App mit Login und MongoDB.

Ziel ist ein funktionierender Prototyp mit folgendem End-to-End-Workflow:

Login → Aufgaben anzeigen → Aufgabe erstellen → bearbeiten / verschieben /
löschen / erledigen → Kalender nutzen

---

## Technologie

- Framework: SvelteKit 2 mit Svelte 5 (Runes-Syntax: `$state`, `$derived`, `$effect`, `$props`)
- Sprache: JavaScript (kein TypeScript)
- Styling: Vanilla CSS mit CSS-Variablen (kein Tailwind, keine UI-Library)
- Datenbank: MongoDB Atlas (Cloud)
- Authentifizierung: Eigene Session-Cookies mit bcrypt-Passwort-Hash
- Deployment: Netlify
- Versionsverwaltung: Git / GitHub

---

## Projektstruktur

```
src/
  app.html
  app.css                      # Globale Styles + CSS-Variablen
  app.d.ts                     # Locals-Typen
  hooks.server.js              # Session lesen, Routen schützen

  lib/
    datum.js                   # Datums-Helfer (Wochenberechnung etc.)
    components/
      Nav.svelte
      TaskKarte.svelte         # Kompakte Kachel (Dashboard)
      TaskZeile.svelte         # Detaillierte Zeile (Tagesansicht)
      AufgabeFormular.svelte   # Wiederverwendbar für neu + bearbeiten
      VerschiebenModal.svelte
    stores/
      tasks.svelte.js          # Tasks-Store mit Runes
    server/
      db.js                    # MongoDB-Connection (Singleton)
      auth.js                  # Passwort-Hash, Sessions

  routes/
    +layout.server.js          # User aus locals durchreichen
    +layout.svelte             # Globales Layout mit Nav
    +page.svelte               # Dashboard (Home)

    login/+page.svelte
    register/+page.svelte

    kalender/
      +page.svelte             # Wochenansicht
      [datum]/+page.svelte     # Tagesansicht (URL: /kalender/2026-04-22)

    aufgabe/
      neu/+page.svelte
      [id]/
        +page.server.js        # Aufgabe vorladen
        +page.svelte           # Bearbeiten (Klick auf Aufgabe = direkt bearbeiten)

    api/
      auth/
        login/+server.js
        logout/+server.js
        register/+server.js
      tasks/
        +server.js             # GET liste, POST neu
        [id]/+server.js        # GET, PATCH, DELETE
```

---

## Datenmodelle

**`users` Collection**
```js
{
  _id: ObjectId,
  email: string,         // lowercase, unique
  passwortHash: string,  // bcrypt
  name: string,
  erstelltAm: Date
}
```

**`sessions` Collection** (für Cookie-Sessions)
```js
{
  sessionId: string,     // crypto.randomUUID
  userId: string,
  ablaufDatum: Date,     // TTL-Index für Auto-Cleanup
  erstelltAm: Date
}
```

**`tasks` Collection**
```js
{
  _id: ObjectId,
  userId: string,
  titel: string,
  beschreibung: string,
  kategorie: 'arbeit' | 'schule' | 'privat',
  faelligkeitsDatum: string,  // YYYY-MM-DD
  notiz: string,
  erledigt: boolean,
  erstelltAm: Date,
  bearbeitetAm: Date
}
```

Jede Aufgabe gehört zu einem User. Ein User darf nur seine eigenen Aufgaben
sehen und bearbeiten — alle Datenbankabfragen filtern nach `userId`.

---

## Hauptfunktionen

- Login und Registrierung
- Geschützte Seiten (alle ausser /login und /register)
- Dashboard mit heutigen Aufgaben + Stats (Tag, Woche, Kategorien)
- Wochenansicht mit Filter nach Kategorie
- Klick auf Tag → Tagesansicht mit Mini-Kalender
- Aufgabe erstellen, bearbeiten, verschieben, löschen, erledigt-toggeln

---

## Coding-Regeln

- Schreibe einfachen und verständlichen JavaScript-Code
- Variablennamen, Funktionsnamen, Kommentare und UI-Texte: **alles auf Deutsch**
- Verwende Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`),
  nicht die alte `export let`-Syntax
- Verwende keine zusätzlichen UI-Libraries
- Keine Datenbankzugriffe im Frontend — MongoDB nur in `src/lib/server/`
- Jede Aufgabe gehört zu einem User (`userId`); jede Query filtert danach
- Validierung sowohl client- als auch serverseitig
- Umgebungsvariablen via `$env/dynamic/private`, nie via `process.env`
- Projektstruktur nicht ohne Anlass verändern

---

## Umgebungsvariablen (.env)

- `DB_URI` — MongoDB-Connection-String inkl. DB-Name (z.B. `.../taskly?...`)
- `SESSION_SECRET` — Geheimnis für Session-Cookies (langer Zufallsstring)

---

## UI-Design

- Schriftart: Inter (von Google Fonts geladen in app.html)
- Primärfarbe: `#01696f` (Teal)
- Heller Hintergrund (`#fafafa`/`#f5f5f5`), Karten weiss
- Aufgaben werden als Karten dargestellt (abgerundet, leichter Rand)
- Navbar oben mit Logo links, Tabs zentriert (Home, Kalender), Datum + Avatar rechts
- Kategorien als farbige Badges:
  - Arbeit = blau (`#e8f4ff` / `#0070cc`)
  - Schule = grün (`#edfff3` / `#00994d`)
  - Privat = orange (`#fff3e8` / `#cc6600`)
- Checkbox zum Abhaken von Aufgaben (Teal wenn erledigt)
- Erledigte Aufgaben: durchgestrichen + ausgegraut

---

## Wichtig für KI-Generierung

- Bei Server-Code: Nutze immer `$env/dynamic/private` für `.env`-Werte
- Bei Forms: Nutze `bind:value` und `onsubmit` (Svelte 5)
- Bei Stores: Nutze die `.svelte.js`-Endung für Runes-Stores
- Bei API-Routen: Gib bei Fehlern strukturierte JSON-Antworten zurück
  (`{ fehler: '...' }`) mit passendem HTTP-Status
- Bei Datums-Strings: Format `YYYY-MM-DD` (lokale Zeit, keine ISO-Zeitzone)