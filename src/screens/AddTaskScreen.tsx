import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BubbleColor, colors, fonts, radius } from '../theme';
import { formatTime } from '../data/tasks';
import { WEEK } from '../data/routines';
import HoldButton from '../components/HoldButton';
import { TaskKind, dateKey, useTaskStore } from '../store/task-store';

const DAY = 24 * 60;

const QUICK_TIMES = [
  { label: 'Morgens', min: 8 * 60 },
  { label: 'Mittags', min: 12 * 60 },
  { label: 'Nachmittags', min: 16 * 60 },
  { label: 'Abends', min: 19 * 60 },
];

const KINDS: { id: TaskKind; label: string; mark: string; color: BubbleColor; hint: string }[] = [
  { id: 'fixed', label: 'Feste Uhrzeit', mark: '7:30', color: 'peach', hint: 'Termin mit Uhrzeit. Bleibt fest, mit Erinnerung vorher.' },
  { id: 'flexible', label: 'Flexibel', mark: '~', color: 'mint', hint: 'Ich suche dir eine freie Lücke und frag dann nach.' },
  { id: 'recurring', label: 'Immer wieder', mark: '↻', color: 'sky', hint: 'Kommt regelmäßig wieder, z. B. Training.' },
];

const DURATIONS = [
  { min: 15, label: '15 Min' },
  { min: 30, label: '30 Min' },
  { min: 60, label: '1 Std' },
  { min: 90, label: '1,5 Std' },
  { min: 0, label: 'Schätz du' },
];

const ALL_DAYS = WEEK.map((d) => d.js);

