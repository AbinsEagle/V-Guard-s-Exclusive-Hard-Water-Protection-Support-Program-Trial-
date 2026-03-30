import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Hero illustration ── */}
          <View style={styles.hero}>
            {/* Brand row */}
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <AppText variant="caption" color="rgba(255,255,255,0.65)" style={styles.brandText}>
                V-GUARD INDUSTRIES
              </AppText>
              <View style={styles.trialPill}>
                <AppText variant="caption2" color={colors.accentDark} style={styles.trialText}>
                  TRIAL RUN
                </AppText>
              </View>
            </View>

            {/* Visual illustration — water + heater + protection */}
            <View style={styles.illustration}>
              {/* Background glow circles */}
              <View style={styles.glowOuter} />
              <View style={styles.glowInner} />

              {/* Central icon cluster */}
              <View style={styles.illustrationCenter}>
                {/* Heater unit */}
                <View style={styles.heaterBox}>
                  <Ionicons name="water" size={28} color={colors.white} />
                  <AppText variant="caption2" color="rgba(255,255,255,0.75)" style={styles.heaterLabel}>
                    Water Heater
                  </AppText>
                </View>

                {/* Connection arrow */}
                <View style={styles.connectorLine}>
                  <View style={styles.connectorDot} />
                  <View style={styles.connectorTrack} />
                  <View style={styles.connectorDot} />
                </View>

                {/* Anti-scalant cartridge */}
                <View style={[styles.heaterBox, styles.cartridgeBox]}>
                  <Ionicons name="shield-checkmark" size={28} color={colors.accent} />
                  <AppText variant="caption2" color="rgba(255,255,255,0.75)" style={styles.heaterLabel}>
                    Anti-Scalant
                  </AppText>
                </View>
              </View>

              {/* Floating stat chips */}
              <View style={[styles.statChip, styles.statChipLeft]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <AppText variant="caption2" color={colors.white} style={styles.statText}>
                  Scale Protection
                </AppText>
              </View>
              <View style={[styles.statChip, styles.statChipRight]}>
                <Ionicons name="time-outline" size={12} color={colors.accent} />
                <AppText variant="caption2" color={colors.white} style={styles.statText}>
                  10-Month Trial
                </AppText>
              </View>
            </View>

            {/* Large title */}
            <AppText variant="h2" style={styles.heroTitle}>
              Hard Water{'\n'}Protection Program
            </AppText>
          </View>

          {/* ── Enrollment message — FIRST & prominent ── */}
          <View style={styles.enrollCard}>
            <View style={styles.enrollHeader}>
              <View style={styles.enrollIconRing}>
                <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
              </View>
              <AppText variant="label" style={styles.enrollTitle}>
                You've been selected!
              </AppText>
            </View>

            <AppText variant="body" style={styles.enrollMsg}>
              You've been selected for{' '}
              <AppText variant="body" style={styles.enrollBold}>
                V-Guard's Exclusive Hard Water Protection Program.
              </AppText>
              {' '}This installation provides additional protection for your heater while
              helping us understand real-world performance.
            </AppText>

            {/* Benefit pills */}
            <View style={styles.benefitRow}>
              <BenefitChip icon="water-outline"     label="Scale Reduction" />
              <BenefitChip icon="flash-outline"     label="Better Efficiency" />
              <BenefitChip icon="heart-outline"     label="Free Service" />
            </View>

            <View style={styles.enrollDivider} />

            <AppText variant="caption" color={colors.textSecondary} style={styles.enrollFooter}>
              Your usage and feedback will help fine-tune this technology and explore
              additional value for hard-water users.{'\n'}
              <AppText variant="caption" color={colors.primary}>— Team V-Guard</AppText>
            </AppText>
          </View>

          {/* ── Scale formation note ── */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <AppText variant="caption" color={colors.textSecondary} style={styles.noteText}>
              Scale formation depends on local water chemistry and usage patterns.
              Lab testing showed strong results — but real homes vary. This trial
              helps us quantify real-world effectiveness.
            </AppText>
          </View>

          {/* ── Service person form ── */}
          <View style={styles.section}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              Service Person Details
            </AppText>

            <View style={styles.formCard}>
              {/* Name */}
              <View style={styles.formRow}>
                <View style={styles.fieldIcon}>
                  <Ionicons name="person-outline" size={17} color={colors.textSecondary} />
                </View>
                <View style={styles.fieldBody}>
                  <AppText variant="caption" style={styles.fieldLabel}>Full Name</AppText>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter your name"
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
                  <Ionicons name="call-outline" size={17} color={colors.textSecondary} />
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
          </View>

          {/* ── CTA ── */}
          <View style={styles.ctaSection}>
            <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.82}>
              <AppText variant="label" color={colors.white} style={styles.startBtnText}>
                Start Installation
              </AppText>
              <View style={styles.startBtnArrow}>
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <AppText variant="caption2" color={colors.textTertiary} style={styles.footer}>
            For internal use only · V-Guard R&D
          </AppText>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BenefitChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={chipStyles.chip}>
      <Ionicons name={icon as any} size={13} color={colors.primary} />
      <AppText variant="caption2" color={colors.primary} style={chipStyles.label}>{label}</AppText>
    </View>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <View style={errStyles.row}>
      <Ionicons name="alert-circle" size={13} color={colors.error} />
      <AppText variant="caption" color={colors.error} style={errStyles.text}>{msg}</AppText>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: spacing.sm,
    paddingVertical:   4,
    borderRadius:    radius.pill,
  },
  label: { color: colors.primary, fontWeight: '500' },
});

