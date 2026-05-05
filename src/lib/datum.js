/* ============================================================
   Taskly — Datums-Hilfsfunktionen
   ============================================================
   Alle Berechnungen erfolgen in lokaler Zeit.
   Bewusst KEIN toISOString() — das würde in UTC umrechnen
   und je nach Zeitzone das Datum um einen Tag verschieben.
   ============================================================ */


/* ------------------------------------------------------------
   Konstanten: Wochentage und Monate auf Deutsch
   ------------------------------------------------------------ */

/** Wochentage in voller Länge, Index entspricht getDay() (0 = Sonntag). */
export const WOCHENTAGE_LANG = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag'
];

/** Wochentage als 2-Buchstaben-Kürzel, Index entspricht getDay(). */
export const WOCHENTAGE_KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Monatsnamen in voller Länge, Index entspricht getMonth() (0 = Januar). */
export const MONATE_LANG = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'
];

/** Monatsnamen als 3-Buchstaben-Kürzel, Index entspricht getMonth(). */
export const MONATE_KURZ = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez'
];


/* ------------------------------------------------------------
   Hilfsfunktion (intern): Eingabe zu Date normalisieren
   ------------------------------------------------------------ */

/**
 * Wandelt einen ISO-String oder ein Date in ein Date-Objekt um.
 * Bei Strings im Format 'YYYY-MM-DD' wird lokale Mitternacht verwendet.
 * @param {Date|string} d
 * @returns {Date}
 */
function zuDate(d) {
  if (d instanceof Date) return d;
  if (typeof d === 'string') return ausIsoDatum(d);
  return new Date(d);
}


/* ------------------------------------------------------------
   Formatierung: ISO-Datum (YYYY-MM-DD) in lokaler Zeit
   ------------------------------------------------------------ */

/**
 * Formatiert ein Date als 'YYYY-MM-DD' in lokaler Zeit.
 * Verwendet bewusst nicht toISOString(), um Zeitzonen-Fehler zu vermeiden.
 * @param {Date|string} d
 * @returns {string}
 */
export function alsIsoDatum(d) {
  const datum = zuDate(d);
  const jahr = datum.getFullYear();
  const monat = String(datum.getMonth() + 1).padStart(2, '0');
  const tag = String(datum.getDate()).padStart(2, '0');
  return `${jahr}-${monat}-${tag}`;
}

/**
 * Gibt das heutige Datum als 'YYYY-MM-DD' zurück (lokale Zeit).
 * @returns {string}
 */
export function heuteIso() {
  return alsIsoDatum(new Date());
}

/**
 * Parst einen 'YYYY-MM-DD'-String zu einem Date-Objekt mit lokaler Mitternacht.
 * Verwendet einzelne Bestandteile, um eine UTC-Interpretation zu vermeiden.
 * @param {string} iso
 * @returns {Date}
 */
export function ausIsoDatum(iso) {
  const [jahr, monat, tag] = iso.split('-').map(Number);
  return new Date(jahr, monat - 1, tag);
}


/* ------------------------------------------------------------
   Wochen-Berechnungen
   ------------------------------------------------------------ */

/**
 * Gibt den Montag der Woche zurück, in der das Datum liegt.
 * Achtung: getDay() liefert 0 = Sonntag. Für Sonntag muss der Offset -6 sein,
 * sonst landet man eine Woche zu früh (auf dem Montag der Vorwoche).
 * @param {Date|string} d
 * @returns {Date}
 */
export function wochenStart(d) {
  const datum = zuDate(d);
  const wochentag = datum.getDay();
  // Sonntag = 0 → 6 Tage zurück. Sonst: (Wochentag - 1) Tage zurück.
  const offset = wochentag === 0 ? -6 : 1 - wochentag;
  const montag = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate() + offset);
  return montag;
}

/**
 * Gibt ein Array mit 7 Date-Objekten zurück, beginnend beim Start-Datum.
 * @param {Date} start
 * @returns {Date[]}
 */
export function tageDerWoche(start) {
  const tage = [];
  for (let i = 0; i < 7; i++) {
    tage.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return tage;
}


/* ------------------------------------------------------------
   Anzeige-Formate
   ------------------------------------------------------------ */

/**
 * Formatiert ein Datum als 'Mittwoch, 22. April 2026'.
 * @param {Date|string} d
 * @returns {string}
 */
export function alsLangeAnzeige(d) {
  const datum = zuDate(d);
  const wochentag = WOCHENTAGE_LANG[datum.getDay()];
  const tag = datum.getDate();
  const monat = MONATE_LANG[datum.getMonth()];
  const jahr = datum.getFullYear();
  return `${wochentag}, ${tag}. ${monat} ${jahr}`;
}

/**
 * Formatiert ein Datum als 'Mi, 22. April 2026'.
 * @param {Date|string} d
 * @returns {string}
 */
export function alsKurzeAnzeige(d) {
  const datum = zuDate(d);
  const wochentag = WOCHENTAGE_KURZ[datum.getDay()];
  const tag = datum.getDate();
  const monat = MONATE_LANG[datum.getMonth()];
  const jahr = datum.getFullYear();
  return `${wochentag}, ${tag}. ${monat} ${jahr}`;
}

/**
 * Formatiert ein Datum als '22. APR 2026' (Monat in Grossbuchstaben, kurz).
 * Wird für die Dashboard-Überschrift verwendet.
 * @param {Date|string} d
 * @returns {string}
 */
export function alsHeaderDatum(d) {
  const datum = zuDate(d);
  const tag = datum.getDate();
  const monat = MONATE_KURZ[datum.getMonth()].toUpperCase();
  const jahr = datum.getFullYear();
  return `${tag}. ${monat} ${jahr}`;
}

/**
 * Formatiert eine Wochenspanne als '20. April - 26. April 2026'.
 * Das Jahr wird nur einmal am Ende angezeigt.
 * @param {Date|string} start
 * @param {Date|string} ende
 * @returns {string}
 */
export function alsWochenAnzeige(start, ende) {
  const startDatum = zuDate(start);
  const endeDatum = zuDate(ende);
  const startTag = startDatum.getDate();
  const startMonat = MONATE_LANG[startDatum.getMonth()];
  const endeTag = endeDatum.getDate();
  const endeMonat = MONATE_LANG[endeDatum.getMonth()];
  const jahr = endeDatum.getFullYear();
  return `${startTag}. ${startMonat} - ${endeTag}. ${endeMonat} ${jahr}`;
}
