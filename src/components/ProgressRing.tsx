import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';

type Props = {
  size?: number;
  stroke?: number;
  progress: number; // 0 bis 1
  top: string;
  bottom: string;
  label: string; // für Screenreader
};

export default function ProgressRing({ size = 84, stroke = 10, progress, top, bottom, label }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={label}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.lavenderDeep} strokeWidth={stroke} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * clamped} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.top}>{top}</Text>
        <Text style={styles.bottom}>{bottom}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  top: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink, lineHeight: 22 },
  bottom: { fontFamily: fonts.semibold, fontSize: 11, color: colors.inkSoft },
});
