import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BubbleColor, colors, fonts, radius } from '../theme';
import { formatTime } from '../data/tasks';
import { ROUTINES, RoutineTemplate, WEEK, formatDuration } from '../data/routines';
import { ReminderStyle, SetupRoutine, useTaskStore } from '../store/task-store';
import HoldButton from '../components/HoldButton';
import IntroScene from '../components/IntroAnimation';
import { MoonIcon, SunIcon } from '../components/Icons';

const DAY = 24 * 60;
const wrap = (m: number) => ((m % DAY) + DAY) % DAY;

type Chosen = Record<string, { start: number; duration: number; days: number[] }>;

const STYLES: { id: ReminderStyle; label: string; text: string; color: BubbleColor; dots: number }[] = [
  { id: 'soft', label: 'Sanft', text: 'Nur zum Start einer Aufgabe.', color: 'sky', dots: 1 },
  { id: 'balanced', label: 'Ausgewogen', text: 'Zum Start, und nach 15 Min nochmal, falls noch offen.', color: 'mint', dots: 2 },
  { id: 'push', label: 'Dranbleiben', text: 'Start, Nachhaken und Hinweis, wenn die Zeit um ist.', color: 'peach', dots: 3 },
];

// Die Einrichtung beim allerersten Start: 5 kurze Schritte.
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useTaskStore();
  const p = store.profile;
  const { width: W } = useWindowDimensions();

  const [step, setStep] = useState(0);
  const [wake, setWake] = useState(p.wake);
  const [sleep, setSleep] = useState(p.sleep);
  const [weekendDifferent, setWeekendDifferent] = useState(p.weekendDifferent);
  const [weekendWake, setWeekendWake] = useState(p.weekendWake);
  const [weekendSleep, setWeekendSleep] = useState(p.weekendSleep);
  const [chosen, setChosen] = useState<Chosen>({});
  const [focus, setFocus] = useState<string | null>(null);
  const [reminderStyle, setReminderStyle] = useState<ReminderStyle>(p.reminderStyle);
  const [reviewEnabled, setReviewEnabled] = useState(p.reviewEnabled);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  // Gewählte Routinen in Katalog-Reihenfolge; die Morgenroutine startet zur Aufstehzeit.
  const routines: (RoutineTemplate & { start: number; duration: number; days: number[] })[] = ROUTINES.filter(
    (r) => chosen[r.id],
  ).map((r) => ({ ...r, ...chosen[r.id] }));

  const toggleRoutine = (r: RoutineTemplate) => {
    if (chosen[r.id]) {
      const rest = { ...chosen };
      delete rest[r.id];
      setChosen(rest);
      if (focus === r.id) setFocus(null);
    } else {
      const start = r.id === 'morgen' ? wake : r.start;
      setChosen({ ...chosen, [r.id]: { start, duration: r.duration, days: r.days } });
      setFocus(r.id);
    }
  };

  const updateFocus = (patch: Partial<{ start: number; days: number[] }>) => {
    if (!focus) return;
    setChosen((c) => ({ ...c, [focus]: { ...c[focus], ...patch } }));
  };

  const finish = () => {
    const setup: SetupRoutine[] = routines.map((r) => ({
      title: r.label,
      color: r.color,
      icon: r.icon,
      start: r.start,
      duration: r.duration,
      days: r.days,
    }));
    store.completeSetup({ wake, sleep, weekendDifferent, weekendWake, weekendSleep, reminderStyle, reviewEnabled }, setup);
    router.replace('/');
  };

  const pad = { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) + 8 };

  // ---------- Schritt 0: Willkommen (mit der kleinen Szene oben) ----------
  if (step === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.lavender }, pad]}>
        <View style={styles.brand}>
          <Text style={styles.brandText}>SmoothStep</Text>
        </View>

        <View style={{ marginHorizontal: -20, marginTop: 8 }}>
          <IntroScene width={W} />
        </View>

        <View style={{ marginTop: 'auto', gap: 12 }}>
          <Text style={styles.hero} accessibilityRole="header">
            Hey, ich bin dein Alltagsfreund.
          </Text>
          <Text style={styles.lead}>
            Erzähl mir kurz, wie deine Woche aussieht. Dann plane ich mit dir, erinnere dich sanft und lerne mit der Zeit dazu.
          </Text>
          <Text style={styles.leadSmall}>Dauert etwa 2 Minuten.</Text>
        </View>
        <PrimaryButton label="Los geht’s →" onPress={next} dark />
      </View>
    );
  }

  // ---------- Schritt 4: Fertig ----------
  if (step === 4) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.lavender }, pad]}>
        <View style={[styles.blob, { top: -60, right: -60, width: 200, height: 200, backgroundColor: colors.mint }]} />
        <View style={styles.checkBlob}>
          <Text style={styles.checkText}>✓</Text>
        </View>
        <Text style={[styles.hero, { marginTop: 18 }]} accessibilityRole="header">
          Deine Woche steht.
        </Text>
        <Text style={[styles.lead, { marginTop: 8 }]}>
          Ab jetzt lerne ich mit. Passt etwas nicht, schlage ich dir abends eine Änderung vor.
        </Text>

        <View style={styles.weekCard}>
          <View style={styles.weekBars}>
            {WEEK.map((d) => {
              const today = routines.filter((r) => r.days.includes(d.js));
              return (
                <View key={d.js} style={styles.weekCol}>
                  <View style={styles.weekTrack}>
                    {today.map((r) => (
                      <View
                        key={r.id}
                        style={{
                          height: Math.max(14, Math.min(70, r.duration / 6)),
                          borderRadius: radius.pill,
                          backgroundColor: colors[r.color],
                        }}
                      />
                    ))}
                  </View>
                  <Text style={styles.weekDay}>{d.short}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legend}>
            {routines.map((r) => (
              <View key={r.id} style={styles.legendChip}>
                <View style={[styles.legendDot, { backgroundColor: colors[r.color] }]} />
                <Text style={styles.legendText}>{r.label}</Text>
              </View>
            ))}
            {routines.length === 0 && <Text style={styles.legendText}>Noch keine festen Routinen – kein Problem.</Text>}
          </View>
        </View>

        <PrimaryButton label="Zu meinem Tag →" onPress={finish} dark />
      </View>
    );
  }

  // ---------- Schritte 1–3 mit Fortschrittsbalken ----------
  return (
    <View style={[styles.screen, pad]}>
      <View style={styles.progressRow}>
        <Pressable onPress={back} style={styles.round} accessibilityRole="button" accessibilityLabel="Zurück">
          <Text style={styles.roundText}>‹</Text>
        </Pressable>
        <View style={styles.progress} accessibilityLabel={`Schritt ${step} von 3`}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.progressBar, i <= step && { backgroundColor: colors.accent }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ gap: 16, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <>
            <Title text="Wann beginnt und endet dein Tag?" sub="Daraus stelle ich deinen Wecker und lege den Abendrückblick fest." />
            <TimeCard label="Aufstehen" color="butter" icon={<SunIcon />} value={wake} onChange={setWake} />
            <TimeCard label="Schlafengehen" color="sky" icon={<MoonIcon />} value={sleep} onChange={setSleep} />
            <SwitchRow
              label="Am Wochenende anders"
              hint={weekendDifferent ? 'Sa und So haben eigene Zeiten' : 'Gleiche Zeiten an allen Tagen'}
              value={weekendDifferent}
              onToggle={() => setWeekendDifferent((v) => !v)}
            />
            {weekendDifferent && (
              <>
                <TimeCard label="Wochenende: Aufstehen" color="butter" icon={<SunIcon />} value={weekendWake} onChange={setWeekendWake} />
                <TimeCard label="Wochenende: Schlafengehen" color="sky" icon={<MoonIcon />} value={weekendSleep} onChange={setWeekendSleep} />
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Title text="Was gehört fest zu deiner Woche?" sub="Tipp an, was passt. Den Rest lerne ich mit der Zeit." />
            <View style={styles.chips}>
              {ROUTINES.map((r) => {
                const on = !!chosen[r.id];
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => (on && focus !== r.id ? setFocus(r.id) : toggleRoutine(r))}
                    onLongPress={() => on && toggleRoutine(r)}
                    style={[styles.chip, on && { backgroundColor: colors[r.color], borderColor: colors.ink }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.chipText, on && { fontFamily: fonts.semibold }]}>
                      {on ? '✓ ' : ''}
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {Object.keys(chosen).length > 0 && (
              <Text style={styles.small}>Antippen zum Bearbeiten, nochmal antippen zum Abwählen.</Text>
            )}

            {focus && chosen[focus] && (
              <FocusCard
                routine={ROUTINES.find((r) => r.id === focus)!}
                value={chosen[focus]}
                onChange={updateFocus}
                onRemove={() => toggleRoutine(ROUTINES.find((r) => r.id === focus)!)}
              />
            )}
          </>
        )}

        {step === 3 && (
          <>
            <Title text="Wie soll ich dich erinnern?" sub="Du kannst das jederzeit ändern." />
            {STYLES.map((s) => {
              const on = s.id === reminderStyle;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setReminderStyle(s.id)}
                  style={[styles.styleCard, { backgroundColor: colors[s.color] }, on && { borderColor: colors.ink }]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                >
                  <View style={styles.dots}>
                    {[1, 2, 3].map((i) => (
                      <View key={i} style={[styles.dot, { backgroundColor: i <= s.dots ? colors.ink : '#DDD7EA' }]} />
                    ))}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.styleLabel}>{s.label}</Text>
                    <Text style={styles.styleText}>{s.text}</Text>
                  </View>
                  <View style={[styles.radio, on && styles.radioOn]} />
                </Pressable>
              );
            })}
            <SwitchRow
              label="Abendrückblick"
              hint={`Um ${formatTime(wrap(sleep - 60))}, eine Stunde vorm Schlafengehen`}
              value={reviewEnabled}
              onToggle={() => setReviewEnabled((v) => !v)}
            />
          </>
        )}
      </ScrollView>

      <PrimaryButton label={step === 3 ? 'Fertig' : 'Weiter →'} onPress={next} />
    </View>
  );
}

