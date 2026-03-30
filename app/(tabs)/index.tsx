import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screen } from '../../src/components/layout';
import { AppText } from '../../src/components/common';
import { WaterQualityCard, ServiceStatusCard, AlertBanner } from '../../src/components/features';
import { colors, spacing } from '../../src/theme';
import { useWaterStatus } from '../../src/hooks';

export default function HomeScreen() {
  const { waterData, alerts } = useWaterStatus();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Screen>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AppText variant="caption" color={colors.primaryLight}>
              V-Guard Exclusive Program
            </AppText>
            <AppText variant="h2" color={colors.white}>
              Hard Water Protection
            </AppText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Alert Banner */}
          {alerts.length > 0 && (
            <AlertBanner
              message={alerts[0].message}
              type={alerts[0].type}
            />
          )}

          {/* Water Quality Status */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            Water Quality
          </AppText>
          <WaterQualityCard
            hardnessLevel={waterData.hardnessLevel}
            tdsValue={waterData.tds}
            phValue={waterData.ph}
            lastUpdated={waterData.lastUpdated}
          />

          {/* Service Status */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            Protection Status
          </AppText>
          <ServiceStatusCard
            deviceName={waterData.deviceName}
            filterHealth={waterData.filterHealth}
            nextServiceDate={waterData.nextServiceDate}
            isActive={waterData.isActive}
          />
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryDark,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '100%',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
});
