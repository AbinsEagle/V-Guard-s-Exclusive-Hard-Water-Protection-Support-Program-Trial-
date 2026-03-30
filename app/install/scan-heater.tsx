import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing } from '../../src/theme';

const STEP_LABELS = ['Technician', 'Heater', 'Cartridge', 'Customer', 'Photos', 'Review'];

export default function ScanHeaterScreen() {
  const { data, update } = useInstallation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [useManual, setUseManual] = useState(Platform.OS === 'web');
  const [error, setError] = useState('');

  const handleBarcodeScan = ({ data: code }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    update({ heaterSerialNumber: code });
    router.push('/install/scan-cartridge');
  };

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!code) { setError('Please enter the heater serial number'); return; }
    update({ heaterSerialNumber: code });
    router.push('/install/scan-cartridge');
  };

  const requestCameraAccess = async () => {
    const result = await requestPermission();
    if (!result.granted) setUseManual(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>
          Scan Water Heater
        </AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={2} totalSteps={6} labels={STEP_LABELS} />

      <View style={styles.body}>
        {!useManual ? (
          <>
            {/* Camera not yet granted */}
            {!permission?.granted ? (
              <View style={styles.permissionBox}>
                <Ionicons name="camera-outline" size={52} color={colors.primaryLight} />
                <AppText variant="h3" style={styles.permTitle}>
                  Camera Access Needed
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.permDesc}>
                  Allow camera access to scan the QR code on the water heater unit.
                </AppText>
                <TouchableOpacity style={styles.primaryBtn} onPress={requestCameraAccess}>
                  <AppText variant="label" color={colors.white}>Allow Camera</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setUseManual(true)}>
                  <AppText variant="caption" color={colors.primary} style={styles.manualLink}>
                    Enter code manually instead
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : (
              /* Scanner */
              <View style={styles.scannerWrapper}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39'] }}
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
                >
                  <View style={styles.overlay}>
                    <View style={styles.scanFrame}>
                      <View style={[styles.corner, styles.cornerTL]} />
                      <View style={[styles.corner, styles.cornerTR]} />
                      <View style={[styles.corner, styles.cornerBL]} />
                      <View style={[styles.corner, styles.cornerBR]} />
                    </View>
                    <AppText variant="caption" color={colors.white} style={styles.scanHint}>
                      Align QR code within the frame
                    </AppText>
                  </View>
                </CameraView>
                {scanned && (
                  <View style={styles.scanningIndicator}>
                    <ActivityIndicator color={colors.primary} />
                    <AppText variant="caption" color={colors.primary}>Processing...</AppText>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.manualToggle}
                  onPress={() => setUseManual(true)}
                >
                  <Ionicons name="keypad-outline" size={16} color={colors.primary} />
                  <AppText variant="caption" color={colors.primary} style={{ marginLeft: 6 }}>
                    Enter manually
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          /* Manual Entry */
          <View style={styles.manualBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="barcode-outline" size={36} color={colors.primary} />
            </View>
            <AppText variant="h3" style={styles.manualTitle}>
              Enter Heater Serial Number
            </AppText>
            <AppText variant="body" color={colors.textSecondary} style={styles.manualDesc}>
              Find the serial number on the label at the back or bottom of the water heater unit.
            </AppText>
            <View style={[styles.inputBox, error ? styles.inputBoxError : null]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. VG-WH-20240001"
                placeholderTextColor={colors.textHint}
                value={manualCode}
                onChangeText={(t) => { setManualCode(t.toUpperCase()); setError(''); }}
                autoCapitalize="characters"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleManualSubmit}
              />
            </View>
            {error ? (
              <AppText variant="caption" color={colors.error} style={styles.errorText}>
                {error}
              </AppText>
            ) : null}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleManualSubmit}>
              <AppText variant="label" color={colors.white}>Confirm & Continue</AppText>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={() => setUseManual(false)}>
                <AppText variant="caption" color={colors.primary} style={styles.manualLink}>
                  Use QR scanner instead
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const CORNER = 20;
const CORNER_THICK = 3;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryDark,
  },
  backBtn: { padding: spacing.xs },
  body: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // Permission box
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  permTitle: { textAlign: 'center' },
  permDesc: { textAlign: 'center', lineHeight: 22 },

  // Scanner
  scannerWrapper: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.accent,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK },
  scanHint: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  manualToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Manual entry
  manualBox: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  manualTitle: { textAlign: 'center' },
  manualDesc: { textAlign: 'center', lineHeight: 22 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    width: '100%',
  },
  inputBoxError: { borderColor: colors.error },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    letterSpacing: 1,
  },
  errorText: { alignSelf: 'flex-start' },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  manualLink: {
    marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },
});
