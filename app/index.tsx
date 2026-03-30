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
import { AppText } from '../src/components/common/AppText';
import { useInstallation } from '../src/store/installationStore';
import { colors, spacing } from '../src/theme';

export default function EntryScreen() {
  const { update } = useInstallation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '' });

  const validate = () => {
    const e = { name: '', phone: '' };
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
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
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Header Banner ── */}
          <View style={styles.banner}>
            <AppText variant="caption" color={colors.white} style={styles.brandTag}>
              V-GUARD INDUSTRIES
            </AppText>
            <AppText variant="h2" color={colors.white} style={styles.title}>
              Exclusive Hard Water{'\n'}Protection Program
            </AppText>
            <View style={styles.trialBadge}>
              <AppText variant="caption" color={colors.accentDark} style={styles.trialText}>
                TRIAL RUN
              </AppText>
            </View>
          </View>

          {/* ── Program Description ── */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoDot} />
              <AppText variant="body" style={styles.infoText}>
                Scale formation depends on local water chemistry and usage patterns. V-Guard's internal testing under extreme laboratory conditions showed a strong reduction in scale impact in very hard water. However, real homes and water conditions vary.
              </AppText>
            </View>
            <View style={styles.divider} />
            <AppText variant="body" style={styles.infoText}>
              You have been selected for V-Guard's Exclusive Hard Water Protection Support Program (trial run). This installation provides additional protection for your heater while helping us understand real-world performance and identify how we can improve it further.
            </AppText>
            <View style={styles.divider} />
            <AppText variant="body" style={styles.infoText}>
              Your usage and feedback will help us fine-tune this technology and explore additional value we can offer to hard-water users.
            </AppText>
            <AppText variant="label" color={colors.primary} style={styles.teamTag}>
              — Team V-Guard
            </AppText>
          </View>

          {/* ── Technician Form ── */}
          <View style={styles.formCard}>
            <AppText variant="h3" style={styles.formTitle}>
              Service Person Details
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={styles.formSubtitle}>
              Please enter your details before starting the installation
            </AppText>

            {/* Name */}
            <View style={styles.fieldWrapper}>
              <AppText variant="label" style={styles.fieldLabel}>
                Full Name <AppText variant="label" color={colors.error}>*</AppText>
              </AppText>
              <View style={[styles.inputBox, errors.name ? styles.inputBoxError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textHint}
                  value={name}
                  onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
              {errors.name ? (
                <AppText variant="caption" color={colors.error} style={styles.errorText}>
                  {errors.name}
                </AppText>
              ) : null}
            </View>

            {/* Phone */}
            <View style={styles.fieldWrapper}>
              <AppText variant="label" style={styles.fieldLabel}>
                Mobile Number <AppText variant="label" color={colors.error}>*</AppText>
              </AppText>
              <View style={[styles.inputBox, errors.phone ? styles.inputBoxError : null]}>
                <AppText variant="body" color={colors.textSecondary} style={styles.prefix}>
                  +91
                </AppText>
                <View style={styles.prefixDivider} />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textHint}
                  value={phone}
                  onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setErrors((e) => ({ ...e, phone: '' })); }}
                  keyboardType="number-pad"
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={handleStart}
                />
              </View>
              {errors.phone ? (
                <AppText variant="caption" color={colors.error} style={styles.errorText}>
                  {errors.phone}
                </AppText>
              ) : null}
            </View>
          </View>

          {/* ── Start Button ── */}
          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
            <AppText variant="label" color={colors.white} style={styles.startText}>
              Start Installation
            </AppText>
          </TouchableOpacity>

          <AppText variant="caption" color={colors.textHint} style={styles.footer}>
            For internal use only · V-Guard R&D
          </AppText>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  // Banner
  banner: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  brandTag: {
    letterSpacing: 1.5,
    opacity: 0.75,
    marginBottom: spacing.sm,
  },
  title: {
    lineHeight: 32,
    marginBottom: spacing.md,
  },
  trialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  trialText: {
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Info card
  infoCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoDot: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 3,
    alignSelf: 'stretch',
    minHeight: 40,
  },
  infoText: {
    flex: 1,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  teamTag: {
    marginTop: spacing.md,
    textAlign: 'right',
    fontStyle: 'italic',
  },

  // Form card
  formCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  formTitle: {
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    marginBottom: spacing.lg,
  },
  fieldWrapper: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
  },
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
  inputBoxError: {
    borderColor: colors.error,
  },
  prefix: {
    marginRight: spacing.xs,
  },
  prefixDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  errorText: {
    marginTop: 4,
  },

  // Start button
  startButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startText: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  footer: {
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
});
