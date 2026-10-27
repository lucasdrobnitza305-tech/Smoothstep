import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, radius } from '../theme';
import { formatTime } from '../data/tasks';
import { dateKey, useTaskStore } from '../store/task-store';

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// Die nächsten 7 Tage als Bubbles, ohne Kalender-Raster.
export default function WeekScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useTaskStore();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 20, gap: 12 }}>
        <View style={styles.topRow}>
          <Text style={styles.h1} accessibilityRole="header">
            Deine Woche
          </Text>
          <Pressable onPress={() => router.back()} style={styles.close} accessibilityRole="button" accessibilityLabel="Schließen">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {days.map((d, i) => {
          const key = dateKey(d);
          const tasks = store
            .tasksFor(key)
            .filter((t) => t.id !== 'rueckblick')
            .sort((a, b) => a.start - b.start);
          return (
            <View key={key} style={[styles.day, i === 0 && styles.today]}>
              <View style={styles.dayHead}>
                <Text style={[styles.dayName, i === 0 && { color: '#FFFFFF' }]}>
                  {i === 0 ? 'Heute' : i === 1 ? 'Morgen' : WEEKDAYS[d.getDay()]}
                </Text>
                <Text style={[styles.count, i === 0 && { color: '#DCD4FB' }]}>{tasks.length} Aufgaben</Text>
              </View>
              <View style={styles.chips}>
                {tasks.map((t) => (
                  <View key={t.id} style={[styles.chip, { backgroundColor: colors[t.color] }]}>
                    <Text style={styles.chipTime}>{formatTime(t.start)}</Text>
                    <Text style={styles.chipText} numberOfLines={1}>
                      {t.title}
                    </Text>
                  </View>
                ))}
                {tasks.length === 0 && <Text style={styles.free}>Frei</Text>}
              </View>
            </View>
          );
        })}

        <Pressable
          onPress={() => {
            router.back();
            store.restartSetup(); // die Startseite leitet dann von selbst zur Einrichtung
          }}
          style={styles.restart}
          accessibilityRole="button"
        >
          <Text style={styles.restartText}>Einrichtung neu starten</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  h1: { fontFamily: fonts.bold, fontSize: 32, color: colors.ink, letterSpacing: -0.6 },
  close: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: fonts.semibold, fontSize: 18, color: colors.ink },
  day: { padding: 16, borderRadius: 30, backgroundColor: colors.surface, gap: 10 },
  today: { backgroundColor: colors.ink },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  dayName: { fontFamily: fonts.bold, fontSize: 19, color: colors.ink },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, maxWidth: '100%' },
  chipTime: { fontFamily: fonts.semibold, fontSize: 12, color: '#3A3550' },
  chipText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, flexShrink: 1 },
  restart: { marginTop: 8, height: 48, borderRadius: radius.pill, borderWidth: 2, borderColor: '#CFC9DD', alignItems: 'center', justifyContent: 'center' },
  restartText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.inkSoft },
  free: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkSoft },
});
