import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BubbleColor } from '../theme';
import { FlexTask, IconName, Task, sampleFlexTasks, sampleTasks } from '../data/tasks';

// Hier lebt alles, was SmoothStep sich merken muss – und es wird auf dem Handy gespeichert,
// damit nach dem Schließen der App nichts verloren geht.

const STORAGE_KEY = 'smoothstep:v1';

export type TaskKind = Task['kind'];

export type NewTask = {
  title: string;
  kind: TaskKind;
  start: number; // Minuten seit Mitternacht
  duration: number; // Minuten
  days?: number[]; // nur bei wiederkehrenden: Wochentage (0 = So … 6 = Sa); leer/fehlend = jeden Tag
};

// Eine selbst angelegte Aufgabe. Feste Termine gelten für einen Tag, wiederkehrende jeden Tag.
type SavedTask = Task & { date?: string };

export type ReminderStyle = 'soft' | 'balanced' | 'push';

// Was bei der Einrichtung festgelegt wird.
export type Profile = {
  onboarded: boolean;
  wake: number; // Minuten seit Mitternacht
  sleep: number;
  weekendDifferent: boolean;
  weekendWake: number;
  weekendSleep: number;
  reminderStyle: ReminderStyle;
  reviewEnabled: boolean;
};

export type SetupRoutine = {
  title: string;
  color: BubbleColor;
  icon: IconName;
  start: number;
  duration: number;
  days: number[];
};

type SavedState = {
  profile: Profile;
  tasks: SavedTask[];
  flex: FlexTask[];
  done: Record<string, string[]>; // Datum -> abgehakte Aufgaben-IDs
  colorIndex: number;
};

const defaultProfile: Profile = {
  onboarded: false,
  wake: 6 * 60 + 45,
  sleep: 23 * 60,
  weekendDifferent: false,
  weekendWake: 9 * 60,
  weekendSleep: 24 * 60 - 30,
  reminderStyle: 'balanced',
  reviewEnabled: true,
};

const initialState: SavedState = {
  profile: defaultProfile,
  tasks: sampleTasks,
  flex: sampleFlexTasks,
  done: {},
  colorIndex: 0,
};

const NEW_COLORS: BubbleColor[] = ['lavender', 'mint', 'peach', 'sky', 'butter'];

