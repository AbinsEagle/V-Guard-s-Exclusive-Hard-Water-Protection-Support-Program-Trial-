import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing, radius, shadows } from '../../src/theme';

const STEP_LABELS = ['Technician', 'Units', 'Customer', 'Photos', 'Review'];

type PhotoSlot = 'front' | 'side' | 'scale';

interface PhotoState {
  front: string | null;
  side: string | null;
  scale: string | null;
}

const CAMERA_LABELS: Record<PhotoSlot, string> = {
  front: 'Front View',
  side:  'Side View',
  scale: 'Existing Scale',
};

const CAMERA_GUIDES: Record<PhotoSlot, string> = {
  front: 'Capture anti-scalant unit — front face',
  side:  'Capture anti-scalant unit — side profile',
  scale: 'Capture scale buildup on tap / showerhead',
};

export default function PhotosScreen() {
  const { data, update } = useInstallation();
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<PhotoState>({
    front: data.frontPhotoUri,
    side:  data.sidePhotoUri,
    scale: data.scalePhotoUri,
  });
  const [activeSlot, setActiveSlot] = useState<PhotoSlot | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const openCamera = async (slot: PhotoSlot) => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setActiveSlot(slot);
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !activeSlot) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      if (photo) {
        setPhotos((prev) => ({ ...prev, [activeSlot]: photo.uri }));
        setActiveSlot(null);
      }
    } catch {
      setActiveSlot(null);
    }
  };

  const handleContinue = () => {
    update({
      frontPhotoUri: photos.front,
      sidePhotoUri:  photos.side,
      scalePhotoUri: photos.scale,
    });
    router.push('/install/review');
  };

  const requiredCaptured = !!(photos.front && photos.side && photos.scale);

  // ── Full-screen camera ──
  if (activeSlot && permission?.granted) {
    return (
      <View style={styles.cameraScreen}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" type={"back" as any}>
          <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setActiveSlot(null)} style={styles.cameraBack}>
                <Ionicons name="close" size={26} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={13} color={colors.white} />
                <AppText variant="label" color={colors.white} style={{ marginLeft: 6 }}>
                  {CAMERA_LABELS[activeSlot]}
                </AppText>
              </View>
              <View style={{ width: 40 }} />
            </View>
            <View style={styles.cameraGuide}>
              <AppText variant="caption" color={colors.white} style={styles.cameraGuideText}>
                {CAMERA_GUIDES[activeSlot]}
              </AppText>
            </View>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>Installation Photos</AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={4} totalSteps={5} labels={STEP_LABELS} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Row 1: front + side */}
        <View style={styles.photoRow}>
          <PhotoCard
            slot="front"
            label="Front View"
            hint="Face of unit"
            photoUri={photos.front}
            onCapture={() => openCamera('front')}
            onRetake={() => openCamera('front')}
          />
          <PhotoCard
            slot="side"
            label="Side View"
            hint="Side profile"
            photoUri={photos.side}
            onCapture={() => openCamera('side')}
            onRetake={() => openCamera('side')}
          />
        </View>

        {/* Row 2: scale baseline (required) */}
        <View style={styles.scaleRow}>
          <View style={styles.scaleCardWrapper}>
            <PhotoCard
              slot="scale"
              label="Existing Scale"
              hint="Tap / showerhead"
              photoUri={photos.scale}
              onCapture={() => openCamera('scale')}
              onRetake={() => openCamera('scale')}
            />
          </View>
        </View>

        {/* Status indicators */}
        <View style={styles.statusRow}>
          <StatusDot captured={!!photos.front} label="Front" />
          <StatusDot captured={!!photos.side}  label="Side" />
          <StatusDot captured={!!photos.scale} label="Scale" />
          {!requiredCaptured && (
            <AppText variant="caption2" color={colors.textTertiary} style={styles.statusHint}>
              All 3 photos required
            </AppText>
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.primaryBtn, !requiredCaptured && styles.primaryBtnDisabled]}
          onPress={handleContinue}
          disabled={!requiredCaptured}
          activeOpacity={0.8}
        >
          <AppText variant="label" color={colors.headerBg}>Review & Submit</AppText>
          <View style={styles.btnArrow}>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

function PhotoCard({
  label, hint, photoUri, onCapture, onRetake,
}: {
  slot: PhotoSlot;
  label: string;
  hint: string;
  photoUri: string | null;
  onCapture: () => void;
  onRetake: () => void;
}) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <View style={cardStyles.labelBadge}>
          <AppText variant="caption2" color={colors.headerBg} style={cardStyles.labelText}>
            {label}
          </AppText>
        </View>
        {photoUri
          ? <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          : <Ionicons name="ellipse-outline"  size={16} color={colors.borderOpaque} />
        }
      </View>

      {photoUri ? (
        <View style={cardStyles.previewWrapper}>
          <Image source={{ uri: photoUri }} style={cardStyles.preview} resizeMode="cover" />
          <TouchableOpacity style={cardStyles.retakeBtn} onPress={onRetake}>
            <Ionicons name="camera-reverse-outline" size={14} color={colors.white} />
            <AppText variant="caption2" color={colors.white} style={{ marginLeft: 3 }}>Retake</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={cardStyles.captureArea} onPress={onCapture} activeOpacity={0.75}>
          <Ionicons name="camera-outline" size={28} color={colors.primary} />
          <AppText variant="caption2" color={colors.textSecondary} style={{ marginTop: 4 }}>
            {hint}
          </AppText>
          <AppText variant="caption2" color={colors.primary} style={cardStyles.tapLabel}>
            Tap to capture
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatusDot({ captured, label, optional }: { captured: boolean; label: string; optional?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: captured
          ? colors.success
          : optional ? 'rgba(196,122,0,0.35)' : colors.borderOpaque,
      }} />
      <AppText variant="caption2" color={captured ? colors.success : colors.textTertiary}>
        {label}{optional ? ' (opt)' : ''}
      </AppText>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.headerBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.headerBg,
  },
  backBtn: { padding: spacing.xs },

  scrollArea: { flex: 1, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  photoRow:  { flexDirection: 'row', gap: spacing.md, height: 220 },

  scaleRow: { flexDirection: 'row' },
  scaleCardWrapper: { width: '48%', height: 160 },

  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  statusHint: { marginLeft: 'auto' },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg, paddingVertical: spacing.md,
    ...shadows.sm,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  btnArrow: {
    marginLeft: spacing.md,
    backgroundColor: colors.primaryDark,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },

  // Camera
  cameraScreen:    { flex: 1, backgroundColor: '#000' },
  camera:          { flex: 1 },
  cameraOverlay:   { flex: 1, justifyContent: 'space-between' },
  cameraHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
  },
  cameraBack:  { padding: spacing.xs },
  cameraBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  cameraGuide: { alignItems: 'center', padding: spacing.md },
  cameraGuideText: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20, textAlign: 'center',
  },
  cameraControls: { alignItems: 'center', paddingBottom: spacing.xl },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.white,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  labelBadge: {
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(196,122,0,0.20)',
  },
  labelText: { fontWeight: '700' },

  captureArea: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.borderOpaque,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    minHeight: 80,
    gap: 2,
  },
  tapLabel: { fontWeight: '600', marginTop: 2 },

  previewWrapper: { flex: 1, position: 'relative', minHeight: 80 },
  preview: { flex: 1, borderRadius: radius.md },
  retakeBtn: {
    position: 'absolute', bottom: spacing.xs, right: spacing.xs,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: spacing.xs + 2, paddingVertical: 3,
    borderRadius: radius.sm,
  },
});
