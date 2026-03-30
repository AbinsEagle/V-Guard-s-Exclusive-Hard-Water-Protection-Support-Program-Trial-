import { Platform } from 'react-native';

// ─── V-Guard Brand ────────────────────────────────────────────────────────────
// Blue stays V-Guard blue. Neutrals follow Apple's HIG system palette.

export const colors = {
  // Brand
  primary:       '#0057A8',
  primaryDark:   '#003E7E',
  primaryLight:  '#4D8FCC',
  primaryFaint:  '#E8F2FC',
  accent:        '#F5A623',
  accentDark:    '#D4891A',
  accentFaint:   '#FEF3DC',

  // Apple-style backgrounds (light mode)
  background:       '#F2F2F7',   // iOS systemGroupedBackground
  backgroundSecond: '#FFFFFF',   // iOS secondarySystemGroupedBackground
  surface:          '#FFFFFF',
  surfaceRaised:    '#FFFFFF',

  // Apple-style fills
  fillPrimary:   'rgba(120,120,128,0.20)',
  fillSecondary: 'rgba(120,120,128,0.16)',
  fillTertiary:  'rgba(118,118,128,0.12)',

  // Apple-style separators
  border:        'rgba(60,60,67,0.18)',  // iOS separator
  borderOpaque:  '#C6C6C8',             // iOS opaqueSeparator

  // Apple-style labels
  textPrimary:   '#000000',
  textSecondary: 'rgba(60,60,67,0.60)',
  textTertiary:  'rgba(60,60,67,0.30)',
  textHint:      'rgba(60,60,67,0.25)',

  // Semantic (Apple HIG tints)
  success:      '#34C759',
  successLight: '#D4F4E3',
  warning:      '#FF9F0A',
  warningLight: '#FFF3D0',
  error:        '#FF3B30',
  errorLight:   '#FFDEDE',
  info:         '#0057A8',   // use brand blue for info
  infoLight:    '#E8F2FC',

  // Misc
  white: '#FFFFFF',
  black: '#000000',

  // Water quality
  waterSoft:     '#34C759',
  waterModerate: '#FF9F0A',
  waterHard:     '#FF3B30',
  waterVeryHard: '#8B1A10',
} as const;

export type ColorKey = keyof typeof colors;

// ─── System font stack (SF Pro on Apple, Roboto on Android) ──────────────────
export const fontFamily = Platform.select({
  ios:     { fontFamily: '-apple-system' },
  android: { fontFamily: 'Roboto' },
  default: { fontFamily: 'System' },
}) as { fontFamily: string };