// ---------- Kleine Bausteine ----------

function Title({ text, sub }: { text: string; sub: string }) {
  return (
    <View style={{ gap: 8, paddingHorizontal: 4 }}>
      <Text style={styles.h1} accessibilityRole="header">
        {text}
      </Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, dark }: { label: string; onPress: () => void; dark?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primary, dark && { backgroundColor: colors.ink }, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function TimeCard({
  label,
  color,
  icon,
  value,
  onChange,
}: {
  label: string;
  color: BubbleColor;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={[styles.timeCard, { backgroundColor: colors[color] }]}>
      <View style={styles.timeHead}>
        <View style={styles.iconRound}>{icon}</View>
        <Text style={styles.timeLabel}>{label}</Text>
      </View>
      <View style={styles.timeRow}>
        <HoldButton onStep={() => onChange(wrap(value - 15))} style={styles.stepper} accessibilityLabel={`${label} 15 Minuten früher`}>
          <Text style={styles.stepperText}>−</Text>
        </HoldButton>
        <Text style={styles.time}>{formatTime(value)}</Text>
        <HoldButton onStep={() => onChange(wrap(value + 15))} style={styles.stepper} accessibilityLabel={`${label} 15 Minuten später`}>
          <Text style={styles.stepperText}>+</Text>
        </HoldButton>
      </View>
    </View>
  );
}

function SwitchRow({ label, hint, value, onToggle }: { label: string; hint: string; value: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.switchRow} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <View style={{ flex: 1 }}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchHint}>{hint}</Text>
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={styles.knob} />
      </View>
    </Pressable>
  );
}

