import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { AppText } from '../common/AppText';
import { colors, spacing } from '../../theme';
import { HardnessLevel } from '../../types';
import { getHardnessColor, getHardnessLabel, formatTimeAgo } from '../../utils';

interface WaterQualityCardProps {
  hardnessLevel: HardnessLevel;
  tdsValue: number;
  phValue: number;
  lastUpdated: string;
}

interface MetricProps {
  label: string;
  value: string;
  unit: string;
  icon: string;
  iconColor: string;
}

function Metric({ label, value, unit, icon, iconColor }: MetricProps) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon as any} size={16} color={iconColor} />
      </View>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
      <View style={styles.metricValue}>
        <AppText variant="h3">{value}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {' '}{unit}
        </AppText>
      </View>
    </View>
  );
}

export function WaterQualityCard({
  hardnessLevel,
  tdsValue,
  phValue,
  lastUpdated,
}: WaterQualityCardProps) {
  const levelColor = getHardnessColor(hardnessLevel);
  const levelLabel = getHardnessLabel(hardnessLevel);

  return (
    <Card>
      {/* Hardness Badge */}
      <View style={styles.topRow}>
        <View>
          <AppText variant="label">Water Hardness</AppText>
          <View style={[styles.badge, { backgroundColor: levelColor + '22' }]}>
            <View style={[styles.dot, { backgroundColor: levelColor }]} />
            <AppText variant="caption" color={levelColor}>
              {levelLabel}
            </AppText>
          </View>
        </View>
        <AppText variant="caption" color={colors.textSecondary}>
          Updated {formatTimeAgo(lastUpdated)}
        </AppText>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <Metric
          label="TDS"
          value={String(tdsValue)}
          unit="ppm"
          icon="water-outline"
          iconColor={levelColor}
        />
        <View style={styles.metricDivider} />
        <Metric
          label="pH"
          value={phValue.toFixed(1)}
          unit=""
          icon="flask-outline"
          iconColor={colors.info}
        />
        <View style={styles.metricDivider} />
        <Metric
          label="Status"
          value={tdsValue > 500 ? 'High' : tdsValue > 300 ? 'Moderate' : 'Good'}
          unit=""
          icon="checkmark-circle-outline"
          iconColor={tdsValue > 500 ? colors.error : tdsValue > 300 ? colors.warning : colors.success}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});
