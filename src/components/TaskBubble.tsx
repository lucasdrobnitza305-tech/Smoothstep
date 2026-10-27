import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { IconName, Task, formatTime } from '../data/tasks';
import { BagIcon, MoonIcon, RunIcon, SparkleIcon, SunIcon } from './Icons';

export function TaskIcon({ name }: { name: IconName }) {
  switch (name) {
    case 'sun':
      return <SunIcon />;
    case 'bag':
    case 'work':
      return <BagIcon />;
    case 'run':
      return <RunIcon />;
    case 'moon':
      return <MoonIcon />;
    default:
      return <SparkleIcon />;
  }
}

// Eine weiße, pillenförmige Zeile für eine kommende Aufgabe. Antippen öffnet sie zum Bearbeiten.
export default function TaskBubble({ task, onPress }: { task: Task; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={`${task.title} um ${formatTime(task.start)}`}
      accessibilityHint="Zum Bearbeiten antippen"
    >
      <View style={[styles.iconBlob, { backgroundColor: colors[task.color] }]}>
        <TaskIcon name={task.icon} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {task.title}
      </Text>
      <View style={styles.timeChip}>
        <Text style={styles.time}>{formatTime(task.start)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  iconBlob: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  timeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.ground },
  time: { fontFamily: fonts.semibold, fontSize: 13, color: colors.inkSoft },
});
