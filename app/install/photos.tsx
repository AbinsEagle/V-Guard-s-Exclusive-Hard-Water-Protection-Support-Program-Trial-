import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
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

type PhotoSlot = 'front' | 'side';

interface PhotoState {
  front: string | null;
  side: string | null;
}

export default function PhotosScreen() {
  const { data, update } = useInstallation();
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<PhotoState>({
    front: data.frontPhotoUri,
    side: data.sidePhotoUri,
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
        const uri = photo.uri;
        setPhotos((prev) => ({ ...prev, [activeSlot]: uri }));
        setActiveSlot(null);
      }
    } catch (e) {
      setActiveSlot(null);
    }
  };

  const handleContinue = () => {
    update({ frontPhotoUri: photos.front, sidePhotoUri: photos.side });
    router.push('/install/review');
  };

  const bothCaptured = photos.front && photos.side;

  // ── Camera view ──
  if (activeSlot && permission?.granted) {
    return (
      <View style={styles.cameraScreen}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setActiveSlot(null)} style={styles.cameraBack}>
                <Ionicons name="close" size={26} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.cameraBadge}>
                <AppText variant="label" color={colors.white}>
                  {activeSlot === 'front' ? '📸 Front View' : '📸 Side View'}
                </AppText>
              </View>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.cameraGuide}>
              <AppText variant="caption" color={colors.white} style={styles.cameraGuideText}>
                {activeSlot === 'front'
                  ? 'Capture the anti-scalant unit from the front'
                  : 'Capture the anti-scalant unit from the side'}
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

      <StepIndicator currentStep={5} totalSteps={6} labels={STEP_LABELS} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        <AppText variant="body" color={colors.textSecondary} style={styles.instruction}>
          Take two photos of the anti-scalant unit fitted on the water heater — front view and side view.
        </AppText>

        {/* Front Photo */}
        <PhotoCard
          slot="front"
          label="Front View"
          description="Face of the anti-scalant unit on the heater"
          photoUri={photos.front}
          onCapture={() => openCamera('front')}
          onRetake={() => openCamera('front')}
        />

        {/* Side Photo */}
        <PhotoCard
          slot="side"
          label="Side View"
          description="Side profile showing the connection point"
          photoUri={photos.side}
          onCapture={() => openCamera('side')}
          onRetake={() => openCamera('side')}
        />

        {/* Progress hint */}
        {!bothCaptured && (
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.info} />
            <AppText variant="caption" color={colors.info} style={styles.hintText}>
              Both photos are required to proceed
            </AppText>
          </View>
        )}

        {/* Web fallback note */}
        {Platform.OS === 'web' && !bothCaptured && (
          <View style={styles.webNote}>
            <Ionicons name="desktop-outline" size={16} color={colors.textSecondary} />
            <AppText variant="caption" color={colors.textSecondary} style={styles.hintText}>
              On desktop, use your device camera or upload photos directly
            </AppText>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, !bothCaptured && styles.primaryBtnDisabled]}
          onPress={handleContinue}
          disabled={!bothCaptured}
          activeOpacity={0.85}
        >
          <AppText variant="label" color={colors.headerBg}>Review & Submit</AppText>
          <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: spacing.sm }} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

function PhotoCard({
  slot, label, description, photoUri, onCapture, onRetake,
}: {
  slot: PhotoSlot;
  label: string;
  description: string;
  photoUri: string | null;
  onCapture: () => void;
  onRetake: () => void;
}) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.cardHeader}>
        <View style={cardStyles.badge}>
          <AppText variant="caption" color={colors.primary} style={cardStyles.badgeText}>
            {label}
          </AppText>
        </View>
        {photoUri && (
          <View style={cardStyles.doneBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <AppText variant="caption" color={colors.success}>Captured</AppText>
          </View>
        )}
      </View>
      <AppText variant="caption" color={colors.textSecondary} style={cardStyles.desc}>
        {description}
      </AppText>

      {photoUri ? (
        <View style={cardStyles.previewWrapper}>
          <Image source={{ uri: photoUri }} style={cardStyles.preview} resizeMode="cover" />
          <TouchableOpacity style={cardStyles.retakeBtn} onPress={onRetake}>
            <Ionicons name="camera-reverse-outline" size={16} color={colors.white} />
            <AppText variant="caption" color={colors.white} style={{ marginLeft: 4 }}>Retake</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={cardStyles.captureArea} onPress={onCapture} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={36} color={colors.primaryLight} />
          <AppText variant="label" color={colors.primary} style={{ marginTop: spacing.sm }}>
            Tap to Take Photo
          </AppText>
          <AppText variant="caption" color={colors.textHint}>
            {slot === 'front' ? 'Front of unit' : 'Side of unit'}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.headerBg },
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
  instruction: { lineHeight: 22, marginBottom: spacing.xs },
  hintBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.infoLight, borderRadius: 10,
    padding: spacing.sm + 2,
  },
  webNote: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.background, borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  hintText: { flex: 1 },
  primaryBtn: {
    flexDirection: 'row', backgroundColor: colors.primary,
    borderRadius: 14, paddingVertical: spacing.md,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm,
  },
  primaryBtnDisabled: { opacity: 0.4 },

  // Camera
  cameraScreen: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between' },
  cameraHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
  },
  cameraBack: { padding: spacing.xs },
  cameraBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  cameraGuide: {
    alignItems: 'center', padding: spacing.md,
  },
  cameraGuideText: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20, textAlign: 'center',
  },
  cameraControls: {
    alignItems: 'center', paddingBottom: spacing.xl,
  },
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
    backgroundColor: colors.surface,
    borderRadius: 16, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontWeight: '700' },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  desc: { lineHeight: 18 },
  captureArea: {
    height: 160, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs,
  },
  previewWrapper: { position: 'relative' },
  preview: {
    width: '100%', height: 200, borderRadius: 12,
  },
  retakeBtn: {
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: 20,
  },
});
