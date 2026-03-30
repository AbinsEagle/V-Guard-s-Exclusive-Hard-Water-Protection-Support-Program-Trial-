export const colors = {
  // V-Guard Brand
  primary: '#0057A8',
  primaryDark: '#003E7E',
  primaryLight: '#4D8FCC',
  primaryFaint: '#E8F2FC',
  accent: '#F5A623',
  accentDark: '#D4891A',
  accentFaint: '#FEF3DC',

  // Semantic
  success: '#2E9E5B',
  successLight: '#D4F4E3',
  warning: '#E6A817',
  warningLight: '#FEF3D0',
  error: '#D93025',
  errorLight: '#FDDBD9',
  info: '#0097A7',
  infoLight: '#E0F7FA',

  // Neutrals
  background: '#F5F7FA',
  surface: '#FFFFFF',
  border: '#E0E6EF',
  borderDark: '#C5D0DF',
  textPrimary: '#1A2340',
  textSecondary: '#6B7A99',
  textHint: '#A0ABBE',
  white: '#FFFFFF',
  black: '#000000',

  // Water quality
  waterSoft: '#2E9E5B',
  waterModerate: '#E6A817',
  waterHard: '#D93025',
  waterVeryHard: '#8B1A10',
} as const;

export type ColorKey = keyof typeof colors;
