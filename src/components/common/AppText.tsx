import { Text, TextStyle, StyleSheet } from 'react-native';
import { typography, TypographyVariant } from '../../theme';

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
  const textStyle: TextStyle[] = [
    typography[variant],
    color ? { color } : {},
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ];

  return (
    <Text style={StyleSheet.flatten(textStyle)} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}