function FocusCard({
  routine,
  value,
  onChange,
  onRemove,
}: {
  routine: RoutineTemplate;
  value: { start: number; duration: number; days: number[] };
  onChange: (patch: Partial<{ start: number; days: number[] }>) => void;
  onRemove: () => void;
}) {
  const toggleDay = (js: number) => {
    const has = value.days.includes(js);
    onChange({ days: has ? value.days.filter((d) => d !== js) : [...value.days, js] });
  };
  const count = value.days.length;
  return (
    <View style={[styles.focus, { backgroundColor: colors[routine.color] }]}>
      <View style={styles.focusHead}>
        <Text style={styles.focusTitle}>{routine.label}</Text>
        <Pressable onPress={onRemove} style={styles.removePill} accessibilityRole="button">
          <Text style={styles.removeText}>Entfernen</Text>
        </Pressable>
      </View>

      <View style={styles.dayRow}>
        {WEEK.map((d) => {
          const on = value.days.includes(d.js);
          return (
            <Pressable
              key={d.js}
              onPress={() => toggleDay(d.js)}
              style={[styles.dayPill, on && styles.dayPillOn]}
              accessibilityRole="button"
              accessibilityLabel={d.long}
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.dayText, on && { color: '#FFFFFF' }]}>{d.short}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.focusTimeRow}>
        <HoldButton onStep={() => onChange({ start: wrap(value.start - 15) })} style={styles.stepperSmall} accessibilityLabel="15 Minuten früher">
          <Text style={styles.stepperText}>−</Text>
        </HoldButton>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.focusTime}>{formatTime(value.start)}</Text>
          <Text style={styles.small}>{formatDuration(value.duration)}</Text>
        </View>
        <HoldButton onStep={() => onChange({ start: wrap(value.start + 15) })} style={styles.stepperSmall} accessibilityLabel="15 Minuten später">
          <Text style={styles.stepperText}>+</Text>
        </HoldButton>
      </View>
      <Text style={styles.small}>
        {count === 0 ? 'Noch kein Tag gewählt.' : count === 7 ? 'Jeden Tag.' : `${count}× pro Woche.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground, paddingHorizontal: 20, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: radius.pill },
  logoBlob: { top: 240, left: 160, width: 72, height: 72, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: fonts.bold, fontSize: 34, color: '#FFFFFF' },
  brand: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface },
  brandText: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  hero: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 37, color: colors.ink, letterSpacing: -1 },
  lead: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: '#3A3550' },
  leadSmall: { fontFamily: fonts.semibold, fontSize: 14, color: '#3A3550' },
  primary: { marginTop: 20, height: 60, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fonts.semibold, fontSize: 18, color: '#FFFFFF' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  round: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  roundText: { fontFamily: fonts.semibold, fontSize: 26, color: colors.ink, marginTop: -3 },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  progressBar: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: '#DDD7EA' },
  h1: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 35, color: colors.ink, letterSpacing: -0.6 },
  sub: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, color: colors.inkSoft },
  timeCard: { padding: 18, borderRadius: 32, gap: 12 },
  timeHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconRound: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  timeLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { width: 52, height: 52, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  stepperSmall: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  stepperText: { fontFamily: fonts.medium, fontSize: 26, color: colors.ink },
  time: { fontFamily: fonts.bold, fontSize: 48, color: colors.ink, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingLeft: 18, paddingRight: 10, borderRadius: radius.pill, backgroundColor: colors.surface },
  switchLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  switchHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft },
  track: { width: 64, height: 44, borderRadius: radius.pill, backgroundColor: '#CFC9DD', padding: 4, justifyContent: 'center', alignItems: 'flex-start' },
  trackOn: { backgroundColor: colors.accent, alignItems: 'flex-end' },
  knob: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: '#FFFFFF' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 44, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 2, borderColor: 'transparent', justifyContent: 'center' },
  chipText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  small: { fontFamily: fonts.regular, fontSize: 13, color: '#3A3550' },
  focus: { padding: 18, borderRadius: 32, gap: 14 },
  focusHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  focusTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  removePill: { height: 36, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center' },
  removeText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  dayRow: { flexDirection: 'row', gap: 4 },
  dayPill: { flex: 1, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  dayPillOn: { backgroundColor: colors.ink },
  dayText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  focusTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  focusTime: { fontFamily: fonts.bold, fontSize: 34, color: colors.ink, fontVariant: ['tabular-nums'] },
  styleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 32, borderWidth: 3, borderColor: 'transparent' },
  dots: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
  styleLabel: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  styleText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 18, color: '#3A3550' },
  radio: { width: 24, height: 24, borderRadius: radius.pill, borderWidth: 2, borderColor: '#6E6886', backgroundColor: '#FFFFFF' },
  radioOn: { borderWidth: 7, borderColor: colors.ink },
  checkBlob: { width: 72, height: 72, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  checkText: { fontFamily: fonts.bold, fontSize: 34, color: '#FFFFFF' },
  weekCard: { marginTop: 18, padding: 16, borderRadius: 32, backgroundColor: colors.ground, gap: 14 },
  weekBars: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
  weekCol: { flex: 1, alignItems: 'center', gap: 8 },
  weekTrack: { width: '100%', height: 150, padding: 6, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'flex-end', gap: 4 },
  weekDay: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  legendChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surface },
  legendDot: { width: 12, height: 12, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.ink },
  legendText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
});
