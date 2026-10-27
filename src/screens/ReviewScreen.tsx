import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, radius } from '../theme';
import { minutesNow } from '../data/tasks';
import { dateKey, useTaskStore } from '../store/task-store';
import ProgressRing from '../components/ProgressRing';

const REASONS = [
  { id: 'zeit', label: 'Keine Zeit', reply: 'Notiert: Der Tag war zu voll.' },
  { id: 'vergessen', label: 'Vergessen', reply: 'Notiert: Ich erinnere dich früher.' },
  { id: 'energie', label: 'Keine Energie', reply: 'Notiert: Vielleicht war die Uhrzeit ungünstig.' },
  { id: 'dazwischen', label: 'Kam was dazwischen', reply: 'Passiert. Ich ändere nichts.' },
  { id: 'unnoetig', label: 'Doch nicht nötig', reply: 'Okay, verstanden.' },
];

// Abendrückblick: was hat geklappt, was ist liegen geblieben und warum.
// (Die Gründe werden noch nicht gespeichert – das kommt mit dem Mitlernen.)
export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useTaskStore();
  const today = dateKey();
  const now = minutesNow();

  // Bisher fällige Aufgaben (ohne den Rückblick selbst).
  const due = store.tasksFor(today).filter((t) => t.id !== 'rueckblick' && t.start <= now);
  const done = due.filter((t) => store.isDone(today, t.id));
  const missed = due.filter((t) => !store.isDone(today, t.id));
  const [reasons, setReasons] = useState<Record<string, string>>({});

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 20, gap: 12 }}>
        <View style={styles.topRow}>
          <Text style={styles.h1} accessibilityRole="header">
            Na, wie war{'\n'}dein Tag?
          </Text>
          <Pressable onPress={() => router.back()} style={styles.pill} accessibilityRole="button">
            <Text style={styles.pillText}>Später</Text>
          </Pressable>
        </View>

        <View style={styles.summary}>
          <ProgressRing
            size={72}
            stroke={9}
            progress={due.length ? done.length / due.length : 0}
            top={`${done.length}/${due.length}`}
            bottom="erledigt"
            label={`${done.length} von ${due.length} Aufgaben abgehakt`}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.summaryTitle}>{missed.length === 0 ? 'Alles geschafft!' : 'Guter Einsatz'}</Text>
            <Text style={styles.summaryText} numberOfLines={2}>
              {done.length ? done.map((t) => t.title).join(', ') : 'Heute noch nichts abgehakt.'}
            </Text>
          </View>
        </View>

        {missed.map((t) => {
          const reason = REASONS.find((r) => r.id === reasons[t.id]);
          return (
            <View key={t.id} style={styles.missed}>
              <Text style={styles.small}>Liegen geblieben</Text>
              <Text style={styles.missedTitle}>{t.title}</Text>
              {reason ? (
                <View style={styles.replyRow}>
                  <Text style={styles.reply}>{reason.reply}</Text>
                  <Pressable onPress={() => setReasons((r) => ({ ...r, [t.id]: '' }))} style={styles.chip}>
                    <Text style={styles.chipText}>Ändern</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text style={styles.ask}>Woran lag’s? Ein Tipp reicht.</Text>
                  <View style={styles.chips}>
                    {REASONS.map((r) => (
                      <Pressable
                        key={r.id}
                        onPress={() => setReasons((x) => ({ ...x, [t.id]: r.id }))}
                        style={styles.chip}
                        accessibilityRole="button"
                      >
                        <Text style={styles.chipText}>{r.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        })}

        <Pressable onPress={() => router.back()} style={styles.night} accessibilityRole="button">
          <Text style={styles.nightText}>Gute Nacht</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E6E1F0' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  h1: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 33, color: colors.ink, letterSpacing: -0.5 },
  pill: { height: 44, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center' },
  pillText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 32, backgroundColor: colors.mint },
  summaryTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  summaryText: { fontFamily: fonts.regular, fontSize: 14, color: '#3A3550' },
  missed: { padding: 18, borderRadius: 32, backgroundColor: colors.peach, gap: 6 },
  small: { fontFamily: fonts.semibold, fontSize: 13, color: '#3A3550' },
  missedTitle: { fontFamily: fonts.bold, fontSize: 19, color: colors.ink },
  ask: { fontFamily: fonts.regular, fontSize: 14, color: '#3A3550', marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: { height: 44, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center' },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  replyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  reply: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  night: { marginTop: 8, height: 56, borderRadius: radius.pill, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  nightText: { fontFamily: fonts.semibold, fontSize: 17, color: '#FFFFFF' },
});
