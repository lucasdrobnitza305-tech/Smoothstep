import React from 'react';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

const base = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function CheckIcon({ size = 20, color = '#23202E', strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...base} stroke={color} strokeWidth={strokeWidth}>
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function PlusIcon({ size = 26, color = '#FFFFFF', strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...base} stroke={color} strokeWidth={strokeWidth}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function SunIcon({ size = 20, color = '#23202E', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...base} stroke={color} strokeWidth={strokeWidth}>
      <Circle cx="12" cy="12" r="4" />
      <Line x1="12" y1="2" x2="12" y2="4" />
      <Line x1="12" y1="20" x2="12" y2="22" />
      <Line x1="2" y1="12" x2="4" y2="12" />
      <Line x1="20" y1="12" x2="22" y2="12" />
    </Svg>
  );
}

export function MoonIcon({ size = 22, color = '#23202E', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...base} stroke={color} strokeWidth={strokeWidth}>
      <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </Svg>
  );
}

export function SparkleIcon({ size = 22, color = '#23202E', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...base} stroke={color} strokeWidth={strokeWidth}>
      <Path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <Path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </Svg>
  );
}

export function RunIcon({ size = 22, color = '#23202E', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...base} stroke={color} strokeWidth={strokeWidth}>
      <Circle cx="13" cy="4" r="2" />
      <Path d="M7 21l3-6 3 2v5" />
      <Path d="M10 15l1-5 4 3 3-1" />
      <Path d="M6 11l4-1" />
    </Svg>
  );
}

export function BagIcon({ size = 22, color = '#23202E', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...base} stroke={color} strokeWidth={strokeWidth}>
      <Path d="M5 8h14l-1 12H6z" />
      <Path d="M9 8a3 3 0 0 1 6 0" />
    </Svg>
  );
}

export function GridIcon({ size = 22, color = '#23202E', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...base} stroke={color} strokeWidth={strokeWidth}>
      <Circle cx="6" cy="6" r="2.5" />
      <Circle cx="18" cy="6" r="2.5" />
      <Circle cx="6" cy="18" r="2.5" />
      <Circle cx="18" cy="18" r="2.5" />
    </Svg>
  );
}
