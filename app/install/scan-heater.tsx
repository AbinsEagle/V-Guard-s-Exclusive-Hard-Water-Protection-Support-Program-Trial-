import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing, radius, shadows } from '../../src/theme';

// ─── Steps (6 → 5 now that heater + cartridge are one screen) ────────────────
export const STEP_LABELS = ['Technician', 'Units', 'Customer', 'Photos', 'Review'];

// 'heater' = QR scanner open for heater field; null = scanner closed
type ScanTarget = 'heater' | null;

export default function UnitRegistrationScreen() {
  const { data, update } = useInstallation();
  const [permission, requestPermission] = useCameraPermissions();

  const [heaterSerial, setHeaterSerial]       = useState(data.heaterSerialNumber || '');
  const [cartridgeNum, setCartridgeNum]        = useState(data.cartridgeNumber || '');
  const [sampleCollected, setSampleCollected]  = useState(data.waterSampleCollected || false);
  const [scanTarget, setScanTarget]            = useState<ScanTarget>(null);
  const [heaterScanned, setHeaterScanned]      = useState(false); // feedback badge
  const [errors, setErrors]                    = useState({ heater: '', cartridge: '' });

  // ── QR open / close ──────────────────────────────────────────────────────
  const openScanner = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setHeaterScanned(false);
    setScanTarget('heater');
  };

  const handleBarcodeScan = ({ data: code }: { data: string }) => {
    if (scanTarget !== 'heater') return;
    setHeaterSerial(code.toUpperCase());
    setErrors((e) => ({ ...e, heater: '' }));
    setHeaterScanned(true);
    setScanTarget(null);
  };

  // ── Validation & submit ───────────────────────────────────────────────────
  const handleContinue = () => {
    const e = { heater: '', cartridge: '' };
    if (!heaterSerial.trim())  e.heater    = 'Heater serial number is required';
    if (!cartridgeNum.trim())  e.cartridge = 'Cartridge number is required';
    setErrors(e);
    if (e.heater || e.cartridge) return;

    update({
      heaterSerialNumber:   heaterSerial.trim(),
      cartridgeNumber:      cartridgeNum.trim(),
      waterSampleCollected: sampleCollected,
    });
    router.push('/install/customer-form');
  };

  // ── Full-screen QR overlay ────────────────────────────────────────────────
  if (scanTarget && permission?.granted) {
    return (
      <View style={styles.cameraScreen}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39'] }}
          onBarcodeScanned={handleBarcodeScan}
        >
          <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']}>
            {/* Close */}
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setScanTarget(null)} style={styles.camClose}>
                <Ionicons name="close" size={26} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.camBadge}>
                <Ionicons name="qr-code-outline" size={14} color={colors.white} />
                <AppText variant="label" color={colors.white} style={{ marginLeft: 6 }}>
                  Scan Heater QR
                </AppText>
              </View>
              <View style={{ width: 40 }} />
            </View>

            {/* Viewfinder */}
            <View style={styles.finderWrapper}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cTL]} />
                <View style={[styles.corner, styles.cTR]} />
                <View style={[styles.corner, styles.cBL]} />
                <View style={[styles.corner, styles.cBR]} />
              </View>
              <AppText variant="caption" color={colors.white} style={styles.scanHint}>
                Align QR / barcode on the heater label within the frame
              </AppText>
            </View>

            {/* Manual fallback */}
            <View style={styles.camFooter}>
              <TouchableOpacity
                style={styles.manualToggle}
                onPress={() => setScanTarget(null)}
              >
                <Ionicons name="keypad-outline" size={16} color={colors.primary} />
                <AppText variant="caption" color={colors.primary} style={{ marginLeft: 6 }}>
                  Enter manually instead
                </AppText>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>Unit Registration</AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={2} totalSteps={5} labels={STEP_LABELS} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Section: Water Heater ── */}
          <SectionHeader title="Water Heater" icon="flame-outline" />

          <AppText variant="caption" color={colors.textSecondary} style={styles.sectionDesc}>
            Find the serial number on the label at the back or bottom of the unit.
          </AppText>

          {/* Heater serial — type OR scan */}
          <View style={fieldStyles.wrapper}>
            <AppText variant="label" style={fieldStyles.label}>
              Serial Number <AppText variant="label" color={colors.error}>*</AppText>
            </AppText>

            <View style={[styles.inputBox, errors.heater ? styles.inputErr : heaterScanned ? styles.inputOk : null]}>
              <Ionicons
                name="barcode-outline"
                size={18}
                color={heaterScanned ? colors.success : colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. VG-WH-20240001"
                placeholderTextColor={colors.textHint}
                value={heaterSerial}
                onChangeText={(t) => {
                  setHeaterSerial(t.toUpperCase());
                  setHeaterScanned(false);
                  setErrors((e) => ({ ...e, heater: '' }));
                }}
                autoCapitalize="characters"
                returnKeyType="next"
              />

              {/* QR scan affordance — always visible, right of input */}
              {heaterScanned ? (
                <View style={styles.scannedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.qrBtn}
                  onPress={openScanner}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {errors.heater
              ? <AppText variant="caption" color={colors.error} style={fieldStyles.error}>{errors.heater}</AppText>
              : heaterScanned
              ? <AppText variant="caption" color={colors.success} style={fieldStyles.error}>Scanned successfully</AppText>
              : null
            }
          </View>

          {/* ── Section: Anti-Scalant Cartridge ── */}
          <SectionHeader title="Anti-Scalant Cartridge" icon="cube-outline" />

          <AppText variant="caption" color={colors.textSecondary} style={styles.sectionDesc}>
            Find the number printed on the cartridge label.
          </AppText>

          <View style={fieldStyles.wrapper}>
            <AppText variant="label" style={fieldStyles.label}>
              Cartridge Number <AppText variant="label" color={colors.error}>*</AppText>
            </AppText>
            <View style={[styles.inputBox, errors.cartridge ? styles.inputErr : null]}>
              <Ionicons name="cube-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. VG-AS-00123"
                placeholderTextColor={colors.textHint}
                value={cartridgeNum}
                onChangeText={(t) => {
                  setCartridgeNum(t.toUpperCase());
                  setErrors((e) => ({ ...e, cartridge: '' }));
                }}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
            {errors.cartridge
              ? <AppText variant="caption" color={colors.error} style={fieldStyles.error}>{errors.cartridge}</AppText>
              : null
            }
          </View>

          {/* ── Water sample checkbox ── */}
          <TouchableOpacity
            style={[styles.checkRow, sampleCollected && styles.checkRowChecked]}
            onPress={() => setSampleCollected((v) => !v)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, sampleCollected && styles.checkboxChecked]}>
              {sampleCollected && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <View style={styles.checkLabelBlock}>
              <AppText variant="label" color={colors.textPrimary}>
                Water sample bottle collected
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                500 ml bottle (included in kit) sealed and ready for R&D lab
              </AppText>
            </View>
          </TouchableOpacity>

          {/* ── Link preview card ── */}
          <View style={styles.linkCard}>
            <LinkItem icon="flame-outline" label="Water Heater" value={heaterSerial || '—'} filled={!!heaterSerial} />
            <View style={styles.linkConnector}>
              <View style={styles.linkDot} />
              <Ionicons name="link" size={16} color={colors.primary} />
              <View style={styles.linkDot} />
            </View>
            <LinkItem icon="cube-outline" label="Cartridge" value={cartridgeNum || '—'} filled={!!cartridgeNum} />
          </View>

          {/* ── CTA ── */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
            <AppText variant="label" color={colors.headerBg}>Continue to Customer Details</AppText>
            <View style={styles.btnArrow}>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={secStyles.row}>
      <View style={secStyles.iconBox}>
        <Ionicons name={icon as any} size={14} color={colors.white} />
      </View>
      <AppText variant="sectionTitle" color={colors.textPrimary}>{title}</AppText>
    </View>
  );
}

function LinkItem({ icon, label, value, filled }: {
  icon: string; label: string; value: string; filled: boolean;
}) {
  return (
    <View style={linkStyles.item}>
      <View style={linkStyles.iconBox}>
        <Ionicons name={icon as any} size={16} color={colors.white} />
      </View>
      <View style={linkStyles.textBlock}>
        <AppText variant="caption2" color={colors.textSecondary}>{label}</AppText>
        <AppText variant="label" color={filled ? colors.textPrimary : colors.textHint} numberOfLines={1}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CORNER_SIZE  = 20;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.headerBg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.headerBg,
  },
  backBtn: { padding: spacing.xs },

  body: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.lg, paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },

  sectionDesc: { lineHeight: 18, marginBottom: spacing.xs },

  // Input
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, minHeight: 50,
  },
  inputErr: { borderColor: colors.error },
  inputOk:  { borderColor: colors.success },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1, fontSize: 16, color: colors.textPrimary,
    paddingVertical: spacing.sm, letterSpacing: 1,
  },

  // QR button — signifier: always visible on right of heater input
  qrBtn: {
    padding: spacing.xs,
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.sm,
    marginLeft: spacing.xs,
  },
  scannedBadge: { marginLeft: spacing.xs },

  // Water sample row
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  checkRowChecked: { borderColor: colors.primary, backgroundColor: colors.primaryFaint },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkLabelBlock: { flex: 1, gap: 2 },

  // Link card
  linkCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.sm, marginTop: spacing.xs,
  },
  linkConnector: { alignItems: 'center', gap: 3 },
  linkDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.borderOpaque },

  // CTA
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg, paddingVertical: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  btnArrow: {
    marginLeft: spacing.md,
    backgroundColor: colors.primaryDark,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },

  // Camera overlay
  cameraScreen:  { flex: 1, backgroundColor: '#000' },
  camera:        { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between' },
  cameraHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
  },
  camClose: { padding: spacing.xs },
  camBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  finderWrapper: { alignItems: 'center', gap: spacing.lg },
  scanFrame: { width: 230, height: 230, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: colors.primary },
  cTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  cBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  scanHint: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20, textAlign: 'center',
  },
  camFooter: { paddingBottom: spacing.xl },
  manualToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: 20, alignSelf: 'center',
  },
});

const secStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.md, marginBottom: spacing.xs,
  },
  iconBox: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: colors.headerBg,
    alignItems: 'center', justifyContent: 'center',
  },
});

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.xs },
  label:   { marginBottom: spacing.xs },
  error:   { marginTop: 4 },
});

const linkStyles = StyleSheet.create({
  item:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBox:   {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.headerBg,
    alignItems: 'center', justifyContent: 'center',
  },
  textBlock: { flex: 1 },
});