const errStyles = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 4 },
  text: {},
});

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },

  // ── Hero ──
  hero: {
    backgroundColor:   colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.xl,
    paddingBottom:     spacing.xxl + spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
    marginBottom:  spacing.lg,
  },
  brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  brandText: { flex: 1, letterSpacing: 1.5 },
  trialPill: {
    backgroundColor:   colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.pill,
  },
  trialText: { fontWeight: '800', letterSpacing: 0.8 },

  // Illustration
  illustration: {
    alignItems:     'center',
    justifyContent: 'center',
    height:         140,
    marginBottom:   spacing.lg,
    position:       'relative',
  },
  glowOuter: {
    position:        'absolute',
    width:           160, height: 160,
    borderRadius:    80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  glowInner: {
    position:        'absolute',
    width:           100, height: 100,
    borderRadius:    50,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  illustrationCenter: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.md,
  },
  heaterBox: {
    alignItems:      'center',
    gap:             spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius:    radius.lg,
    padding:         spacing.md,
    minWidth:        80,
  },
  cartridgeBox: {
    backgroundColor: 'rgba(245,166,35,0.18)',
    borderWidth:     1,
    borderColor:     'rgba(245,166,35,0.35)',
  },
  heaterLabel: { textAlign: 'center' },
  connectorLine: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
  },
  connectorDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  connectorTrack: {
    width:           24, height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statChip: {
    position:          'absolute',
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    backgroundColor:   'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical:   4,
    borderRadius:      radius.pill,
  },
  statChipLeft:  { bottom: 8, left: 0 },
  statChipRight: { bottom: 8, right: 0 },
  statText: { fontSize: 11 },

  heroTitle: {
    color:      colors.white,
    lineHeight: 34,
  },

  // ── Enrollment card — FIRST ──
  enrollCard: {
    backgroundColor:   colors.surface,
    borderRadius:      radius.xl,
    marginHorizontal:  spacing.lg,
    marginTop:         -spacing.xl,
    padding:           spacing.lg,
    ...shadows.md,
    borderWidth:       0.5,
    borderColor:       colors.borderOpaque,
  },
  enrollHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.md,
    marginBottom:   spacing.md,
  },
  enrollIconRing: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryFaint,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     colors.primary,
  },
  enrollTitle:   { flex: 1 },
  enrollMsg: {
    color:      colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  enrollBold: { color: colors.primary, fontWeight: '600' },
  benefitRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.sm,
    marginBottom:  spacing.md,
  },
  enrollDivider: { height: 0.5, backgroundColor: colors.borderOpaque, marginBottom: spacing.md },
  enrollFooter:  { lineHeight: 20 },

  // ── Note ──
  noteCard: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    gap:               spacing.sm,
    marginHorizontal:  spacing.lg,
    marginTop:         spacing.md,
    backgroundColor:   colors.fillTertiary,
    borderRadius:      radius.lg,
    padding:           spacing.md,
  },
  noteText: { flex: 1, lineHeight: 18 },

  // ── Form ──
  section:      { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm, paddingLeft: spacing.xs },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius:    radius.xl,
    overflow:        'hidden',
    ...shadows.sm,
  },
  formRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   spacing.md,
    paddingHorizontal: spacing.md,
    gap:               spacing.md,
    minHeight:         64,
  },
  fieldIcon: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.fillTertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  fieldBody:  { flex: 1 },
  fieldLabel: { color: colors.textSecondary, marginBottom: 2 },
  fieldInput: { fontSize: 17, color: colors.textPrimary, padding: 0 },
  phoneRow:   { flexDirection: 'row', alignItems: 'center' },
  rowDivider: {
    height:          0.5,
    backgroundColor: colors.borderOpaque,
    marginLeft:      spacing.md + 32 + spacing.md,
  },

  // ── CTA ──
  ctaSection: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  startBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: colors.primary,
    borderRadius:    radius.xl,
    paddingVertical: spacing.md + 2,
    ...shadows.md,
  },
  startBtnText:  { fontSize: 17, letterSpacing: -0.2 },
  startBtnArrow: {
    marginLeft:      spacing.md,
    backgroundColor: colors.white,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { textAlign: 'center', marginTop: spacing.xl },
});
