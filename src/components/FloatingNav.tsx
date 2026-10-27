import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { MoonIcon, PlusIcon, SunIcon } from './Icons';

type Props = {
  bottomInset: number;
  onAdd: () => void;
  onReview: () => void;
};

// Die schwebende, dunkle Pillen-Navigation mit dem lila Plus in der Mitte.
export default function FloatingNav({ bottomInset, onAdd, onReview }: Props) {
  return (
    <View style={[styles.wrap, { bottom: Math.max(bottomInset, 12) + 12 }]} accessibilityRole="tablist">
      <Pressable style={styles.active} accessibilityRole="tab" accessibilityState={{ selected: true }}>
        <SunIcon color={colors.ink} />
        <Text style={styles.activeText}>Heute</Text>
      </Pressable>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [styles.add, pressed && { transform: [{ scale: 0.94 }] }]}
        accessibilityRole="button"
        accessibilityLabel="Neue Aufgabe hinzufügen"
      >
        <PlusIcon />
      </Pressable>
      <Pressable onPress={onReview} style={styles.iconButton} accessibilityRole="tab" accessibilityLabel="Abendrückblick">
        <MoonIcon color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 72,
    padding: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.ink,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  active: {
    height: 56,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  add: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: { width: 56, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
