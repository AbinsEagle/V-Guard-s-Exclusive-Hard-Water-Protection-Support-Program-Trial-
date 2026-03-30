import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing } from '../../src/theme';

const STEP_LABELS = ['Technician', 'Heater', 'Cartridge', 'Customer', 'Photos', 'Review'];

export default function ScanCartridgeScreen() {
  const { data, update } = useInstallation();
  const [cartridgeNumber, setCartridgeNumber] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const code = cartridgeNumber.trim();
    if (!code) { setError('Please enter the cartridge number'); return; }
    update({ cartridgeNumber: code });
    router.push('/install/customer-form');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>
          Cartridge Details
        </AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={3} totalSteps={6} labels={STEP_LABELS} />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Heater confirmed badge */}
        <View style={styles.confirmedBadge}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <AppText variant="caption" color={colors.success} style={styles.confirmedText}>
            Heater scanned: {data.heaterSerialNumber}
          </AppText>
        </View>

        {/* Instruction card */}
        <View style={styles.instructionCard}>
          <View style={styles.cartridgeIllustration}>
            <Ionicons name="water" size={40} color={colors.primary} />
            <View style={styles.arrowRight}>
              <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
            </View>
            <Ionicons name="home" size={40} color={colors.primaryLight} />
          </View>
          <AppText variant="h3" style={styles.instructionTitle}>
            Enter Anti-Scalant Cartridge Number
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.instructionDesc}>
            Find the unique number printed on the anti-scalant cartridge label. This links the cartridge to the water heater for the trial.
          </AppText>
        </View>

        {/* Input */}
        <View style={styles.inputSection}>
          <AppText variant="label" style={styles.fieldLabel}>
            Cartridge Number <AppText variant="label" color={colors.error}>*</AppText>
          </AppText>
          <View style={[styles.inputBox, error ? styles.inputBoxError : null]}>
            <Ionicons name="cube-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. VG-AS-00123"
              placeholderTextColor={colors.textHint}
              value={cartridgeNumber}
              onChangeText={(t) => { setCartridgeNumber(t.toUpperCase()); setError(''); }}
              autoCapitalize="characters"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>
          {error ? (
            <AppText variant="caption" color={colors.error} style={styles.errorText}>
              {error}
            </AppText>
          ) : null}
        </View>

        {/* Linking summary */}
        <View style={styles.linkCard}>
          <AppText variant="caption" color={colors.textSecondary} style={styles.linkLabel}>
            This will create the following link:
          </AppText>
          <View style={styles.linkRow}>
            <View style={styles.linkItem}>
              <AppText variant="caption" color={colors.textHint}>Water Heater</AppText>
              <AppText variant="label" color={colors.primary} numberOfLines={1}>
                {data.heaterSerialNumber}
              </AppText>
            </View>
            <Ionicons name="link" size={20} color={colors.accent} />
            <View style={styles.linkItem}>
              <AppText variant="caption" color={colors.textHint}>Cartridge</AppText>
              <AppText variant="label" color={cartridgeNumber ? colors.primary : colors.textHint} numberOfLines={1}>
                {cartridgeNumber || '—'}
              </AppText>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <AppText variant="label" color={colors.white}>Continue to Customer Details</AppText>
          <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: spacing.sm }} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryDark,
  },
  backBtn: { padding: spacing.xs },
  body: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  confirmedText: { fontWeight: '600' },
  instructionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cartridgeIllustration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  arrowRight: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.xs,
  },
  instructionTitle: { textAlign: 'center' },
  instructionDesc: { textAlign: 'center', lineHeight: 22 },
  inputSection: { gap: spacing.xs },
  fieldLabel: { marginBottom: spacing.xs },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  inputBoxError: { borderColor: colors.error },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    letterSpacing: 1,
  },
  errorText: { marginTop: 4 },
  linkCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  linkLabel: { textAlign: 'center' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  linkItem: { flex: 1, alignItems: 'center', gap: 2 },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
