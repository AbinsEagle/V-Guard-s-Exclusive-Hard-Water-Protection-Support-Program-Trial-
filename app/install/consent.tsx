import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { useColors, spacing, radius, shadows } from '../../src/theme';
import { generateConsentDocument } from '../../src/utils/generateConsentDocument';

const STEP_LABELS = ['Technician', 'Units', 'Consent', 'Product', 'Photos', 'Review'];

const CANVAS_W = 600;
const CANVAS_H = 160;

const AGREEMENT_ITEMS = [
  'I agree to participate in the V-Guard trial installation program.',
  'I allow the installation of the anti-scalant cartridge and collection of usage data.',
  'I allow photographs of the product and installation to be recorded (no photographs of persons will be taken).',
  'I understand that product performance may vary based on local water quality and conditions.',
  'I understand there are no guaranteed performance outcomes from this trial.',
  'I understand that V-Guard may contact me for feedback during the trial period.',
  'I understand that factors outside V-Guard\'s control (water quality, maintenance, and usage patterns) may affect results, and V-Guard is not liable for such outcomes.',
  'I understand this product is intended for evaluation purposes only and is not for medical use.',
];

export default function ConsentScreen() {
  const { data, update } = useInstallation();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [customerName, setCustomerName] = useState(data.customerName || '');
  const [whatsApp,     setWhatsApp]     = useState(data.customerWhatsApp || '');
  const [pincode,      setPincode]      = useState(data.pincode || '');
  // If consent was already given, treat signature as captured without redrawing
  const [hasSignature, setHasSignature] = useState(data.consentGiven || false);
  const [confirmed,    setConfirmed]    = useState(data.consentGiven || false);
  const [generating,   setGenerating]   = useState(false);
  const [errors,       setErrors]       = useState({
    customerName: '', whatsApp: '', pincode: '', signature: '', confirmed: '',
  });

  const canvasRef    = useRef<any>(null);
  const isDrawingRef = useRef(false);
  const lastPtRef    = useRef<{ x: number; y: number } | null>(null);

  // Convert CSS pointer coords to canvas internal coordinates
  function getCanvasPoint(e: any): { x: number; y: number } {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top)  * (CANVAS_H / rect.height),
    };
  }

  const handlePointerDown = useCallback((e: any) => {
    isDrawingRef.current = true;
    const pt  = getCanvasPoint(e);
    lastPtRef.current = pt;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();
    setHasSignature(true);
    setErrors((prev) => ({ ...prev, signature: '' }));
  }, []);

  const handlePointerMove = useCallback((e: any) => {
    if (!isDrawingRef.current) return;
    const ctx  = canvasRef.current?.getContext('2d');
    const last = lastPtRef.current;
    if (!ctx || !last) return;
    const pt = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
    lastPtRef.current = pt;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPtRef.current    = null;
  }, []);

  const handleClearSignature = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    setHasSignature(false);
  };

  const validate = (): boolean => {
    const e = { customerName: '', whatsApp: '', pincode: '', signature: '', confirmed: '' };
    if (!customerName.trim())                    e.customerName = 'Required';
    if (!whatsApp.trim())                        e.whatsApp     = 'Required';
    else if (!/^[6-9]\d{9}$/.test(whatsApp))    e.whatsApp     = 'Enter a valid 10-digit number';
    if (!pincode.trim())                         e.pincode      = 'Required';
    else if (!/^\d{6}$/.test(pincode))           e.pincode      = 'Enter a valid 6-digit pincode';
    if (!hasSignature)                           e.signature    = 'Please sign before proceeding';
    if (!confirmed)                              e.confirmed    = 'Please tick the confirmation checkbox';
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setGenerating(true);
    // If user re-signed on this visit, capture from canvas; otherwise keep existing doc
    const rawSig = hasSignature && !data.consentGiven
      ? (canvasRef.current?.toDataURL('image/png') ?? null)
      : (canvasRef.current?.toDataURL('image/png') ?? null);
    const timestamp = new Date().toISOString();
    const docUri  = await generateConsentDocument({
      customerName:     customerName.trim(),
      whatsApp:         whatsApp.trim(),
      pincode:          pincode.trim(),
      timestamp,
      signatureDataUri: rawSig,
      heaterSerial:     data.heaterSerialNumber || undefined,
      cartridgeNumber:  data.cartridgeNumber    || undefined,
    });
    setGenerating(false);
    update({
      customerName:        customerName.trim(),
      customerWhatsApp:    whatsApp.trim(),
      pincode:             pincode.trim(),
      consentSignatureUri: docUri || rawSig,
      consentGiven:        true,
      consentTimestamp:    timestamp,
    });
    router.push('/install/customer-form');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>Customer Consent</AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={3} totalSteps={6} labels={STEP_LABELS} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Page title */}
          <View style={styles.titleBlock}>
            <AppText variant="h3" color={colors.textPrimary}>V-Guard Trial Program</AppText>
            <AppText variant="subhead" color={colors.textSecondary}>
              Customer Consent &amp; Declaration
            </AppText>
          </View>

          {/* ── Section 1 — Disclaimer ── */}
          <View style={styles.disclaimerCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="information-circle" size={14} color={colors.white} />
              </View>
              <AppText variant="sectionTitle" color={colors.textPrimary}>Disclaimer</AppText>
            </View>
            <AppText variant="caption" color={colors.textSecondary} style={styles.disclaimerText}>
              This installation is part of the V-Guard exclusive hard water protection trial program.
              Product performance may vary based on local water quality, installation conditions,
              and usage patterns. This product is intended for evaluation purposes only and is not
              a commercial sale.
            </AppText>
          </View>

          {/* ── Section 2 — Agreement checklist ── */}
          <View style={styles.agreementCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="checkmark-done" size={14} color={colors.white} />
              </View>
              <AppText variant="sectionTitle" color={colors.textPrimary}>By proceeding, I confirm that:</AppText>
            </View>
            {AGREEMENT_ITEMS.map((item, i) => (
              <View key={i} style={styles.agreementRow}>
                <View style={styles.agreementCheck}>
                  <Ionicons name="checkmark" size={11} color={colors.white} />
                </View>
                <AppText variant="caption" color={colors.textPrimary} style={styles.agreementText}>
                  {item}
                </AppText>
              </View>
            ))}
          </View>

          {/* ── Section 3 — Customer identity ── */}
          <View style={styles.inputSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="person" size={14} color={colors.white} />
              </View>
              <AppText variant="sectionTitle" color={colors.textPrimary}>Customer Information</AppText>
            </View>

            <Field label="Customer Name" required error={errors.customerName} colors={colors}>
              <View style={[styles.inputBox, errors.customerName ? styles.inputErr : null]}>
                <TextInput
                  style={[styles.input, Platform.OS === 'web' ? { outline: 'none' } as any : null]}
                  placeholder="Full name"
                  placeholderTextColor={colors.textHint}
                  value={customerName}
                  onChangeText={(t) => { setCustomerName(t); setErrors((p) => ({ ...p, customerName: '' })); }}
                  autoCapitalize="words"
                />
              </View>
            </Field>

            <Field label="WhatsApp Number" required error={errors.whatsApp} colors={colors}>
              <View style={[styles.inputBox, errors.whatsApp ? styles.inputErr : null]}>
                <AppText variant="body" color={colors.textSecondary} style={styles.prefix}>+91</AppText>
                <View style={styles.prefixDiv} />
                <TextInput
                  style={[styles.input, Platform.OS === 'web' ? { outline: 'none' } as any : null]}
                  placeholder="10-digit number"
                  placeholderTextColor={colors.textHint}
                  value={whatsApp}
                  onChangeText={(t) => { setWhatsApp(t.replace(/\D/g, '').slice(0, 10)); setErrors((p) => ({ ...p, whatsApp: '' })); }}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </Field>

            <Field label="Pincode" required error={errors.pincode} colors={colors}>
              <View style={[styles.inputBox, errors.pincode ? styles.inputErr : null]}>
                <TextInput
                  style={[styles.input, Platform.OS === 'web' ? { outline: 'none' } as any : null]}
                  placeholder="6-digit pincode"
                  placeholderTextColor={colors.textHint}
                  value={pincode}
                  onChangeText={(t) => { setPincode(t.replace(/\D/g, '').slice(0, 6)); setErrors((p) => ({ ...p, pincode: '' })); }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </Field>
          </View>

          {/* ── Section 4 — Signature pad ── */}
          <View style={styles.signatureSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="pencil" size={14} color={colors.white} />
              </View>
              <AppText variant="sectionTitle" color={colors.textPrimary}>Digital Signature</AppText>
            </View>

            <AppText variant="caption" color={colors.textSecondary} style={styles.signatureHint}>
              Sign below using your finger or stylus
            </AppText>

            <View style={[styles.canvasWrapper, errors.signature ? styles.canvasWrapperErr : null]}>
              {/* @ts-ignore — HTML canvas element, valid in Expo Web / React Native Web */}
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                style={{
                  width: '100%',
                  height: CANVAS_H,
                  borderRadius: 8,
                  backgroundColor: '#FFFFFF',   // always white — signature embeds in white document
                  touchAction: 'none',
                  cursor: 'crosshair',
                  display: 'block',
                } as any}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />

              {/* Placeholder — shown only when no signature and consent not yet given */}
              {!hasSignature && !data.consentGiven && (
                <View style={styles.signaturePlaceholder} pointerEvents="none">
                  <Ionicons name="pencil-outline" size={20} color={colors.borderOpaque} />
                  <AppText variant="caption" color={colors.borderOpaque} style={{ marginLeft: spacing.xs }}>
                    Sign here
                  </AppText>
                </View>
              )}

              {/* Already-captured notice — shown when returning to this screen */}
              {!hasSignature && data.consentGiven && (
                <View style={styles.signaturePlaceholder} pointerEvents="none">
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <AppText variant="caption" color={colors.success} style={{ marginLeft: spacing.xs }}>
                    Signature captured — sign again to update
                  </AppText>
                </View>
              )}
            </View>

            {errors.signature ? (
              <AppText variant="caption" color={colors.error} style={styles.fieldError}>
                {errors.signature}
              </AppText>
            ) : null}

            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearSignature}
              disabled={!hasSignature}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color={hasSignature ? colors.error : colors.borderOpaque} />
              <AppText
                variant="caption"
                color={hasSignature ? colors.error : colors.borderOpaque}
                style={{ marginLeft: 4 }}
              >
                Clear Signature
              </AppText>
            </TouchableOpacity>
          </View>

          {/* ── Section 5 — Final confirmation ── */}
          <TouchableOpacity
            style={[
              styles.confirmRow,
              confirmed && styles.confirmRowChecked,
              errors.confirmed ? styles.confirmRowError : null,
            ]}
            onPress={() => { setConfirmed((v) => !v); setErrors((p) => ({ ...p, confirmed: '' })); }}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
              {confirmed && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <AppText variant="caption" color={colors.textPrimary} style={{ flex: 1 }}>
              I confirm that I have read, understood, and agree to the above terms and conditions.
            </AppText>
          </TouchableOpacity>
          {errors.confirmed ? (
            <AppText variant="caption" color={colors.error} style={styles.fieldError}>
              {errors.confirmed}
            </AppText>
          ) : null}

          {/* ── Section 6 — Legal footer ── */}
          <AppText variant="caption2" color={colors.textTertiary} style={styles.legalFooter}>
            This consent is captured digitally as part of the V-Guard Trial Program. The signature
            and declaration above will be stored securely and transmitted to V-Guard for record-keeping.
          </AppText>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.primaryBtn, generating && { opacity: 0.7 }]}
            onPress={handleContinue}
            disabled={generating}
            activeOpacity={0.85}
          >
            <AppText variant="label" color={colors.headerBg}>
              {generating ? 'Generating document…' : 'Proceed to Customer Details'}
            </AppText>
            {!generating && (
              <View style={styles.btnArrow}>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, required, error, children, colors }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ marginBottom: spacing.xs }}>
      <AppText variant="label" style={{ marginBottom: spacing.xs }}>
        {label}{required && <AppText variant="label" color={colors.error}> *</AppText>}
      </AppText>
      {children}
      {error ? (
        <AppText variant="caption" color={colors.error} style={{ marginTop: 4 }}>{error}</AppText>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    safe:    { flex: 1, backgroundColor: colors.headerBg },
    flex:    { flex: 1 },
    header:  {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      backgroundColor: colors.headerBg,
    },
    backBtn: { padding: spacing.xs },
    body: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md,
    },

    titleBlock: { gap: spacing.xs },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    sectionIconBox: {
      width: 24, height: 24, borderRadius: 6,
      backgroundColor: colors.headerBg,
      alignItems: 'center', justifyContent: 'center',
    },

    disclaimerCard: {
      backgroundColor: colors.primaryFaint, borderRadius: radius.md,
      padding: spacing.md,
      borderLeftWidth: 3, borderLeftColor: colors.primary,
    },
    disclaimerText: { lineHeight: 20 },

    agreementCard: {
      backgroundColor: colors.surface, borderRadius: radius.md,
      padding: spacing.md, borderWidth: 1, borderColor: colors.border,
      gap: spacing.sm,
    },
    agreementRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    agreementCheck: {
      width: 18, height: 18, borderRadius: 4,
      backgroundColor: colors.success,
      alignItems: 'center', justifyContent: 'center',
      marginTop: 2, flexShrink: 0,
    },
    agreementText: { flex: 1, lineHeight: 18 },

    inputSection: { gap: spacing.sm },
    inputBox: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: colors.border,
      borderRadius: radius.md, backgroundColor: colors.surface,
      paddingHorizontal: spacing.md, minHeight: 50,
    },
    inputErr:  { borderColor: colors.error },
    prefix:    { marginRight: spacing.xs, fontWeight: '600' },
    prefixDiv: { width: 1, height: 20, backgroundColor: colors.border, marginRight: spacing.sm },
    input:     { flex: 1, fontSize: 16, color: colors.textPrimary, paddingVertical: spacing.sm },

    signatureSection: { gap: spacing.sm },
    signatureHint:    { marginBottom: spacing.xs },
    canvasWrapper: {
      borderWidth: 1.5, borderColor: colors.border,
      borderRadius: radius.md, overflow: 'hidden',
      position: 'relative', minHeight: 160,
    },
    canvasWrapperErr: { borderColor: colors.error },
    signaturePlaceholder: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    },
    clearBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', padding: spacing.xs },
    fieldError: { marginTop: 2 },

    confirmRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
      backgroundColor: colors.surface, borderRadius: radius.md,
      borderWidth: 1.5, borderColor: colors.border,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    },
    confirmRowChecked: { borderColor: colors.primary, backgroundColor: colors.primaryFaint },
    confirmRowError:   { borderColor: colors.error,   backgroundColor: colors.errorLight },
    checkbox: {
      width: 24, height: 24, borderRadius: 6,
      borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, marginTop: 1,
    },
    checkboxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },

    legalFooter: { textAlign: 'center', lineHeight: 16, paddingHorizontal: spacing.md },

    primaryBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.primary, borderRadius: radius.lg,
      paddingVertical: spacing.md, marginTop: spacing.sm, ...shadows.sm,
    },
    btnArrow: {
      marginLeft: spacing.md, backgroundColor: colors.primaryDark,
      width: 26, height: 26, borderRadius: 13,
      alignItems: 'center', justifyContent: 'center',
    },
  });
}
