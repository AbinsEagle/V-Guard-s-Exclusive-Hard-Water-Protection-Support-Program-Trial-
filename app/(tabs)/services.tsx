import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/layout';
import { AppText, Card } from '../../src/components/common';
import { colors, spacing } from '../../src/theme';
import { SERVICE_PLANS } from '../../src/utils/constants';

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Screen>
        <View style={styles.header}>
          <AppText variant="h2" color={colors.white}>
            Services
          </AppText>
          <AppText variant="body" color={colors.primaryLight} style={styles.subtitle}>
            Your protection plans & add-ons
          </AppText>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Plan */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            Active Plan
          </AppText>
          <Card style={styles.activePlan}>
            <View style={styles.planBadge}>
              <AppText variant="caption" color={colors.white}>
                ACTIVE
              </AppText>
            </View>
            <AppText variant="h3" style={styles.planName}>
              Exclusive Protection Trial
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Hard water protection + free service visits
            </AppText>
            <View style={styles.planMeta}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <AppText variant="caption" color={colors.primary} style={styles.planMetaText}>
                Valid till: 30 Sep 2026
              </AppText>
            </View>
          </Card>

          {/* Available Services */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            Available Services
          </AppText>
          {SERVICE_PLANS.map((plan) => (
            <TouchableOpacity key={plan.id} activeOpacity={0.8}>
              <Card style={styles.serviceCard}>
                <View style={styles.serviceRow}>
                  <View style={styles.serviceIcon}>
                    <Ionicons name={plan.icon as any} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.serviceInfo}>
                    <AppText variant="label">{plan.name}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {plan.description}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
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
  subtitle: {
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '100%',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  activePlan: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  planName: {
    marginBottom: spacing.xs,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  planMetaText: {
    marginLeft: spacing.xs,
  },
  serviceCard: {
    marginBottom: spacing.sm,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  serviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
});
