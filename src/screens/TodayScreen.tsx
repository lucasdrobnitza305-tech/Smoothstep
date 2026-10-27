import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, radius } from '../theme';
import { currentTask, findGap, formatTime, greeting, minutesNow, upcomingTasks } from '../data/tasks';
import { dateKey, useTaskStore } from '../store/task-store';
import ProgressRing from '../components/ProgressRing';
import TaskBubble from '../components/TaskBubble';
import FloatingNav from '../components/FloatingNav';
import { CheckIcon, GridIcon, SparkleIcon } from '../components/Icons';

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const DAY_TABS = ['Heute', 'Morgen', 'Diese Woche'];

function dateLabel(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

// Hält die aktuelle Uhrzeit aktuell, damit sich die hervorgehobene Aufgabe von selbst wechselt.
function useClock(intervalMs = 30_000) {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setDate(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return date;
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const date = useClock();
  const now = minutesNow(date);
  const today = dateKey(date);

  const store = useTaskStore();
  const tasks = store.tasksFor(today);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [laterNote, setLaterNote] = useState<string | null>(null);
  const [dayTab, setDayTab] = useState(0);

  const current = currentTask(tasks, now);
  const next = upcomingTasks(tasks, now);
  const currentDone = current ? store.isDone(today, current.id) : false;

  // Was heute schon vorbei oder abgehakt ist.
  const doneCount = tasks.filter((t) => t.end <= now || store.isDone(today, t.id)).length;

  // Nächste flexible Aufgabe, die heute nicht schon zurückgestellt wurde.
  const flex = store.flexQueue.find((f) => !skippedIds.includes(f.id));
  const nextQuarter = Math.ceil(now / 15) * 15;
  const gapStart = useMemo(
    () => (flex ? findGap(tasks, nextQuarter, flex.duration) : undefined),
    [tasks, nextQuarter, flex],
  );

  const toggleDone = () => {
    if (current) store.toggleDone(today, current.id);
  };

  const planFlex = () => {
    if (!flex || gapStart === undefined) return;
    store.planFlex(flex.id, gapStart, today);
    setLaterNote(null);
  };

  const skipFlex = () => {
    if (!flex) return;
    store.postponeFlex(flex.id);
    setSkippedIds((ids) => [...ids, flex.id]);
    setLaterNote(`Okay, ich erinnere dich morgen an „${flex.title}“.`);
  };

  // Fortschritt der aktuellen Aufgabe: wie viel der Zeit schon um ist.
  const progress = current ? (now - current.start) / (current.end - current.start) : 0;
  const remaining = current ? current.end - now : 0;
  const minutesToNext = next[0] ? next[0].start - now : undefined;

  return (
    <View style={styles.screen}>
      <View style={styles.blobBig} pointerEvents="none" />
      <View style={styles.blobSmall} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ gap: 8 }}>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>{dateLabel(date)}</Text>
            </View>
            <Text style={styles.h1} accessibilityRole="header">
              {greeting(now)}
            </Text>
          </View>
          <Pressable
            style={styles.roundButton}
            onPress={() => router.push('/week')}
            accessibilityRole="button"
            accessibilityLabel="Wochenübersicht"
          >
            <GridIcon />
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {DAY_TABS.map((label, i) => {
            const on = i === dayTab;
            return (
              <Pressable
                key={label}
                onPress={() => setDayTab(i)}
                style={[styles.tab, on && styles.tabOn]}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.tabText, on && styles.tabTextOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {current ? (
          <View style={styles.nowCard}>
            <View style={styles.nowRow}>
              <ProgressRing
                progress={currentDone ? 1 : progress}
                top={currentDone ? 'Top' : String(remaining)}
                bottom={currentDone ? 'fertig' : 'Min'}
                label={currentDone ? 'Aufgabe erledigt' : `Noch ${remaining} Minuten`}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.nowBadge}>
                  <Text style={styles.nowBadgeText}>Jetzt dran</Text>
                </View>
                <Text style={styles.nowTitle} numberOfLines={2}>
                  {current.title}
                </Text>
                <Text style={styles.nowSub}>bis {formatTime(current.end)}</Text>
              </View>
            </View>
            <Pressable
              onPress={toggleDone}
              style={({ pressed }) => [
                styles.bigButton,
                currentDone ? styles.bigButtonDone : styles.bigButtonAccent,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
            >
              {currentDone ? (
                <Text style={[styles.bigButtonText, { color: colors.ink }]}>Stark gemacht! Rückgängig</Text>
              ) : (
                <>
                  <CheckIcon color={colors.onAccent} />
                  <Text style={styles.bigButtonText}>Geschafft</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={[styles.nowCard, { backgroundColor: colors.mint }]}>
            <Text style={styles.nowTitle}>Gerade frei</Text>
            <Text style={styles.nowSub}>
              {next[0]
                ? `Als Nächstes: ${next[0].title} in ${minutesToNext} Min`
                : 'Für heute steht nichts mehr an. Genieß den Abend.'}
            </Text>
          </View>
        )}

        <View style={styles.sectionHead}>
          <Text style={styles.h3} accessibilityRole="header">
            Danach
          </Text>
          <View style={styles.doneChip}>
            <Text style={styles.doneChipText}>{doneCount} geschafft</Text>
          </View>
        </View>

        <View style={styles.list}>
          {flex && gapStart !== undefined && (
            <View style={styles.suggest}>
              <View style={styles.suggestRow}>
                <View style={[styles.iconBlob, { backgroundColor: colors.surface }]}>
                  <SparkleIcon />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestSmall}>{formatTime(gapStart)} ist frei</Text>
                  <Text style={styles.suggestTitle}>{flex.title}?</Text>
                </View>
              </View>
              <View style={styles.suggestActions}>
                <Pressable onPress={planFlex} style={[styles.smallPill, { backgroundColor: colors.ink }]} accessibilityRole="button">
                  <Text style={[styles.smallPillText, { color: '#FFFFFF' }]}>Einplanen</Text>
                </Pressable>
                <Pressable onPress={skipFlex} style={[styles.smallPill, { backgroundColor: colors.surface }]} accessibilityRole="button">
                  <Text style={styles.smallPillText}>Später</Text>
                </Pressable>
              </View>
            </View>
          )}
          {laterNote && <Text style={styles.note}>{laterNote}</Text>}

          {next.map((t) => (
            <TaskBubble key={t.id} task={t} />
          ))}
          {next.length === 0 && <Text style={styles.note}>Nichts mehr geplant. Zeit für dich.</Text>}
        </View>
      </ScrollView>

      <FloatingNav
        bottomInset={insets.bottom}
        onAdd={() => router.push('/add')}
        onReview={() => router.push('/review')}
        onWeek={() => router.push('/week')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground, overflow: 'hidden' },
  blobBig: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: radius.pill,
    backgroundColor: colors.blobLavender,
  },
  blobSmall: {
    position: 'absolute',
    top: 110,
    right: 90,
    width: 70,
    height: 70,
    borderRadius: radius.pill,
    backgroundColor: colors.blobPeach,
  },
  header: { paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  datePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  datePillText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.inkSoft },
  h1: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 36, color: colors.ink, letterSpacing: -0.6 },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { flexDirection: 'row', gap: 8, marginTop: 16, paddingHorizontal: 24 },
  tab: { height: 44, paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center' },
  tabOn: { backgroundColor: colors.ink },
  tabText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  tabTextOn: { fontFamily: fonts.semibold, color: '#FFFFFF' },
  nowCard: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colors.lavender,
    gap: 14,
  },
  nowRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  nowBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  nowBadgeText: { fontFamily: fonts.semibold, fontSize: 12, color: '#FFFFFF' },
  nowTitle: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 32, color: colors.ink, letterSpacing: -0.3 },
  nowSub: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkSoft },
  bigButton: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bigButtonAccent: { backgroundColor: colors.accent },
  bigButtonDone: { backgroundColor: colors.surface },
  bigButtonText: { fontFamily: fonts.semibold, fontSize: 17, color: colors.onAccent },
  sectionHead: {
    marginTop: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h3: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  doneChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.mint },
  doneChipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  list: { marginTop: 10, paddingHorizontal: 20, gap: 8 },
  iconBlob: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  suggest: { padding: 12, paddingLeft: 10, borderRadius: radius.bubble, backgroundColor: colors.butter, gap: 10 },
  suggestRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  suggestSmall: { fontFamily: fonts.semibold, fontSize: 13, color: colors.inkSoft },
  suggestTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  suggestActions: { flexDirection: 'row', gap: 8, paddingLeft: 62 },
  smallPill: { height: 44, paddingHorizontal: 18, borderRadius: radius.pill, justifyContent: 'center' },
  smallPillText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  note: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkSoft, paddingHorizontal: 8 },
});
