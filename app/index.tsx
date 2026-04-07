import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../src/components/common/AppText';
import { useInstallation } from '../src/store/installationStore';
import { colors, spacing, radius, shadows } from '../src/theme';

export default function EntryScreen() {
  const { update } = useInstallation();
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '' });

  const validate = () => {
    const e = { name: '', phone: '' };
    if (!name.trim())  e.name  = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(phone.trim()))
      e.phone = 'Enter a valid 10-digit mobile number';
    setErrors(e);
    return !e.name && !e.phone;
  };

  const handleStart = () => {
    if (!validate()) return;
    update({ technicianName: name.trim(), technicianPhone: phone.trim() });
    router.push('/install/scan-heater');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Dark header bar ── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            </View>
            <View>
              <AppText variant="label" color={colors.white} style={styles.logoName}>
                V-GUARD
              </AppText>
              <AppText variant="caption2" color="rgba(255,255,255,0.55)" style={styles.logoTag}>
                INDUSTRIES LTD
              </AppText>
            </View>
          </View>
          <View style={styles.trialPill}>
            <AppText variant="caption2" color={colors.headerBg} style={styles.trialText}>
              TRIAL RUN
            </AppText>
          </View>
        </View>

        {/* ── Amber hero band ── */}
        <View style={styles.hero}>
          <AppText variant="h2" color={colors.headerBg} style={styles.heroTitle}>
            Hard Water{'\n'}Protection Program
          </AppText>
          <AppText variant="subhead" color={colors.primaryDark} style={styles.heroSub}>
            Exclusive Program · 10-Month Trial
          </AppText>
        </View>

        {/* ── Content area — flex, no scroll ── */}
        <View style={styles.content}>

          {/* Top block — form card + pills + note, uniform gap between each */}
          <View style={styles.topBlock}>

          {/* Form card floats over amber */}
          <View style={styles.formCard}>
            <AppText variant="caption2" color={colors.textTertiary} style={styles.formCardTitle}>
              SERVICE PERSON DETAILS
            </AppText>

            {/* Name */}
            <View style={styles.formRow}>
              <View style={styles.fieldIcon}>
                <Ionicons name="person-outline" size={16} color={colors.primaryDark} />
              </View>
              <View style={styles.fieldBody}>
                <AppText variant="caption" style={styles.fieldLabel}>Full Name</AppText>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Your name"
                  placeholderTextColor={colors.textHint}
                  value={name}
                  onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>
            {errors.name ? <FieldError msg={errors.name} /> : null}

            <View style={styles.rowDivider} />

            {/* Phone */}
            <View style={styles.formRow}>
              <View style={styles.fieldIcon}>
                <Ionicons name="call-outline" size={16} color={colors.primaryDark} />
              </View>
              <View style={styles.fieldBody}>
                <AppText variant="caption" style={styles.fieldLabel}>Mobile Number</AppText>
                <View style={styles.phoneRow}>
                  <AppText variant="body" color={colors.textSecondary}>+91  </AppText>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    placeholder="10-digit number"
                    placeholderTextColor={colors.textHint}
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t.replace(/\D/g, '').slice(0, 10));
                      setErrors((e) => ({ ...e, phone: '' }));
                    }}
                    keyboardType="number-pad"
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={handleStart}
                  />
                </View>
              </View>
            </View>
            {errors.phone ? <FieldError msg={errors.phone} /> : null}
          </View>

          {/* Trial briefing — one line, no fluff */}
          <View style={styles.briefingRow}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>
              Customer selected for the trial. Complete all 5 steps to register the installation.
            </AppText>
          </View>

          </View>{/* end topBlock */}

          {/* Bottom block — CTA + footer, fixed at bottom */}
          <View style={styles.bottomBlock}>
          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.75}>
            <AppText variant="label" color={colors.headerBg}>Start Installation</AppText>
            <View style={styles.startBtnArrow}>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>

          <AppText variant="caption2" color={colors.textTertiary} style={styles.footer}>
            For internal use only · V-Guard R&D
          </AppText>
          </View>{/* end bottomBlock */}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg: string }) {
  return (
    <View style={errStyles.row}>
      <Ionicons name="alert-circle" size={12} color={colors.error} />
      <AppText variant="caption" color={colors.error}>{msg}</AppText>
    </View>
  );
}

const errStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 2,
  },
});


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.headerBg },
  flex: { flex: 1 },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoBox:  {
    width: 34, height: 34, borderRadius: radius.sm,
    backgroundColor: 'rgba(245,166,35,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoName: { letterSpacing: 2 },
  logoTag:  { letterSpacing: 1 },
  trialPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 2, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  trialText: { fontWeight: '800', letterSpacing: 1 },

  // ── Hero ──
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
    alignItems: 'center',
  },
  heroTitle: { lineHeight: 36, textAlign: 'center' },
  heroSub:   { textAlign: 'center' },

  // ── Content ──
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  topBlock: { gap: spacing.md },
  bottomBlock: { gap: spacing.sm },

  // ── Form card ──
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
    borderTopWidth: 3, borderTopColor: colors.primary,
    borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0,
  },
  formCardTitle: {
    letterSpacing: 1.5, fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md, paddingBottom: spacing.xs,
  },
  formRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    gap: spacing.md, minHeight: 52,
  },
  fieldIcon: {
    width: 30, height: 30, borderRadius: radius.sm,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  fieldBody:  { flex: 1 },
  fieldLabel: { color: colors.textSecondary, marginBottom: 1, fontSize: 12 },
  fieldInput: { fontSize: 16, color: colors.textPrimary, padding: 0 },
  phoneRow:   { flexDirection: 'row', alignItems: 'center' },
  rowDivider: {
    height: 0.5, backgroundColor: colors.borderOpaque,
    marginLeft: spacing.md + 30 + spacing.md,
  },

  briefingRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
    backgroundColor: colors.successLight,
    borderRadius: radius.md, padding: spacing.sm,
  },


  // ── CTA ──
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl, paddingVertical: spacing.md,
    ...shadows.md,
  },
  startBtnArrow: {
    marginLeft: spacing.md,
    backgroundColor: colors.primaryDark,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },

  footer: { textAlign: 'center' },
});
