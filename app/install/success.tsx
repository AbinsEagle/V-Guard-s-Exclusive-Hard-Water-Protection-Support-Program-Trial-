import { View, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing, radius, shadows } from '../../src/theme';

export default function SuccessScreen() {
  const { data, reset } = useInstallation();

  // Snapshot before reset so the card still has data to display
  const snap = useRef({
    customerName:        data.customerName,
    customerWhatsApp:    data.customerWhatsApp,
    heaterModel:         data.heaterModel || data.heaterSerialNumber,
    cartridgeNumber:     data.cartridgeNumber,
    installationDate:    data.installationDate,
    consentSignatureUri: data.consentSignatureUri,
  }).current;

  useEffect(() => {
    // Clear the store immediately — any back-navigation leads to a blank form
    reset();

    // Android hardware-back → go to root instead of back through the flow
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/');
      return true;
    });
    return () => sub.remove();
  }, []);

  const handleNewInstallation = () => {
    router.replace('/');
  };

  const handleShareConsent = async () => {
    const docUri = snap.consentSignatureUri;
    if (!docUri) return;
    try {
      const res  = await fetch(docUri);
      const blob = await res.blob();
      const file = new (window as any).File([blob], 'vguard-consent.png', { type: 'image/png' });
      if ((navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({
          title: 'V-Guard Trial Consent',
          text:  'Customer consent document for V-Guard Hard Water Protection Trial',
          files: [file],
        });
      } else {
        // Desktop fallback — trigger download
        const a = (document as any).createElement('a');
        a.href     = docUri;
        a.download = 'vguard-consent.png';
        a.click();
      }
    } catch { /* user cancelled share sheet — no action needed */ }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* ── Success icon ── */}
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Ionicons name="checkmark" size={36} color={colors.white} />
          </View>
        </View>

        {/* ── Message ── */}
        <View style={styles.messageBlock}>
          <AppText variant="h2" style={styles.title}>Installation Recorded!</AppText>
          <AppText variant="subhead" color={colors.textSecondary} style={styles.subtitle}>
            Anti-scalant unit linked and record saved successfully.
          </AppText>
        </View>

        {/* ── Summary card ── */}
        <View style={styles.summaryCard}>
          <SummaryRow icon="person-outline"  label="Customer"  value={snap.customerName} />
          <View style={styles.divider} />
          <SummaryRow icon="logo-whatsapp"   label="WhatsApp"  value={`+91 ${snap.customerWhatsApp}`} />
          <View style={styles.divider} />
          <SummaryRow icon="flame-outline"   label="Heater"    value={snap.heaterModel} />
          <View style={styles.divider} />
          <SummaryRow icon="cube-outline"    label="Cartridge" value={snap.cartridgeNumber} />
          <View style={styles.divider} />
          <SummaryRow
            icon="calendar-outline"
            label="Installed"
            value={snap.installationDate ? new Date(snap.installationDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            }) : '—'}
          />
        </View>

        {/* ── What happens next ── */}
        <View style={styles.nextCard}>
          <AppText variant="label" style={styles.nextTitle}>What happens next?</AppText>
          <NextStep number="1" text="Customer receives WhatsApp enrollment confirmation" />
          <NextStep number="2" text="Survey sent every 2 months to track effectiveness" />
          <NextStep number="3" text="R&D monitors all data on the dashboard" />
        </View>

        {/* ── Actions ── */}
        {snap.consentSignatureUri ? (
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareConsent} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={18} color={colors.primary} />
            <AppText variant="label" color={colors.primary} style={{ marginLeft: spacing.sm }}>
              Share Consent with Customer
            </AppText>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleNewInstallation}>
          <Ionicons name="add-circle-outline" size={18} color={colors.headerBg} />
          <AppText variant="label" color={colors.headerBg} style={{ marginLeft: spacing.sm }}>
            New Installation
          </AppText>
        </TouchableOpacity>

        <AppText variant="caption2" color={colors.textTertiary} style={styles.footer}>
          V-Guard R&D · Hard Water Protection Trial
        </AppText>

      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={sumStyles.row}>
      <Ionicons name={icon as any} size={14} color={colors.primary} />
      <AppText variant="caption" color={colors.textSecondary} style={sumStyles.label}>{label}</AppText>
      <AppText variant="label" numberOfLines={1} style={sumStyles.value}>{value || '—'}</AppText>
    </View>
  );
}

function NextStep({ number, text }: { number: string; text: string }) {
  return (
    <View style={nsStyles.row}>
      <View style={nsStyles.circle}>
        <AppText variant="caption2" style={nsStyles.number}>{number}</AppText>
      </View>
      <AppText variant="caption" color={colors.textSecondary} style={nsStyles.text}>{text}</AppText>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },

  // Icon
  iconOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.successLight,
    alignItems: 'center', justifyContent: 'center',
  },
  iconInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },

  // Message
  messageBlock: { alignItems: 'center', gap: spacing.xs },
  title:    { textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 20 },

  // Summary
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.xs,
    ...shadows.sm,
  },
  divider: { height: 0.5, backgroundColor: colors.borderOpaque },

  // Next steps
  nextCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    ...shadows.sm,
  },
  nextTitle: { marginBottom: spacing.xs / 2 },

  // CTA
  shareBtn: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: radius.lg, paddingVertical: spacing.md,
    marginTop: 'auto',
  },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg, paddingVertical: spacing.md,
    ...shadows.md,
  },

  footer: { textAlign: 'center', marginTop: spacing.xs },
});

const sumStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 2 },
  label: { flex: 1 },
  value: { flex: 2, textAlign: 'right' },
});

const nsStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  circle: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  number: { fontWeight: '800', color: colors.headerBg, fontSize: 10 },
  text:   { flex: 1, lineHeight: 18 },
});
