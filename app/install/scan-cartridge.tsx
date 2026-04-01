import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing, radius, shadows } from '../../src/theme';

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
        <AppText variant="h3" color={colors.white}>Cartridge Details</AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={3} totalSteps={6} labels={STEP_LABELS} />

      {/* Body — no scroll, space-between layout */}
      <View style={styles.body}>
        <View style={styles.bodyContent}>

          {/* Heater confirmed badge */}
          <View style={styles.confirmedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <AppText variant="caption" color={colors.success} style={styles.confirmedText}>
              Heater: {data.heaterSerialNumber}
            </AppText>
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <AppText variant="h3">Enter Cartridge Number</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Find the number printed on the anti-scalant cartridge label.
            </AppText>
          </View>

          {/* Input */}
          <View>
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
              <AppText variant="caption" color={colors.error} style={styles.errorText}>{error}</AppText>
            ) : null}
          </View>

          {/* Link preview card */}
          <View style={styles.linkCard}>
            <View style={styles.linkItem}>
              <View style={styles.linkIconBox}>
                <Ionicons name="flame-outline" size={16} color={colors.white} />
              </View>
              <View style={styles.linkTextBlock}>
                <AppText variant="caption2" color={colors.textSecondary}>Water Heater</AppText>
                <AppText variant="label" color={colors.textPrimary} numberOfLines={1}>
                  {data.heaterSerialNumber}
                </AppText>
              </View>
            </View>

            <View style={styles.linkConnector}>
              <View style={styles.linkDot} />
              <Ionicons name="link" size={16} color={colors.primary} />
              <View style={styles.linkDot} />
            </View>

            <View style={styles.linkItem}>
              <View style={styles.linkIconBox}>
                <Ionicons name="cube-outline" size={16} color={colors.white} />
              </View>
              <View style={styles.linkTextBlock}>
                <AppText variant="caption2" color={colors.textSecondary}>Cartridge</AppText>
                <AppText
                  variant="label"
                  color={cartridgeNumber ? colors.textPrimary : colors.textHint}
                  numberOfLines={1}
                >
                  {cartridgeNumber || '—'}
                </AppText>
              </View>
            </View>
          </View>

        </View>

        {/* CTA anchored at bottom */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <AppText variant="label" color={colors.headerBg}>Continue to Customer Details</AppText>
          <View style={styles.btnArrow}>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.headerBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.headerBg,
  },
  backBtn: { padding: spacing.xs },

  body: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  bodyContent: { gap: spacing.md },

  confirmedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: 10, alignSelf: 'flex-start',
  },
  confirmedText: { fontWeight: '600' },

  headingBlock: { gap: spacing.xs },

  fieldLabel: { marginBottom: spacing.xs },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, minHeight: 50,
  },
  inputBoxError: { borderColor: colors.error },
  inputIcon:    { marginRight: spacing.sm },
  input: {
    flex: 1, fontSize: 16, color: colors.textPrimary,
    paddingVertical: spacing.sm, letterSpacing: 1,
  },
  errorText: { marginTop: 4 },

  // Link preview
  linkCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.sm,
  },
  linkItem:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linkIconBox:  {
    width: 30, height: 30, borderRadius: radius.sm,
    backgroundColor: colors.headerBg,
    alignItems: 'center', justifyContent: 'center',
  },
  linkTextBlock: { flex: 1 },
  linkConnector: { alignItems: 'center', gap: 2 },
  linkDot:       { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.borderOpaque },

  // CTA
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg, paddingVertical: spacing.md,
    ...shadows.sm,
  },
  btnArrow: {
    marginLeft: spacing.md,
    backgroundColor: colors.primaryDark,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
});
