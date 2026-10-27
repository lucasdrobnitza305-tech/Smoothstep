// SmoothStep – Farben, Schrift und Formen an einer Stelle.
// Wenn du den Look ändern willst, fängst du hier an.

export const colors = {
  ground: '#F1EEF6', // Hintergrund der App
  surface: '#FFFFFF', // weiße Bubbles
  ink: '#23202E', // Haupttext, dunkle Knöpfe
  inkSoft: '#4A4560', // Nebentext
  accent: '#5B45D6', // Lila für Hauptaktionen
  onAccent: '#FFFFFF',

  // Pastellfarben für Aufgaben
  lavender: '#CFC5F7',
  lavenderDeep: '#B4A6F0',
  mint: '#BFEBD9',
  peach: '#FFD3BF',
  sky: '#C4E1FA',
  butter: '#FBE7A6',

  blobLavender: '#E3DCFB',
  blobPeach: '#FFE2D4',
};

export type BubbleColor = 'lavender' | 'mint' | 'peach' | 'sky' | 'butter';

export const radius = {
  pill: 999,
  card: 36,
  bubble: 30,
};

export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
};
