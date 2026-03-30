import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../common/AppText';
import { colors, spacing } from '../../theme';
import { AlertType } from '../../types';

interface AlertBannerProps {
  message: string;
  type: AlertType;
}

const ALERT_CONFIG: Record<AlertType, { bg: string; border: string; icon: string; color: string }> = {
  info: { bg: colors.infoLight, border: colors.info, icon: 'information-circle', color: colors.info },
  warning: { bg: colors.warningLight, border: colors.warning, icon: 'warning', color: colors.warning },
  error: { bg: colors.errorLight, border: colors.error, icon: 'alert-circle', color: colors.error },
  success: { bg: colors.successLight, border: colors.success, icon: 'checkmark-circle', color: colors.success },
};

export function AlertBanner({ message, type }: AlertBannerProps) {
  const config = ALERT_CONFIG[type];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bg, borderLeftColor: config.border },
      ]}
    >
      <Ionicons name={config.icon as any} size={18} color={config.color} />
      <AppText variant="caption" color={config.color} style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  message: {
    flex: 1,
    lineHeight: 18,
  },
});
