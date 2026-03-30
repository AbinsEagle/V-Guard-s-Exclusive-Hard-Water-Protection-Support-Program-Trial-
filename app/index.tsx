import {
  View,
  ScrollView,
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Hero / Large-title header ── */}
          <View style={styles.hero}>
            {/* Brand chip */}
            <View style={styles.brandChip}>
              <View style={styles.brandDot} />
              <AppText variant="caption" color={colors.primary} style={styles.brandText}>
                V-GUARD INDUSTRIES
              </AppText>
            </View>

            {/* Large title */}
            <AppText variant="h1" style={styles.heroTitle}>
              Hard Water{'\n'}Protection
            </AppText>

            {/* Accent subtitle */}
            <View style={styles.subtitleRow}>
              <View style={styles.accentLine} />
              <AppText variant="subhead" color={colors.textSecondary} style={styles.heroSub}>
                Exclusive Support Program
              </AppText>
              <View style={styles.trialPill}>
                <AppText variant="caption2" color={colors.accentDark} style={styles.trialText}>
                  TRIAL
                </AppText>
              </View>
            </View>
          </View>

          {/* ── Program description card ── */}
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="information-circle" size={18} color={colors.primary} />
                </View>
                <AppText variant="label" style={styles.infoTitle}>About This Program</AppText>
              </View>

              <AppText variant="body" style={styles.infoBody}>
                Scale formation depends on local water chemistry and usage patterns.
                V-Guard's lab testing showed a strong reduction in scale impact in very
                hard water — but real homes vary.
              </AppText>

              <View style={styles.infoDivider} />

              <AppText variant="body" style={styles.infoBody}>
                You've been selected for V-Guard's Exclusive Hard Water Protection
                Program. This installation provides additional protection for your
                heater while helping us understand real-world performance.
              </AppText>

              <View style={styles.infoDivider} />

              <AppText variant="body" style={styles.infoBody}>
                Your feedback will help fine-tune this technology and explore additional
                value for hard-water users.
              </AppText>

              <View style={styles.teamRow}>
                <Ionicons name="checkmark-seal-fill" size={14} color={colors.primary} />
                <AppText variant="caption" color={colors.primary} style={styles.teamText}>
                  Team V-Guard R&D
                </AppText>
              </View>
            </View>
          </View>

          {/* ── Service person form ── */}
          <View style={styles.section}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              Service Person Details
            </AppText>

            <View style={styles.formCard}>
              {/* Name field */}
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

              {errors.name ? <ErrorText msg={errors.name} /> : null}
              <View style={styles.rowDivider} />

              {/* Phone field */}
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

              {errors.phone ? <ErrorText msg={errors.phone} /> : null}
            </View>
          </View>

          {/* ── CTA ── */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStart}
              activeOpacity={0.82}
            >
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

function ErrorText({ msg }: { msg: string }) {
  return (
    <View style={errStyles.row}>
      <Ionicons name="alert-circle" size={13} color={colors.error} />
      <AppText variant="caption" color={colors.error} style={errStyles.text}>{msg}</AppText>
    </View>
  );
}

const errStyles = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingTop: 4 },
  text: {},
});

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.background },
  flex:  { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },

  // ── Hero ──
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.xl,
    paddingBottom:     spacing.xxl + spacing.lg,
  },
  brandChip: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    marginBottom:   spacing.lg,
  },
  brandDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.accent,
  },
  brandText: {
    letterSpacing: 1.5,
    color:         'rgba(255,255,255,0.65)',
  },
  heroTitle: {
    color:       colors.white,
    lineHeight:  40,
    marginBottom: spacing.md,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
  },
  accentLine: {
    width: 3, height: 16, borderRadius: 2,
    backgroundColor: colors.accent,
  },
  heroSub: { color: 'rgba(255,255,255,0.75)' },
  trialPill: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.pill,
    marginLeft:        spacing.xs,
  },
  trialText: { fontWeight: '800', letterSpacing: 0.8 },

  // ── Sections ──
  section: {
    paddingHorizontal: spacing.lg,
    marginTop:         spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    paddingLeft:  spacing.xs,
  },

  // ── Info card ──
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius:    radius.xl,
    padding:         spacing.lg,
    marginTop:       -spacing.xl,
    ...shadows.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
    marginBottom:  spacing.md,
  },
  infoIconBox: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: {},
  infoBody: {
    color:      colors.textSecondary,
    lineHeight: 24,
  },
  infoDivider: {
    height:           1,
    backgroundColor:  colors.border,
    marginVertical:   spacing.md,
  },
  teamRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.xs,
    marginTop:      spacing.md,
    justifyContent: 'flex-end',
  },
  teamText: { fontStyle: 'italic' },

  // ── Form card (iOS grouped style) ──
  formCard: {
    backgroundColor: colors.surface,
    borderRadius:    radius.xl,
    overflow:        'hidden',
    ...shadows.sm,
  },
  formRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical:  spacing.md,
    paddingHorizontal: spacing.md,
    gap:             spacing.md,
    minHeight:       64,
  },
  fieldIcon: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.fillTertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  fieldBody:  { flex: 1 },
  fieldLabel: { color: colors.textSecondary, marginBottom: 2 },
  fieldInput: {
    fontSize:  17,
    color:     colors.textPrimary,
    padding:   0,
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  rowDivider: {
    height:           0.5,
    backgroundColor:  colors.borderOpaque,
    marginLeft:       spacing.md + 32 + spacing.md,
  },

  // ── CTA ──
  ctaSection: {
    paddingHorizontal: spacing.lg,
    marginTop:         spacing.xl,
  },
  startBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    backgroundColor:  colors.primary,
    borderRadius:     radius.xl,
    paddingVertical:  spacing.md + 2,
    ...shadows.md,
  },
  startBtnText: {
    fontSize:      17,
    letterSpacing: -0.2,
  },
  startBtnArrow: {
    marginLeft:      spacing.md,
    backgroundColor: colors.white,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { textAlign: 'center', marginTop: spacing.xl },
});
