import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing } from '../../src/theme';

export default function SuccessScreen() {
  const { data, reset } = useInstallation();

  const handleNewInstallation = () => {
    reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* Success icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="checkmark" size={48} color={colors.white} />
            </View>
          </View>
        </View>

        {/* Message */}
        <AppText variant="h2" style={styles.title}>
          Installation Recorded!
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
          The anti-scalant unit has been successfully linked and the installation record has been saved.
        </AppText>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <SummaryRow icon="water" label="Heater" value={data.heaterSerialNumber} />
          <View style={styles.summaryDivider} />
          <SummaryRow icon="cube" label="Cartridge" value={data.cartridgeNumber} />
          <View style={styles.summaryDivider} />
          <SummaryRow icon="person" label="Customer" value={`+91 ${data.customerWhatsApp}`} />
          <View style={styles.summaryDivider} />
          <SummaryRow
            icon="calendar"
            label="Date"
            value={new Date(data.installationDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          />
        </View>

        {/* Next steps */}
        <View style={styles.nextStepsCard}>
          <AppText variant="label" style={styles.nextTitle}>What happens next?</AppText>
          <NextStep
            number="1"
            text="Customer will receive a WhatsApp confirmation of enrollment"
          />
          <NextStep
            number="2"
            text="A follow-up survey will be sent every 2 months to track effectiveness"
          />
          <NextStep
            number="3"
            text="R&D team will monitor all data on the dashboard"
          />
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNewInstallation}>
          <Ionicons name="add-circle-outline" size={20} color={colors.headerBg} />
          <AppText variant="label" color={colors.headerBg} style={{ marginLeft: spacing.sm }}>
            New Installation
          </AppText>
        </TouchableOpacity>

        <AppText variant="caption" color={colors.textHint} style={styles.footer}>
          V-Guard R&D · Hard Water Protection Trial
        </AppText>

      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={sumStyles.row}>
      <Ionicons name={icon as any} size={16} color={colors.primary} />
      <AppText variant="caption" color={colors.textSecondary} style={sumStyles.label}>{label}</AppText>
      <AppText variant="label" numberOfLines={1} style={sumStyles.value}>{value}</AppText>
    </View>
  );
}

function NextStep({ number, text }: { number: string; text: string }) {
  return (
    <View style={nsStyles.row}>
      <View style={nsStyles.numberCircle}>
        <AppText variant="caption" color={colors.primary} style={nsStyles.number}>{number}</AppText>
      </View>
      <AppText variant="caption" color={colors.textSecondary} style={nsStyles.text}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1, alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  iconWrapper: { marginTop: spacing.xl, marginBottom: spacing.sm },
  iconOuter: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.successLight,
    alignItems: 'center', justifyContent: 'center',
  },
  iconInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.md },
  summaryCard: {
    width: '100%', backgroundColor: colors.surface,
    borderRadius: 16, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.xs,
  },
  summaryDivider: { height: 1, backgroundColor: colors.border },
  nextStepsCard: {
    width: '100%', backgroundColor: colors.surface,
    borderRadius: 16, padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1, borderColor: colors.borderOpaque,
  },
  nextTitle: { marginBottom: spacing.xs },
  primaryBtn: {
    width: '100%', flexDirection: 'row',
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.sm,
  },
  footer: { marginTop: 'auto' },
});

const sumStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 2 },
  label: { flex: 1 },
  value: { flex: 2, textAlign: 'right' },
});

const nsStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  numberCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary,
    borderWidth: 1.5, borderColor: colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  number: { fontWeight: '700', fontSize: 11, color: colors.headerBg },
  text: { flex: 1, lineHeight: 18 },
});
