import { Platform } from 'react-native';

// ─── V-Guard Brand Colors (from official app) ─────────────────────────────────
// Primary = Amber/Gold  •  Dark header = near-black  •  White surfaces

export const colors = {
  // Brand — Amber is the hero color
  primary:       '#F5A623',   // V-Guard amber
  primaryDark:   '#C47A00',   // deep amber
  primaryLight:  '#FFD07A',   // light amber
  primaryFaint:  '#FFF4DC',   // amber wash

  // Dark header (as seen in V-Guard app bar)
  headerBg:      '#1A1A1A',
  headerText:    '#FFFFFF',

  // Semantic tints — keep recognisable but warm-shifted
  success:      '#34C759',
  successLight: '#D4F4E3',
  warning:      '#FF9F0A',
  warningLight: '#FFF3D0',
  error:        '#FF3B30',
  errorLight:   '#FFDEDE',
  info:         '#0057A8',   // V-Guard blue — used sparingly
  infoLight:    '#E8F2FC',

  // Apple-style system backgrounds (keep for iOS feel)
  background:        '#F2F2F7',
  backgroundSecond:  '#FFFFFF',
  surface:           '#FFFFFF',

  // Apple-style fills
  fillPrimary:   'rgba(120,120,128,0.20)',
  fillSecondary: 'rgba(120,120,128,0.16)',
  fillTertiary:  'rgba(118,118,128,0.12)',

  // Separators
  border:        'rgba(60,60,67,0.18)',
  borderOpaque:  '#C6C6C8',

  // Labels
  textPrimary:   '#1A1A1A',
  textSecondary: 'rgba(60,60,67,0.60)',
  textTertiary:  'rgba(60,60,67,0.30)',
  textHint:      'rgba(60,60,67,0.25)',

  white: '#FFFFFF',
  black: '#000000',

  // Water quality
  waterSoft:     '#34C759',
  waterModerate: '#FF9F0A',
  waterHard:     '#FF3B30',
  waterVeryHard: '#8B1A10',
} as const;

export type ColorKey = keyof typeof colors;

export const fontFamily = Platform.select({
  ios:     { fontFamily: '-apple-system' },
  android: { fontFamily: 'Roboto' },
  default: { fontFamily: 'System' },
}) as { fontFamily: string };
