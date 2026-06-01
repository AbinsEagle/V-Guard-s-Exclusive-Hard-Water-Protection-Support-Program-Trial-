import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing, radius, shadows } from '../../src/theme';

export const STEP_LABELS = ['Technician', 'Units', 'Consent', 'Product', 'Photos', 'Review'];

// ─── Web barcode scanner ──────────────────────────────────────────────────────
// Works on ALL browsers: iOS Safari, Brave, Firefox, Chrome.
//
// Approach:
//   1. getUserMedia with facingMode:'environment'  → back camera
//   2. Draw frames to a hidden <canvas> every 300 ms
//   3. jsQR decodes QR codes on every browser (pure JS, no native API needed)
//   4. BarcodeDetector also runs in parallel on Chrome/Android for Code128/EAN/etc.

function WebScanner({ onScan, onClose }: { onScan: (code: string) => void; onClose: () => void }) {
  const videoRef  = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const timerRef  = useRef<any>(null);
  const lockRef   = useRef(false);
  const [status, setStatus] = useState<'starting' | 'ready' | 'error'>('starting');
  const [errMsg,  setErrMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1 — get camera stream, always prefer back camera
      let stream: any;
      try {
        stream = await (navigator as any).mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width:  { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (e: any) {
        if (!cancelled) {
          setStatus('error');
          setErrMsg('Camera access denied. Allow camera permission and try again.');
        }
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t: any) => t.stop()); return; }
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Wait until the video is actually playing
      await new Promise<void>((resolve) => {
        const v = videoRef.current;
        if (!v) { resolve(); return; }
        if (v.readyState >= 3) { resolve(); return; }
        v.oncanplay = () => resolve();
      });
      if (cancelled) return;
      setStatus('ready');

      // 2 — optional BarcodeDetector (Chrome Android — faster, multi-format)
      let detector: any = null;
      if ('BarcodeDetector' in window) {
        try {
          detector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'code_93', 'ean_13', 'ean_8', 'pdf417', 'data_matrix'],
          });
        } catch { detector = null; }
      }

      // 3 — poll: jsQR (universal) + BarcodeDetector (if available)
      timerRef.current = setInterval(async () => {
        if (lockRef.current) return;
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return;

        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(video, 0, 0, w, h);

        // jsQR — works on every browser including iOS Safari & Brave
        try {
          const jsQR = (await import('jsqr')).default;
          const imgData = ctx.getImageData(0, 0, w, h);
          const result  = jsQR(imgData.data, w, h, { inversionAttempts: 'dontInvert' });
          if (result && !lockRef.current) {
            lockRef.current = true;
            onScan(result.data);
            return;
          }
        } catch { /* frame processing error, skip */ }

        // BarcodeDetector — covers Code128 / EAN / etc. on Chrome
        if (detector) {
          try {
            const results = await detector.detect(video);
            if (results.length > 0 && !lockRef.current) {
              lockRef.current = true;
              onScan(results[0].rawValue);
            }
          } catch { /* frame not ready */ }
        }
      }, 300);
    })();

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t: any) => t.stop());
    };
  }, []);

  return (
    <View style={styles.cameraScreen}>
      {/* @ts-ignore — valid HTML element in Expo Web / React Native Web */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' } as any}
      />
      {/* Hidden canvas for jsQR frame capture */}
      {/* @ts-ignore */}
      <canvas ref={canvasRef} style={{ display: 'none' } as any} />

      <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity onPress={onClose} style={styles.camClose}>
            <Ionicons name="close" size={26} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.camBadge}>
            <Ionicons name="qr-code-outline" size={14} color={colors.white} />
            <AppText variant="label" color={colors.white} style={{ marginLeft: 6 }}>Scan Heater QR / Barcode</AppText>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.finderWrapper}>
          {status === 'starting' && (
            <View style={styles.cameraInitBox}>
              <ActivityIndicator color={colors.primary} size="large" />
              <AppText variant="caption" color={colors.white} style={{ marginTop: 10 }}>Starting camera…</AppText>
            </View>
          )}
          {status === 'error' && (
            <View style={styles.cameraInitBox}>
              <Ionicons name="camera-outline" size={40} color={colors.error} />
              <AppText variant="caption" color={colors.white} style={{ marginTop: 10, textAlign: 'center' }}>{errMsg}</AppText>
            </View>
          )}
          {status === 'ready' && (
            <>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cTL]} />
                <View style={[styles.corner, styles.cTR]} />
                <View style={[styles.corner, styles.cBL]} />
                <View style={[styles.corner, styles.cBR]} />
              </View>
              <AppText variant="caption" color={colors.white} style={styles.scanHint}>
                Hold steady — align QR inside the frame
              </AppText>
            </>
          )}
        </View>

        <View style={styles.camFooter}>
          <TouchableOpacity style={styles.manualToggle} onPress={onClose}>
            <Ionicons name="keypad-outline" size={16} color={colors.primary} />
            <AppText variant="caption" color={colors.primary} style={{ marginLeft: 6 }}>Enter manually instead</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Native barcode scanner (iOS / Android app) ───────────────────────────────

