import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

// Apple HIG text styles — SF Pro on iOS, Roboto on Android
const sys = Platform.select({
  ios:     '-apple-system',
  android: 'Roboto',
  default: 'System',
});

export const typography = StyleSheet.create({
  // Large Title  — iOS nav large title
  h1: {
    fontFamily: sys,
    fontSize:   34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: 0.37,
    color: colors.textPrimary,
  },
  // Title 1
  h2: {
    fontFamily: sys,
    fontSize:   28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: 0.36,
    color: colors.textPrimary,
  },
  // Title 2
  h3: {
    fontFamily: sys,
    fontSize:   22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.35,
    color: colors.textPrimary,
  },
  // Section header (all-caps, tight tracking)
  sectionTitle: {
    fontFamily: sys,
    fontSize:   13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  // Headline
  label: {
    fontFamily: sys,
    fontSize:   17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.41,
    color: colors.textPrimary,
  },
  // Body
  body: {
    fontFamily: sys,
    fontSize:   17,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.41,
    color: colors.textPrimary,
  },
  // Subheadline
  subhead: {
    fontFamily: sys,
    fontSize:   15,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
    color: colors.textPrimary,
  },
  // Footnote / caption
  caption: {
    fontFamily: sys,
    fontSize:   13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.08,
    color: colors.textSecondary,
  },
  // Caption 2
  caption2: {
    fontFamily: sys,
    fontSize:   12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
});

export type TypographyVariant = keyof typeof typography;
