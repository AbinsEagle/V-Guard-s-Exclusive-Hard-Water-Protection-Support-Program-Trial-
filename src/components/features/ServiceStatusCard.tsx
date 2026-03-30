import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { AppText } from '../common/AppText';
import { colors, spacing } from '../../theme';
import { getFilterHealthColor, formatDate } from '../../utils';

interface ServiceStatusCardProps {
  deviceName: string;
  filterHealth: number;
  nextServiceDate: string;
  isActive: boolean;
}

export function ServiceStatusCard({
  deviceName,
  filterHealth,
  nextServiceDate,
  isActive,
}: ServiceStatusCardProps) {
  const healthColor = getFilterHealthColor(filterHealth);

  return (
    <Card>
      {/* Device Name + Active */}
      <View style={styles.topRow}>
        <View style={styles.deviceInfo}>
          <View style={styles.deviceIcon}>
            <Ionicons name="water" size={18} color={colors.primary} />
          </View>
          <View>
            <AppText variant="label">{deviceName}</AppText>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? colors.success : colors.error }]} />
              <AppText variant="caption" color={isActive ? colors.success : colors.error}>
                {isActive ? 'Active' : 'Inactive'}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Filter Health Bar */}
      <View style={styles.healthSection}>
        <View style={styles.healthLabelRow}>
          <AppText variant="caption" color={colors.textSecondary}>
            Filter Health
          </AppText>
          <AppText variant="caption" color={healthColor}>
            {filterHealth}%
          </AppText>
        </View>
        <View style={styles.healthBarTrack}>
          <View
            style={[
              styles.healthBarFill,
              { width: `${filterHealth}%` as any, backgroundColor: healthColor },
            ]}
          />
        </View>
      </View>

      {/* Next Service */}
      <View style={styles.serviceRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
        <AppText variant="caption" color={colors.textSecondary}>
          Next service: {formatDate(nextServiceDate)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthSection: {
    marginBottom: spacing.md,
  },
  healthLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  healthBarTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