// Wochentag (0 = So … 6 = Sa) zu einem Datums-Schlüssel wie 2026-10-27.
function weekdayOf(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

// Alle 7 Tage gewählt heißt „jeden Tag“ – das speichern wir einfach ohne Liste.
function everyDayAsEmpty(days?: number[]): number[] | undefined {
  if (!days || days.length === 0 || days.length === 7) return undefined;
  return [...days].sort((a, b) => a - b);
}

export function dateKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Store = {
  ready: boolean;
  profile: Profile;
  completeSetup: (profile: Omit<Profile, 'onboarded'>, routines: SetupRoutine[]) => void;
  restartSetup: () => void;
  tasksFor: (day: string) => Task[];
  flexQueue: FlexTask[];
  isDone: (day: string, id: string) => boolean;
  toggleDone: (day: string, id: string) => void;
  addTask: (t: NewTask, day: string) => void;
  getTask: (id: string) => NewTask | undefined;
  updateTask: (id: string, t: NewTask, day: string) => void;
  deleteTask: (id: string) => void;
  planFlex: (flexId: string, start: number, day: string) => void;
  postponeFlex: (flexId: string) => void;
  resetAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function TaskStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SavedState>(initialState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Beim Start: gespeicherten Stand laden.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as Partial<SavedState>;
          setState({ ...initialState, ...saved, profile: { ...defaultProfile, ...(saved.profile || {}) } });
        }
      })
      .catch(() => {
        // Lesen fehlgeschlagen: mit Beispieldaten weitermachen.
      })
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  // Bei jeder Änderung: speichern (erst nachdem geladen wurde, sonst würden wir den Stand überschreiben).
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const tasksFor = useCallback(
    (day: string) => {
      const wd = weekdayOf(day);
      return state.tasks.filter((t) => {
        if (t.kind === 'recurring') return !t.days || t.days.length === 0 || t.days.includes(wd);
        return !t.date || t.date === day;
      });
    },
    [state.tasks],
  );

  // Aus der Einrichtung den persönlichen Plan bauen (ersetzt die Beispielaufgaben).
  const completeSetup = useCallback((p: Omit<Profile, 'onboarded'>, routines: SetupRoutine[]) => {
    const tasks: SavedTask[] = routines.map((r, i) => ({
      id: `routine-${i}-${Date.now()}`,
      title: r.title,
      kind: 'recurring',
      start: r.start,
      end: Math.min(r.start + r.duration, 24 * 60),
      color: r.color,
      icon: r.icon,
      days: r.days,
    }));
    if (p.reviewEnabled) {
      // Rückblick eine Stunde vor dem Schlafengehen.
      const start = Math.max(0, p.sleep - 60);
      tasks.push({ id: 'rueckblick', title: 'Tagesrückblick', kind: 'recurring', start, end: start + 5, color: 'sky', icon: 'moon' });
    }
    setState((s) => ({ ...s, profile: { ...p, onboarded: true }, tasks, flex: [], done: {} }));
  }, []);

  const restartSetup = useCallback(() => {
    setState((s) => ({ ...s, profile: { ...s.profile, onboarded: false } }));
  }, []);

  const isDone = useCallback((day: string, id: string) => (state.done[day] || []).includes(id), [state.done]);

  const toggleDone = useCallback((day: string, id: string) => {
    setState((s) => {
      const list = s.done[day] || [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...s, done: { ...s.done, [day]: next } };
    });
  }, []);

  const addTask = useCallback((t: NewTask, day: string) => {
    const id = `${Date.now()}`;
    setState((s) => {
      if (t.kind === 'flexible') {
        return { ...s, flex: [...s.flex, { id, title: t.title, duration: t.duration }] };
      }
      const color = NEW_COLORS[s.colorIndex % NEW_COLORS.length];
      const icon: IconName = t.kind === 'recurring' ? 'run' : 'sparkle';
      const task: SavedTask = {
        id,
        title: t.title,
        kind: t.kind,
        start: t.start,
        end: Math.min(t.start + t.duration, 24 * 60),
        color,
        icon,
        date: t.kind === 'fixed' ? day : undefined,
        days: t.kind === 'recurring' ? everyDayAsEmpty(t.days) : undefined,
      };
      return { ...s, tasks: [...s.tasks, task], colorIndex: s.colorIndex + 1 };
    });
  }, []);

  // Eine bestehende Aufgabe so zurückgeben, wie der Anlegen-Bildschirm sie braucht.
  const getTask = useCallback(
    (id: string): NewTask | undefined => {
      const t = state.tasks.find((x) => x.id === id);
      if (t) return { title: t.title, kind: t.kind, start: t.start, duration: t.end - t.start, days: t.days };
      const f = state.flex.find((x) => x.id === id);
      if (f) return { title: f.title, kind: 'flexible', start: 0, duration: f.duration };
      return undefined;
    },
    [state.tasks, state.flex],
  );

  // Aufgabe ändern. Wechselt die Art zwischen flexibel und fest/wiederkehrend, zieht sie in die andere Liste um.
  const updateTask = useCallback((id: string, t: NewTask, day: string) => {
    setState((s) => {
      const old = s.tasks.find((x) => x.id === id);
      const oldFlex = s.flex.find((x) => x.id === id);
      if (!old && !oldFlex) return s;
      if (t.kind === 'flexible') {
        // Bleibt an derselben Stelle der Warteschlange, wenn sie schon flexibel war.
        const item: FlexTask = { id, title: t.title, duration: t.duration };
        const flex = oldFlex ? s.flex.map((x) => (x.id === id ? item : x)) : [...s.flex, item];
        return { ...s, tasks: s.tasks.filter((x) => x.id !== id), flex };
      }
      const colorIndex = old ? s.colorIndex : s.colorIndex + 1;
      const task: SavedTask = {
        id,
        title: t.title,
        kind: t.kind,
        start: t.start,
        end: Math.min(t.start + t.duration, 24 * 60),
        color: old ? old.color : NEW_COLORS[s.colorIndex % NEW_COLORS.length],
        icon: old ? old.icon : t.kind === 'recurring' ? 'run' : 'sparkle',
        // Ein fester Termin behält seinen Tag; wird eine Aufgabe neu fest, gilt sie für den gewählten Tag.
        date: t.kind === 'fixed' ? (old?.kind === 'fixed' ? old.date : day) : undefined,
        days: t.kind === 'recurring' ? everyDayAsEmpty(t.days) : undefined,
      };
      const tasks = old ? s.tasks.map((x) => (x.id === id ? task : x)) : [...s.tasks, task];
      return { ...s, tasks, flex: s.flex.filter((x) => x.id !== id), colorIndex };
    });
  }, []);

  // Aufgabe ganz entfernen, auch aus den Abgehakt-Listen.
  const deleteTask = useCallback((id: string) => {
    setState((s) => {
      const done: Record<string, string[]> = {};
      for (const [day, ids] of Object.entries(s.done)) done[day] = ids.filter((x) => x !== id);
      return { ...s, tasks: s.tasks.filter((x) => x.id !== id), flex: s.flex.filter((x) => x.id !== id), done };
    });
  }, []);

  const planFlex = useCallback((flexId: string, start: number, day: string) => {
    setState((s) => {
      const f = s.flex.find((x) => x.id === flexId);
      if (!f) return s;
      const task: SavedTask = {
        id: f.id,
        title: f.title,
        kind: 'fixed',
        start,
        end: start + f.duration,
        color: 'butter',
        icon: 'sparkle',
        date: day,
      };
      return { ...s, tasks: [...s.tasks, task], flex: s.flex.filter((x) => x.id !== flexId) };
    });
  }, []);

  // Nach hinten in die Warteschlange stellen.
  const postponeFlex = useCallback((flexId: string) => {
    setState((s) => {
      const f = s.flex.find((x) => x.id === flexId);
      if (!f) return s;
      return { ...s, flex: [...s.flex.filter((x) => x.id !== flexId), f] };
    });
  }, []);

  const resetAll = useCallback(() => setState(initialState), []);

  const value = useMemo<Store>(
    () => ({
      ready,
      profile: state.profile,
      completeSetup,
      restartSetup,
      tasksFor,
      flexQueue: state.flex,
      isDone,
      toggleDone,
      addTask,
      getTask,
      updateTask,
      deleteTask,
      planFlex,
      postponeFlex,
      resetAll,
    }),
    [ready, state.profile, completeSetup, restartSetup, tasksFor, state.flex, isDone, toggleDone, addTask, getTask, updateTask, deleteTask, planFlex, postponeFlex, resetAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useTaskStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useTaskStore muss innerhalb von TaskStoreProvider benutzt werden');
  return s;
}
