import { BubbleColor } from '../theme';
import { IconName } from './tasks';

// Vorschläge für feste Routinen in der Einrichtung.
// days = JavaScript-Wochentage: 0 = Sonntag, 1 = Montag … 6 = Samstag.
export type RoutineTemplate = {
  id: string;
  label: string;
  color: BubbleColor;
  icon: IconName;
  start: number; // Minuten seit Mitternacht
  duration: number; // Minuten
  days: number[];
};

export const ROUTINES: RoutineTemplate[] = [
  { id: 'morgen', label: 'Morgenroutine', color: 'butter', icon: 'sun', start: 7 * 60, duration: 30, days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'arbeit', label: 'Arbeit', color: 'peach', icon: 'work', start: 8 * 60, duration: 8 * 60, days: [1, 2, 3, 4, 5] },
  { id: 'schule', label: 'Schule / Ausbildung', color: 'sky', icon: 'work', start: 8 * 60, duration: 6 * 60, days: [1, 2, 3, 4, 5] },
  { id: 'training', label: 'Training', color: 'mint', icon: 'run', start: 18 * 60, duration: 90, days: [2, 4] },
  { id: 'freunde', label: 'Sport mit Freunden', color: 'mint', icon: 'run', start: 17 * 60, duration: 120, days: [6] },
  { id: 'haushalt', label: 'Haushalt', color: 'butter', icon: 'sparkle', start: 10 * 60, duration: 60, days: [6] },
  { id: 'einkaufen', label: 'Einkaufen', color: 'peach', icon: 'bag', start: 16 * 60 + 30, duration: 60, days: [1, 4] },
  { id: 'lernen', label: 'Lernen', color: 'lavender', icon: 'sparkle', start: 19 * 60, duration: 60, days: [2, 3] },
  { id: 'hobby', label: 'Hobby', color: 'lavender', icon: 'sparkle', start: 20 * 60, duration: 60, days: [3] },
];

// Wochentage in der Reihenfolge Mo–So, mit ihrem JavaScript-Wert.
export const WEEK = [
  { js: 1, short: 'Mo', long: 'Montag' },
  { js: 2, short: 'Di', long: 'Dienstag' },
  { js: 3, short: 'Mi', long: 'Mittwoch' },
  { js: 4, short: 'Do', long: 'Donnerstag' },
  { js: 5, short: 'Fr', long: 'Freitag' },
  { js: 6, short: 'Sa', long: 'Samstag' },
  { js: 0, short: 'So', long: 'Sonntag' },
];

export function formatDuration(min: number): string {
  if (min < 60) return `${min} Min`;
  const h = min / 60;
  return Number.isInteger(h) ? `${h} Std` : `${String(h).replace('.', ',')} Std`;
}