function NativeScanner({
  cameraKey, cameraReady, onReady, onScan, onClose,
}: {
  cameraKey: number;
  cameraReady: boolean;
  onReady: () => void;
  onScan: (e: { data: string }) => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.cameraScreen}>
      <CameraView
        key={cameraKey}
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'code128', 'code39', 'code93', 'ean13', 'ean8', 'pdf417', 'datamatrix'],
        }}
        onBarcodeScanned={cameraReady ? onScan : undefined}
        onCameraReady={onReady}
      >
        <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={onClose} style={styles.camClose}>
              <Ionicons name="close" size={26} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.camBadge}>
              <Ionicons name="qr-code-outline" size={14} color={colors.white} />
              <AppText variant="label" color={colors.white} style={{ marginLeft: 6 }}>Scan Heater QR / Barcode</AppText>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.finderWrapper}>
            {!cameraReady ? (
              <View style={styles.cameraInitBox}>
                <ActivityIndicator color={colors.primary} size="large" />
                <AppText variant="caption" color={colors.white} style={{ marginTop: 10 }}>Starting camera…</AppText>
              </View>
            ) : (
              <>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cTL]} />
                  <View style={[styles.corner, styles.cTR]} />
                  <View style={[styles.corner, styles.cBL]} />
                  <View style={[styles.corner, styles.cBR]} />
                </View>
                <AppText variant="caption" color={colors.white} style={styles.scanHint}>
                  Hold steady — align QR or barcode inside the frame
                </AppText>
              </>
            )}
          </View>

          <View style={styles.camFooter}>
            <TouchableOpacity style={styles.manualToggle} onPress={onClose}>
              <Ionicons name="keypad-outline" size={16} color={colors.primary} />
              <AppText variant="caption" color={colors.primary} style={{ marginLeft: 6 }}>Enter manually instead</AppText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function UnitRegistrationScreen() {
  const { data, update } = useInstallation();
  const [permission, requestPermission] = useCameraPermissions();

  const [heaterSerial,    setHeaterSerial]    = useState(data.heaterSerialNumber || '');
  const [cartridgeNum,    setCartridgeNum]     = useState(
    data.cartridgeNumber ? data.cartridgeNumber.replace(/^VG-/i, '') : ''
  );
  const [sampleCollected, setSampleCollected] = useState(data.waterSampleCollected || false);
  const [scanOpen,        setScanOpen]        = useState(false);
  const [heaterScanned,   setHeaterScanned]   = useState(false);
  const [errors,          setErrors]          = useState({ heater: '', cartridge: '', sample: '' });

  // Native-only state
  const [cameraKey,   setCameraKey]   = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const scanLock = useRef(false);

  const openScanner = async () => {
    if (Platform.OS !== 'web') {
      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) return;
      }
      scanLock.current = false;
      setCameraReady(false);
      setCameraKey((k) => k + 1);
    }
    setHeaterScanned(false);
    setScanOpen(true);
  };

  const handleScan = (code: string) => {
    if (scanLock.current) return;
    scanLock.current = true;
    setHeaterSerial('Q-' + code.toUpperCase());
    setErrors((e) => ({ ...e, heater: '' }));
    setHeaterScanned(true);
    setScanOpen(false);
  };

  const handleNativeScan = ({ data: code }: { data: string }) => handleScan(code);

  const handleContinue = () => {
    const e = { heater: '', cartridge: '', sample: '' };
    if (!heaterSerial.trim())  e.heater    = 'Heater serial number is required';
    if (!cartridgeNum.trim())  e.cartridge = 'Cartridge number is required';
    if (!sampleCollected)      e.sample    = 'Water sample must be collected before proceeding';
    setErrors(e);
    if (e.heater || e.cartridge || e.sample) return;

    update({
      heaterSerialNumber:   heaterSerial.trim(),
      cartridgeNumber:      cartridgeNum.trim() ? 'VG-' + cartridgeNum.trim() : '',
      waterSampleCollected: sampleCollected,
    });
    router.push('/install/consent');
  };

  // ── Camera overlay ──────────────────────────────────────────────────────────
  if (scanOpen) {
    if (Platform.OS === 'web') {
      return <WebScanner onScan={handleScan} onClose={() => setScanOpen(false)} />;
    }
    if (permission?.granted) {
      return (
        <NativeScanner
          cameraKey={cameraKey}
          cameraReady={cameraReady}
          onReady={() => setCameraReady(true)}
          onScan={handleNativeScan}
          onClose={() => setScanOpen(false)}
        />
      );
    }
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>Product Registration</AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={2} totalSteps={6} labels={STEP_LABELS} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Heater serial ── */}
          <View style={fieldStyles.wrapper}>
            <AppText variant="label" style={fieldStyles.label}>
              Water Heater Serial No. <AppText variant="label" color={colors.error}>*</AppText>
            </AppText>
            <View style={[styles.inputBox, errors.heater ? styles.inputErr : heaterScanned ? styles.inputOk : null]}>
              <Ionicons
                name="barcode-outline" size={18}
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
              {heaterScanned ? (
                <View style={styles.scannedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.qrBtn} onPress={openScanner} activeOpacity={0.7}
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
              : null}
          </View>

          {/* ── Cartridge number ── */}
          <View style={fieldStyles.wrapper}>
            <AppText variant="label" style={fieldStyles.label}>
              Cartridge No. <AppText variant="label" color={colors.error}>*</AppText>
            </AppText>
            <View style={[styles.inputBox, errors.cartridge ? styles.inputErr : null]}>
              <Ionicons name="cube-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <AppText variant="body" color={colors.textSecondary} style={styles.prefix}>VG-</AppText>
              <View style={styles.prefixDiv} />
              <TextInput
                style={styles.input}
                placeholder="0001"
                placeholderTextColor={colors.textHint}
                value={cartridgeNum}
                onChangeText={(t) => {
                  setCartridgeNum(t.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8));
                  setErrors((e) => ({ ...e, cartridge: '' }));
                }}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
            {errors.cartridge
              ? <AppText variant="caption" color={colors.error} style={fieldStyles.error}>{errors.cartridge}</AppText>
              : null}
          </View>

          {/* ── Water sample checkbox ── */}
          <TouchableOpacity
            style={[styles.checkRow, sampleCollected && styles.checkRowChecked, errors.sample ? styles.checkRowError : null]}
            onPress={() => { setSampleCollected((v) => !v); setErrors((e) => ({ ...e, sample: '' })); }}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, sampleCollected && styles.checkboxChecked]}>
              {sampleCollected && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label" color={colors.textPrimary}>Water Sample Collected</AppText>
              <AppText variant="caption2" color={colors.textSecondary} style={styles.sampleHint}>
                Use the sample bottle in the package, collect the water sample, and send it back to the research centre.
              </AppText>
            </View>
            <AppText variant="caption2" color={sampleCollected ? colors.primary : colors.textSecondary} style={{ fontWeight: '700' }}>
              {sampleCollected ? 'Yes' : 'No'}
            </AppText>
          </TouchableOpacity>
          {errors.sample ? (
            <View style={styles.sampleError}>
              <Ionicons name="alert-circle" size={13} color={colors.error} />
              <AppText variant="caption" color={colors.error}>{errors.sample}</AppText>
            </View>
          ) : null}

          {/* ── CTA ── */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
            <AppText variant="label" color={colors.headerBg}>Proceed to Customer Consent</AppText>
            <View style={styles.btnArrow}>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, minHeight: 50,
  },
  inputErr:  { borderColor: colors.error },
  inputOk:   { borderColor: colors.success },
  inputIcon: { marginRight: spacing.sm },
  prefix:    { marginRight: spacing.xs, fontWeight: '600' },
  prefixDiv: { width: 1, height: 20, backgroundColor: colors.border, marginRight: spacing.sm },
  input: {
    flex: 1, fontSize: 16, color: colors.textPrimary,
    paddingVertical: spacing.sm, letterSpacing: 1,
  },
  qrBtn: {
    padding: spacing.xs, backgroundColor: colors.primaryFaint,
    borderRadius: radius.sm, marginLeft: spacing.xs,
  },
  scannedBadge: { marginLeft: spacing.xs },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
  },
  checkRowChecked: { borderColor: colors.primary, backgroundColor: colors.primaryFaint },
  checkRowError:   { borderColor: colors.error,   backgroundColor: colors.errorLight },
  sampleHint:  { lineHeight: 16, marginTop: 2 },
  sampleError: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -4 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
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

  // Camera shared
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
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20,
  },
  finderWrapper: { alignItems: 'center', gap: spacing.lg },
  cameraInitBox: { alignItems: 'center', justifyContent: 'center', height: 230, paddingHorizontal: 24 },
  scanFrame:     { width: 230, height: 230, position: 'relative' },
  corner:        { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: colors.primary },
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

const fieldStyles = StyleSheet.create({
  wrapper: {},
  label:   { marginBottom: spacing.xs },
  error:   { marginTop: 4 },
});
