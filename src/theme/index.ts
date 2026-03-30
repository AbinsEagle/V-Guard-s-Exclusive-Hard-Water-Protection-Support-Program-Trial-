export { colors, fontFamily }    from './colors';
export type { ColorKey }         from './colors';

export { spacing, radius }       from './spacing';
export type { SpacingKey, RadiusKey } from './spacing';

export { typography }            from './typography';
export type { TypographyVariant } from './typography';

// ─── Apple-style shadow presets ───────────────────────────────────────────────
export const shadows = {
  none: {},
  xs: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius:  2,
    elevation:     1,
  },
  sm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius:  8,
    elevation:     2,
  },
  md: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  16,
    elevation:     4,
  },
  lg: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius:  24,
    elevation:     8,
  },
} as const;
