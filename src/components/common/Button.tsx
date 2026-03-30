import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { AppText } from './AppText';
import { colors, radius, shadows, spacing } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'tinted' | 'ghost' | 'destructive';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label:      string;
  onPress:    () => void;
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
  disabled?:  boolean;
  style?:     ViewStyle;
  fullWidth?: boolean;
  icon?:      React.ReactNode;
}

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary:     colors.white,
  secondary:   colors.primary,
  tinted:      colors.primary,
  ghost:       colors.primary,
  destructive: colors.white,
};

export function Button({
  label,
  onPress,
  variant    = 'primary',
  size       = 'md',
  isLoading  = false,
  disabled   = false,
  style,
  fullWidth  = false,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth  && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? colors.white : colors.primary}
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconSlot}>{icon}</View>}
          <AppText
            variant={size === 'sm' ? 'subhead' : 'label'}
            color={TEXT_COLOR[variant]}
          >
            {label}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems:      'center',
    justifyContent:  'center',
    borderRadius:    radius.pill,
  },
  inner: {
    flexDirection:  'row',
    alignItems:     'center',
  },
  iconSlot: {
    marginRight: spacing.xs,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  secondary: {
    backgroundColor: colors.fillTertiary,
  },
  tinted: {
    backgroundColor: colors.primaryFaint,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.error,
  },

  // Sizes — follow Apple's recommended touch-target heights
  size_sm: {
    paddingVertical:   8,
    paddingHorizontal: 16,
    minHeight:         34,
  },
  size_md: {
    paddingVertical:   14,
    paddingHorizontal: 24,
    minHeight:         50,
  },
  size_lg: {
    paddingVertical:   17,
    paddingHorizontal: 32,
    minHeight:         56,
  },

  fullWidth:  { width: '100%' },
  disabled:   { opacity: 0.38 },
});
