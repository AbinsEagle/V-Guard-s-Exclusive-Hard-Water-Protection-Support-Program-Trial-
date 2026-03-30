import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../../theme';

type CardVariant = 'default' | 'inset' | 'plain';

interface CardProps {
  children:  React.ReactNode;
  style?:    ViewStyle | ViewStyle[];
  variant?:  CardVariant;
  noPadding?: boolean;
}

export function Card({ children, style, variant = 'default', noPadding }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        noPadding && styles.noPadding,
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius:     radius.lg,
    padding:          16,
    backgroundColor:  colors.surface,
  },
  // Default — white card on grey background, hair-line border + soft shadow
  default: {
    ...shadows.sm,
    borderWidth:  0.5,
    borderColor:  colors.borderOpaque,
  },
  // Inset — sits inside another card / grouped list section
  inset: {
    backgroundColor: colors.fillTertiary,
    borderRadius:    radius.md,
  },
  // Plain — no shadow, no border; background only
  plain: {},

  noPadding: { padding: 0 },
});
