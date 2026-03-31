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

          {/* ── Dark header bar (matches V-Guard app) ── */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              {/* V-Guard wordmark + kangaroo placeholder */}
              <View style={styles.logoBox}>
                <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
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

          {/* ── Amber hero banner ── */}
          <View style={styles.hero}>
            {/* Illustration cluster */}
            <View style={styles.illustration}>
              <IllustrationBox icon="water"            label="Heater"      tint={colors.headerBg} />
              <View style={styles.connector}>
                <View style={styles.connDot} />
                <View style={styles.connLine} />
                <View style={styles.connDot} />
              </View>
              <IllustrationBox icon="shield-checkmark" label="Anti-Scalant" tint={colors.headerBg} />
            </View>

            <AppText variant="h2" color={colors.headerBg} style={styles.heroTitle}>
              Hard Water{'\n'}Protection Program
            </AppText>
            <AppText variant="subhead" color={colors.primaryDark} style={styles.heroSub}>
              Exclusive Support Program · 10-Month Trial
            </AppText>
          </View>

          {/* ── YOU'VE BEEN SELECTED — first & prominent ── */}
          <View style={styles.enrollCard}>
            <View style={styles.enrollTop}>
              <View style={styles.enrollIconRing}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              </View>
              <View style={styles.enrollTitleBlock}>
                <AppText variant="label" style={styles.enrollTitle}>
                  You've been selected!
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  V-Guard Exclusive Program
                </AppText>
              </View>
            </View>

            <AppText variant="body" style={styles.enrollMsg}>
              You've been selected for{' '}
              <AppText variant="body" style={styles.enrollBold}>
                V-Guard's Exclusive Hard Water Protection Program.
              </AppText>
              {' '}This installation provides additional protection for your heater
              while helping us understand real-world performance and identify how
              we can improve it further.
            </AppText>

            {/* Benefit chips */}
            <View style={styles.benefitRow}>
              <BenefitChip icon="water-outline"       label="Scale Reduction" />
              <BenefitChip icon="flash-outline"       label="Better Efficiency" />
              <BenefitChip icon="construct-outline"   label="Free Service" />
            </View>

            <View style={styles.enrollDivider} />

            <AppText variant="caption" color={colors.textSecondary} style={styles.enrollNote}>
              Your usage and feedback will help fine-tune this technology and
              explore additional value for hard-water users.
            </AppText>
            <AppText variant="caption" color={colors.primary} style={styles.teamTag}>
              — Team V-Guard
            </AppText>
          </View>

          {/* ── Scale formation note ── */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <AppText variant="caption" color={colors.textSecondary} style={styles.noteText}>
              Scale formation depends on local water chemistry and usage patterns.
              Lab testing showed a strong reduction in scale impact in very hard
              water — but real homes vary.
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
                  <Ionicons name="person-outline" size={17} color={colors.primaryDark} />
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
                  <Ionicons name="call-outline" size={17} color={colors.primaryDark} />
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
              <AppText variant="label" color={colors.headerBg} style={styles.startBtnText}>
                Start Installation
              </AppText>
              <View style={styles.startBtnArrow}>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
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

function IllustrationBox({ icon, label, tint }: { icon: string; label: string; tint: string }) {
  return (
    <View style={illStyles.box}>
      <Ionicons name={icon as any} size={30} color={tint} />
      <AppText variant="caption2" color={tint} style={illStyles.label}>{label}</AppText>
    </View>
  );
}

function BenefitChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={chipStyles.chip}>
      <Ionicons name={icon as any} size={12} color={colors.headerBg} />
      <AppText variant="caption2" color={colors.headerBg} style={chipStyles.label}>
        {label}
      </AppText>
    </View>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <View style={errStyles.row}>
      <Ionicons name="alert-circle" size={13} color={colors.error} />
      <AppText variant="caption" color={colors.error}>{msg}</AppText>
    </View>
  );
}

const illStyles = StyleSheet.create({
  box: {
    alignItems:      'center',
    gap:             spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius:    radius.lg,
    padding:         spacing.md,
    minWidth:        90,
    borderWidth:     1,
    borderColor:     'rgba(196,122,0,0.25)',
  },
  label: { fontWeight: '600' },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    backgroundColor:   'rgba(26,26,26,0.10)',
    paddingHorizontal: spacing.sm,
    paddingVertical:   4,
    borderRadius:      radius.pill,
    borderWidth:       1,
    borderColor:       'rgba(26,26,26,0.20)',
  },
  label: { fontWeight: '500' },
});

const errStyles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
});

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.headerBg },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },

  // ── Dark header bar ──
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   colors.headerBg,
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.md,
  },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoBox:  {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: 'rgba(245,166,35,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoName: { letterSpacing: 2 },
  logoTag:  { letterSpacing: 1 },
  trialPill: {
    backgroundColor:   colors.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical:   4,
    borderRadius:      radius.pill,
  },
  trialText: { fontWeight: '800', letterSpacing: 1 },

  // ── Amber hero ──
  hero: {
    backgroundColor:   colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.xl,
    paddingBottom:     spacing.xxl + spacing.lg,
    gap:               spacing.lg,
  },
  illustration: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing.md,
  },
  connector:  { alignItems: 'center', flexDirection: 'row', gap: 4 },
  connDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.headerBg },
  connLine:   { width: 20, height: 2, backgroundColor: colors.headerBg, opacity: 0.4 },
  heroTitle: {
    color:       colors.headerBg,
    lineHeight:  34,
  },
  heroSub: { color: colors.headerBg },

  // ── Enrollment card ──
  enrollCard: {
    backgroundColor:  colors.surface,
    borderRadius:     radius.xl,
    marginHorizontal: spacing.lg,
    marginTop:        -spacing.xl,
    padding:          spacing.lg,
    ...shadows.md,
    borderTopWidth:   3,
    borderTopColor:   colors.primary,
    borderLeftWidth:  0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  enrollTop: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.md,
    marginBottom:   spacing.md,
  },
  enrollIconRing: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primaryFaint,
    borderWidth:     2,
    borderColor:     colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  enrollTitleBlock: { flex: 1 },
  enrollTitle:      {},
  enrollMsg: {
    color:        colors.textSecondary,
    lineHeight:   24,
    marginBottom: spacing.md,
  },
  enrollBold: { color: colors.primaryDark, fontWeight: '600' },
  benefitRow: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            spacing.sm,
    marginBottom:   spacing.md,
  },
  enrollDivider: {
    height:          0.5,
    backgroundColor: colors.borderOpaque,
    marginBottom:    spacing.md,
  },
  enrollNote: { lineHeight: 20 },
  teamTag:    { marginTop: spacing.xs, fontStyle: 'italic', fontWeight: '600' },

  // ── Note ──
  noteCard: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    gap:               spacing.sm,
    marginHorizontal:  spacing.lg,
    marginTop:         spacing.md,
    backgroundColor:   colors.surface,
    borderRadius:      radius.lg,
    padding:           spacing.md,
    borderWidth:       0.5,
    borderColor:       colors.borderOpaque,
    ...shadows.xs,
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
    backgroundColor: colors.primaryFaint,
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
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    backgroundColor:  colors.primary,
    borderRadius:     radius.xl,
    paddingVertical:  spacing.md + 2,
    ...shadows.md,
  },
  startBtnText:  { fontSize: 17, letterSpacing: -0.2 },
  startBtnArrow: {
    marginLeft:      spacing.md,
    backgroundColor: colors.primaryDark,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { textAlign: 'center', marginTop: spacing.xl },
});
