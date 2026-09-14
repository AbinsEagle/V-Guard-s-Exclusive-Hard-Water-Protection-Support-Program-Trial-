import { Platform, useColorScheme } from 'react-native';

// ─── V-Guard Brand Colors ──────────────────────────────────────────────────────

export const lightColors = {
  // Brand
  primary:       '#F5A623',
  primaryDark:   '#C47A00',
  primaryLight:  '#FFD07A',
  primaryFaint:  '#FFF4DC',

  // Dark header
  headerBg:      '#1A1A1A',
  headerText:    '#FFFFFF',

  // Semantic
  success:      '#34C759',
  successLight: '#D4F4E3',
  warning:      '#FF9F0A',
  warningLight: '#FFF3D0',
  error:        '#FF3B30',
  errorLight:   '#FFDEDE',
  info:         '#0057A8',
  infoLight:    '#E8F2FC',

  // Backgrounds / surfaces
  background:       '#F2F2F7',
  backgroundSecond: '#FFFFFF',
  surface:          '#FFFFFF',

  // Fills
  fillPrimary:   'rgba(120,120,128,0.20)',
  fillSecondary: 'rgba(120,120,128,0.16)',
  fillTertiary:  'rgba(118,118,128,0.12)',

  // Separators
  border:       'rgba(60,60,67,0.18)',
  borderOpaque: '#C6C6C8',

  // Text
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

export const darkColors = {
  ...lightColors,
  // Backgrounds / surfaces
  background:       '#000000',
  backgroundSecond: '#1C1C1E',
  surface:          '#2C2C2E',
  // Separators
  border:       'rgba(255,255,255,0.15)',
  borderOpaque: '#3A3A3C',
  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: 'rgba(235,235,245,0.60)',
  textTertiary:  'rgba(235,235,245,0.30)',
  textHint:      'rgba(235,235,245,0.25)',
  // Fills
  fillPrimary:   'rgba(120,120,128,0.36)',
  fillSecondary: 'rgba(120,120,128,0.32)',
  fillTertiary:  'rgba(118,118,128,0.24)',
  // Tinted backgrounds
  primaryFaint:  'rgba(245,166,35,0.15)',
  successLight:  'rgba(52,199,89,0.18)',
  warningLight:  'rgba(255,159,10,0.18)',
  errorLight:    'rgba(255,59,48,0.18)',
  infoLight:     'rgba(0,87,168,0.18)',
} as const;

// Backward-compat alias (used by generateConsentDocument.ts which is non-React)
export const colors = lightColors;

export type ColorKey = keyof typeof lightColors;

export function useColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

export const fontFamily = Platform.select({
  ios:     { fontFamily: '-apple-system' },
  android: { fontFamily: 'Roboto' },
  default: { fontFamily: 'System' },
}) as { fontFamily: string };
