import React, { useEffect, useRef } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';

type Props = {
  onStep: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  children: React.ReactNode;
};

// Ein Knopf, der beim Gedrückthalten immer wieder auslöst und dabei schneller wird.
// Antippen = ein Schritt. Halten = nach kurzer Pause läuft es los, erst gemütlich, dann zügig.
export default function HoldButton({ onStep, style, accessibilityLabel, children }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useRef(0);
  const stepRef = useRef(onStep);
  stepRef.current = onStep;

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  // Je länger gehalten, desto kürzer die Pause zwischen zwei Schritten.
  const delayFor = (n: number) => {
    if (n < 3) return 220;
    if (n < 8) return 130;
    if (n < 16) return 80;
    return 50;
  };

  const tick = () => {
    stepRef.current();
    count.current += 1;
    timer.current = setTimeout(tick, delayFor(count.current));
  };

  const start = () => {
    stop();
    count.current = 0;
    stepRef.current(); // sofort ein Schritt beim Antippen
    timer.current = setTimeout(tick, 400); // dann nach kurzer Pause Dauerlauf
  };

  useEffect(() => stop, []);

  return (
    <Pressable
      onPressIn={start}
      onPressOut={stop}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.92 }], opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Gedrückt halten, um schneller zu wechseln"
    >
      {children}
    </Pressable>
  );
}
