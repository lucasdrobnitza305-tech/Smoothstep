import { BubbleColor } from '../theme';

// Eine Aufgabe im Tagesplan. Zeiten sind Minuten seit Mitternacht (8:30 = 510).
export type IconName = 'sun' | 'work' | 'bag' | 'run' | 'moon' | 'sparkle';

export type Task = {
  id: string;
  title: string;
  kind: 'fixed' | 'flexible' | 'recurring';
  start: number;
  end: number;
  color: BubbleColor;
  icon: IconName;
};

// Flexible Aufgabe ohne feste Uhrzeit – die App schlägt sie in freien Lücken vor.
export type FlexTask = {
  id: string;
  title: string;
  duration: number; // Minuten
};

// Beispieldaten für den Prototyp. Später kommen sie aus der Einrichtung.
export const sampleTasks: Task[] = [
  { id: 'morgen', title: 'Morgenroutine', kind: 'recurring', start: 7 * 60, end: 7 * 60 + 30, color: 'butter', icon: 'sun' },
  { id: 'arbeit', title: 'Arbeit', kind: 'recurring', start: 8 * 60, end: 16 * 60, color: 'peach', icon: 'work' },
  { id: 'einkaufen', title: 'Einkaufen', kind: 'fixed', start: 16 * 60 + 30, end: 17 * 60 + 30, color: 'peach', icon: 'bag' },
  { id: 'training', title: 'Training', kind: 'recurring', start: 18 * 60, end: 19 * 60 + 30, color: 'mint', icon: 'run' },
  { id: 'rueckblick', title: 'Tagesrückblick', kind: 'recurring', start: 21 * 60 + 30, end: 21 * 60 + 35, color: 'sky', icon: 'moon' },
];

export const sampleFlexTasks: FlexTask[] = [{ id: 'post', title: 'Paket zur Post bringen', duration: 30 }];

export function minutesNow(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Die Aufgabe, die gerade zur Uhrzeit passt (der Kern von „hebt sich hervor").
export function currentTask(tasks: Task[], now: number): Task | undefined {
  return tasks.find((t) => now >= t.start && now < t.end);
}

export function upcomingTasks(tasks: Task[], now: number): Task[] {
  return tasks.filter((t) => t.start > now).sort((a, b) => a.start - b.start);
}

// Sucht die nächste freie Lücke, in die eine flexible Aufgabe passt.
export function findGap(tasks: Task[], now: number, duration: number, dayEnd = 22 * 60): number | undefined {
  const sorted = [...tasks].sort((a, b) => a.start - b.start);
  let cursor = now;
  for (const t of sorted) {
    if (t.end <= cursor) continue;
    if (t.start - cursor >= duration) return cursor;
    cursor = Math.max(cursor, t.end);
  }
  return dayEnd - cursor >= duration ? cursor : undefined;
}

export function greeting(now: number): string {
  if (now < 11 * 60) return 'Guten Morgen';
  if (now < 14 * 60) return 'Hallo';
  if (now < 18 * 60) return 'Guten Nachmittag';
  return 'Guten Abend';
}
