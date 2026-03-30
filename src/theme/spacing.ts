// Apple HIG spacing: multiples of 4, generous breathing room
export const spacing = {
  xs:   4,
  sm:   8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl: 64,
} as const;

// Apple-style corner radii
export const radius = {
  sm:   8,
  md:  12,
  lg:  16,
  xl:  20,
  pill: 999,
} as const;

export type SpacingKey = keyof typeof spacing;
export type RadiusKey  = keyof typeof radius;
