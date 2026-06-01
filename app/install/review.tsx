import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing } from '../../src/theme';
import { submitInstallation } from '../../src/services/submission';

const STEP_LABELS = ['Technician', 'Units', 'Consent', 'Product', 'Photos', 'Review'];

export default function ReviewScreen() {
  const { data } = useInstallation();
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    const result = await submitInstallation(data);
    setSubmitting(false);
    if (result.success) {
      router.replace('/install/success');
    } else {
      setSubmitError(result.error ?? 'Submission failed. Please try again.');
    }
  };

  const goTo = (route: string) => {
    if (!submitting) router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={submitting}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>Review & Submit</AppText>
        <TouchableOpacity
          style={styles.devChip}
          onPress={() => router.push('/dev' as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="caption2" color="rgba(255,255,255,0.45)">DEV</AppText>
        </TouchableOpacity>
      </View>

      <StepIndicator currentStep={6} totalSteps={6} labels={STEP_LABELS} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        <AppText variant="caption" color={colors.textSecondary} style={styles.editHint}>
          Tap any section to edit
        </AppText>

        {/* Linked Units */}
        <Section title="Linked Units" icon="link" onEdit={() => goTo('/install/scan-heater')}>
          <Row label="Heater Serial No." value={data.heaterSerialNumber} />
          <Row label="Cartridge No." value={data.cartridgeNumber} />
          <Row label="Sample Collected" value={data.waterSampleCollected ? 'Yes' : 'No'} />
        </Section>

        {/* Consent */}
        <Section title="Customer Consent" icon="shield-checkmark" onEdit={() => goTo('/install/consent')}>
          <Row label="Customer Name" value={data.customerName} />
          <Row label="WhatsApp" value={data.customerWhatsApp ? `+91 ${data.customerWhatsApp}` : '—'} />
          <Row label="Pincode" value={data.pincode} />
          <Row label="Consent Given" value={data.consentGiven ? 'Yes' : 'No'} />
          {data.consentTimestamp ? (
            <Row
              label="Signed At"
              value={new Date(data.consentTimestamp).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            />
          ) : null}
          {data.consentSignatureUri ? (
            <View style={styles.signatureThumbWrapper}>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                Signature
              </AppText>
              {/* @ts-ignore — HTML img element on web */}
              <img
                src={data.consentSignatureUri}
                style={{
                  width: '100%', height: 240,
                  objectFit: 'contain', borderRadius: 8,
                  backgroundColor: '#FAFAFA',
                  border: '1px solid rgba(60,60,67,0.18)',
                  display: 'block',
                } as any}
                alt="Customer signature"
              />
            </View>
          ) : null}
        </Section>

        {/* Technician */}
        <Section title="Service Person" icon="person-circle" onEdit={() => goTo('/')}>
          <Row label="Name" value={data.technicianName} />
          <Row label="Mobile" value={`+91 ${data.technicianPhone}`} />
        </Section>

        {/* Customer */}
        <Section title="Water Quality" icon="water" onEdit={() => goTo('/install/customer-form')}>
          <Row label="Name" value={data.customerName} />
          <Row label="WhatsApp" value={`+91 ${data.customerWhatsApp}`} />
          <Row label="Pincode" value={data.pincode} />
          <Row label="Water Source" value={data.waterSource} />
          {data.waterHardnessEstimate ? <Row label="TDS Range" value={`${data.waterHardnessEstimate} ppm`} /> : null}
          <Row label="GPS" value={data.gpsLat ? `${parseFloat(data.gpsLat).toFixed(4)}, ${parseFloat(data.gpsLng).toFixed(4)}` : 'Not captured'} />
          <Row label="Date" value={new Date(data.installationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
          {data.waterQualityFeel ? <Row label="Water Feel" value={data.waterQualityFeel} /> : null}
          {data.existingScaleVisualRating ? <Row label="Scale Condition" value={`${data.existingScaleVisualRating} / 5`} /> : null}
        </Section>

        {/* Heater Specs */}
        <Section title="Water Heater" icon="hardware-chip" onEdit={() => goTo('/install/customer-form')}>
          <Row label="Model" value={data.heaterModel} />
          <Row label="Capacity" value={data.heaterCapacity} />
          <Row label="Wattage" value={data.heaterWattage ? `${parseInt(data.heaterWattage) / 1000} kW` : '—'} />
          {data.heaterAgeYears ? <Row label="Age" value={data.heaterAgeYears} /> : null}
          {data.hotWaterTemperatureSetting ? <Row label="Thermostat" value={data.hotWaterTemperatureSetting} /> : null}
        </Section>

        {/* Usage */}
        <Section title="Daily Usage" icon="time" onEdit={() => goTo('/install/customer-form')}>
          <Row label="People/day" value={data.peoplePerDay} />
          <Row label="Baths/person/day" value={data.bathsPerDay} />
          {data.heaterUsagePattern ? <Row label="Heater On Time" value={data.heaterUsagePattern} /> : null}
        </Section>

        {/* Photos */}
        <Section title="Photos" icon="camera" onEdit={() => goTo('/install/photos')}>
          <View style={styles.photosRow}>
            <PhotoThumb label="Front" uri={data.frontPhotoUri} />
            <PhotoThumb label="Side" uri={data.sidePhotoUri} />
            <PhotoThumb label="Scale" uri={data.scalePhotoUri} />
          </View>
        </Section>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <>
              <ActivityIndicator color={colors.headerBg} size="small" />
              <AppText variant="label" color={colors.headerBg} style={{ marginLeft: spacing.sm }}>
                Submitting...
              </AppText>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.headerBg} />
              <AppText variant="label" color={colors.headerBg} style={{ marginLeft: spacing.sm }}>
                Submit Installation Record
              </AppText>
            </>
          )}
        </TouchableOpacity>

        {submitError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <AppText variant="caption" color={colors.error} style={{ flex: 1 }}>
              {submitError}
            </AppText>
          </View>
        ) : null}

        <AppText variant="caption" color={colors.textSecondary} style={styles.disclaimer}>
          By submitting, you confirm all details are accurate and the unit has been properly installed.
        </AppText>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({ title, icon, onEdit, children }: {
  title: string; icon: string; onEdit: () => void; children: React.ReactNode;
}) {
  return (
    <View style={secStyles.wrapper}>
      <TouchableOpacity style={secStyles.titleRow} onPress={onEdit} activeOpacity={0.7}>
        <View style={secStyles.iconBox}>
          <Ionicons name={icon as any} size={12} color={colors.white} />
        </View>
        <AppText variant="sectionTitle" color={colors.textSecondary} style={{ flex: 1 }}>
          {title}
        </AppText>
        <Ionicons name="pencil-outline" size={13} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={secStyles.card} onPress={onEdit} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <AppText variant="caption" color={colors.textSecondary} style={rowStyles.label}>{label}</AppText>
      <AppText variant="body" style={rowStyles.value}>{value || '—'}</AppText>
    </View>
  );
}

function PhotoThumb({ label, uri }: { label: string; uri: string | null }) {
  return (
    <View style={thumbStyles.wrapper}>
      {uri
        ? <Image source={{ uri }} style={thumbStyles.image} resizeMode="cover" />
        : (
          <View style={thumbStyles.placeholder}>
            <Ionicons name="camera-outline" size={24} color={colors.textHint} />
          </View>
        )
      }
      <AppText variant="caption" color={colors.textSecondary} style={thumbStyles.label}>{label}</AppText>
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
  devChip: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  body: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm,
  },
  editHint: { textAlign: 'center', marginBottom: spacing.xs },
  signatureThumbWrapper: { marginTop: spacing.xs },
  photosRow: { flexDirection: 'row', gap: spacing.md },
  submitBtn: {
    flexDirection: 'row', backgroundColor: colors.success,
    borderRadius: 14, paddingVertical: spacing.md + 2,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
    backgroundColor: colors.errorLight,
    borderRadius: 10, padding: spacing.sm,
    borderWidth: 1, borderColor: colors.error,
  },
  disclaimer: { textAlign: 'center', lineHeight: 18, marginBottom: spacing.md },
});

const secStyles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginTop: spacing.sm,
  },
  iconBox: {
    width: 20, height: 20, borderRadius: 5,
    backgroundColor: colors.headerBg,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.xs,
  },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 3 },
  label: { flex: 1 },
  value: { flex: 2, textAlign: 'right', flexWrap: 'wrap' },
});

const thumbStyles = StyleSheet.create({
  wrapper: { flex: 1, gap: spacing.xs },
  image: { width: '100%', height: 120, borderRadius: 10 },
  placeholder: {
    width: '100%', height: 120, borderRadius: 10,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { textAlign: 'center' },
});