// Bildschirm zum Anlegen einer Aufgabe (öffnet sich über der Tagesansicht).
// Mit ?id=… öffnet er eine bestehende Aufgabe zum Bearbeiten und Löschen.
export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useTaskStore();
  // id: welche Aufgabe bearbeitet wird; day: an welchem Tag sie angetippt wurde (sonst heute).
  const { id, day } = useLocalSearchParams<{ id?: string; day?: string }>();
  // Nur beim Öffnen einmal nachschauen, damit Änderungen beim Tippen nicht überschrieben werden.
  const [existing] = useState(() => (id ? store.getTask(id) : undefined));
  const editing = !!(id && existing);

  // Vorschlag für die Uhrzeit: in etwa einer Stunde, auf die Viertelstunde gerundet.
  const [start, setStart] = useState(() => {
    if (existing && existing.kind !== 'flexible') return existing.start;
    const d = new Date();
    const nowMin = d.getHours() * 60 + d.getMinutes();
    return Math.min(Math.ceil(nowMin / 15) * 15 + 60, 23 * 60);
  });
  const [title, setTitle] = useState(existing?.title ?? '');
  const [kind, setKind] = useState<TaskKind>(existing?.kind ?? 'flexible');
  const [duration, setDuration] = useState(existing?.duration ?? 0);
  const [days, setDays] = useState<number[]>(existing?.days?.length ? existing.days : ALL_DAYS);

  const onClose = () => router.back();

  const showTime = kind !== 'flexible';
  const showDays = kind === 'recurring';
  const canSave = title.trim().length > 0 && (!showDays || days.length > 0);

  const toggleDay = (js: number) => setDays((ds) => (ds.includes(js) ? ds.filter((d) => d !== js) : [...ds, js]));

  const save = () => {
    if (!canSave) return;
    // „Schätz du": vorerst 30 Minuten. Später lernt die App das aus deinem Alltag.
    const task = { title: title.trim(), kind, start, duration: duration || 30, days: showDays ? days : undefined };
    if (editing && id) store.updateTask(id, task, day || dateKey());
    else store.addTask(task, dateKey());
    router.back();
  };

  // Sicherheitsabfrage, damit nichts aus Versehen verschwindet.
  const askDelete = () => {
    if (!editing || !id) return;
    Alert.alert('Aufgabe löschen?', `„${existing?.title}“ wird komplett entfernt.`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          store.deleteTask(id);
          router.back();
        },
      },
    ]);
  };

  // Läuft über Mitternacht weiter: nach 23:45 kommt 00:00 und umgekehrt.
  const shiftTime = (delta: number) => setStart((s) => (((s + delta) % DAY) + DAY) % DAY);

  return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingTop: insets.top + 12 }]}>
          <View style={styles.topRow}>
            <Text style={styles.h1} accessibilityRole="header">
              {editing ? 'Aufgabe ändern' : 'Was steht an?'}
            </Text>
            <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Schließen">
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <View style={styles.inputPill}>
              <Text style={styles.inputLabel}>Aufgabe</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="z. B. Paket zur Post bringen"
                placeholderTextColor="#6E6886"
                style={styles.input}
                returnKeyType="done"
                autoFocus={!editing}
                accessibilityLabel="Name der Aufgabe"
              />
            </View>
            {!editing && (
              <Text style={styles.tip}>Tipp: Mit dem Mikrofon auf der iPhone-Tastatur kannst du die Aufgabe auch einsprechen.</Text>
            )}

            <View style={styles.kindRow} accessibilityRole="radiogroup">
              {KINDS.map((k) => {
                const on = k.id === kind;
                return (
                  <Pressable
                    key={k.id}
                    onPress={() => setKind(k.id)}
                    style={[styles.kindCard, { backgroundColor: colors[k.color] }, on && styles.kindCardOn]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                  >
                    <View style={styles.kindMark}>
                      <Text style={styles.kindMarkText}>{k.mark}</Text>
                    </View>
                    <Text style={styles.kindLabel}>{k.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>{KINDS.find((k) => k.id === kind)?.hint}</Text>

            {showTime && (
              <View style={styles.timeCard}>
                <Text style={styles.sectionLabel}>Um wie viel Uhr?</Text>
                <View style={styles.timeRow}>
                  <HoldButton onStep={() => shiftTime(-15)} style={styles.stepper} accessibilityLabel="15 Minuten früher">
                    <Text style={styles.stepperText}>−</Text>
                  </HoldButton>
                  <Text style={styles.time} accessibilityLiveRegion="polite">
                    {formatTime(start)}
                  </Text>
                  <HoldButton onStep={() => shiftTime(15)} style={styles.stepper} accessibilityLabel="15 Minuten später">
                    <Text style={styles.stepperText}>+</Text>
                  </HoldButton>
                </View>
                <View style={styles.quickRow}>
                  {QUICK_TIMES.map((q) => {
                    const on = q.min === start;
                    return (
                      <Pressable
                        key={q.label}
                        onPress={() => setStart(q.min)}
                        style={[styles.quickChip, on && styles.quickChipOn]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${q.label} ${formatTime(q.min)}`}
                      >
                        <Text style={[styles.quickLabel, on && styles.quickTextOn]}>{q.label}</Text>
                        <Text style={[styles.quickTime, on && styles.quickTextOn]}>{formatTime(q.min)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.holdHint}>Tipp: − oder + gedrückt halten, dann läuft die Zeit schneller.</Text>
              </View>
            )}

            {showDays && (
              <View style={{ gap: 10 }}>
                <Text style={styles.sectionLabel}>An welchen Tagen?</Text>
                <View style={styles.dayRow}>
                  {WEEK.map((d) => {
                    const on = days.includes(d.js);
                    return (
                      <Pressable
                        key={d.js}
                        onPress={() => toggleDay(d.js)}
                        style={[styles.dayPill, on && styles.dayPillOn]}
                        accessibilityRole="button"
                        accessibilityLabel={d.long}
                        accessibilityState={{ selected: on }}
                      >
                        <Text style={[styles.dayText, on && styles.chipTextOn]}>{d.short}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.hint}>
                  {days.length === 0 ? 'Wähl mindestens einen Tag.' : days.length === 7 ? 'Jeden Tag.' : `${days.length}× pro Woche.`}
                </Text>
              </View>
            )}

            <View style={{ gap: 10 }}>
              <Text style={styles.sectionLabel}>Wie lange ungefähr?</Text>
              <View style={styles.chips}>
                {DURATIONS.map((d) => {
                  const on = d.min === duration;
                  return (
                    <Pressable
                      key={d.label}
                      onPress={() => setDuration(d.min)}
                      style={[styles.chip, on && styles.chipOn]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{d.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {editing && (
              <Pressable
                onPress={askDelete}
                style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
              >
                <Text style={styles.deleteText}>Aufgabe löschen</Text>
              </Pressable>
            )}
          </ScrollView>

          <Pressable
            onPress={save}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.saveButton,
              { marginBottom: Math.max(insets.bottom, 16) },
              !canSave && { opacity: 0.4 },
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
          >
            <Text style={styles.saveText}>{editing ? 'Speichern' : 'Los geht’s →'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.ground, paddingHorizontal: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  h1: { fontFamily: fonts.bold, fontSize: 30, color: colors.ink, letterSpacing: -0.5 },
  close: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: fonts.semibold, fontSize: 18, color: colors.ink },
  inputPill: { borderRadius: 28, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 12 },
  inputLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.inkSoft },
  input: { fontFamily: fonts.medium, fontSize: 18, color: colors.ink, paddingVertical: 4 },
  tip: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, marginTop: -8, paddingHorizontal: 6 },
  kindRow: { flexDirection: 'row', gap: 10 },
  kindCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  kindCardOn: { borderColor: colors.ink },
  kindMark: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  kindMarkText: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  kindLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, textAlign: 'center' },
  hint: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft, marginTop: -6, paddingHorizontal: 6 },
  timeCard: { borderRadius: 32, backgroundColor: colors.butter, padding: 18, gap: 10 },
  sectionLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { width: 52, height: 52, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  stepperText: { fontFamily: fonts.medium, fontSize: 26, color: colors.ink },
  time: { fontFamily: fonts.bold, fontSize: 44, color: colors.ink, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  quickRow: { flexDirection: 'row', gap: 6 },
  quickChip: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  quickChipOn: { backgroundColor: colors.ink },
  quickLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.inkSoft },
  quickTime: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  quickTextOn: { color: '#FFFFFF' },
  holdHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 44, paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  chipTextOn: { fontFamily: fonts.semibold, color: '#FFFFFF' },
  dayRow: { flexDirection: 'row', gap: 4 },
  dayPill: { flex: 1, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  dayPillOn: { backgroundColor: colors.ink },
  dayText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  deleteButton: {
    alignSelf: 'center',
    height: 44,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  deleteText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.inkSoft },
  saveButton: { height: 60, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: fonts.semibold, fontSize: 18, color: colors.onAccent },
});
