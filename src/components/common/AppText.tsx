import { Text, TextStyle, StyleSheet } from 'react-native';
import { typography, TypographyVariant, useColors } from '../../theme';

// Variants that use the dimmer secondary color by default
const SECONDARY_VARIANTS = new Set<TypographyVariant>(['caption', 'caption2', 'sectionTitle']);

interface AppTextProps {
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  numberOfLines?: number;
}

export function AppText({
  variant = 'body',
  color,
  style,
  children,
  numberOfLines,
}: AppTextProps) {
  const colors = useColors();

  // Derive the correct theme-aware default; explicit color prop always wins
  const resolvedColor = color ?? (
    SECONDARY_VARIANTS.has(variant) ? colors.textSecondary : colors.textPrimary
  );

  const textStyle: TextStyle[] = [
    typography[variant],
    { color: resolvedColor },
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ];

  return (
    <Text style={StyleSheet.flatten(textStyle)} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}
