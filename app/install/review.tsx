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

const STEP_LABELS = ['Technician', 'Units', 'Customer', 'Photos', 'Review'];

export default function ReviewScreen() {
  const { data } = useInstallation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    // TODO Sprint 2: Replace with real SharePoint submission
    await new Promise((r) => setTimeout(r, 1800));
    console.log('Installation data to submit:', JSON.stringify(data, null, 2));
    setSubmitting(false);
    router.replace('/install/success');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={submitting}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>Review & Submit</AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={5} totalSteps={5} labels={STEP_LABELS} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Linked Units */}
        <Section title="Linked Units" icon="link">
          <Row label="Heater Serial No." value={data.heaterSerialNumber} />
          <Row label="Cartridge No." value={data.cartridgeNumber} />
          {data.cartridgeBatchCode ? <Row label="Batch Code" value={data.cartridgeBatchCode} /> : null}
          <Row label="Sample Collected" value={data.waterSampleCollected ? 'Yes' : 'No'} />
        </Section>

        {/* Technician */}
        <Section title="Service Person" icon="person-circle">
          <Row label="Name" value={data.technicianName} />
          <Row label="Mobile" value={`+91 ${data.technicianPhone}`} />
        </Section>

        {/* Customer */}
        <Section title="Customer Details" icon="home">
          <Row label="WhatsApp" value={`+91 ${data.customerWhatsApp}`} />
          <Row label="Pincode" value={data.pincode} />
          <Row label="Water Source" value={data.waterSource} />
          {data.waterHardnessEstimate ? <Row label="Hardness Estimate" value={`${data.waterHardnessEstimate} ppm`} /> : null}
          <Row label="GPS" value={data.gpsLat ? `${parseFloat(data.gpsLat).toFixed(4)}, ${parseFloat(data.gpsLng).toFixed(4)}` : 'Not captured'} />
          <Row label="Date" value={new Date(data.installationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
          {data.waterQualityFeel ? <Row label="Water Feel" value={data.waterQualityFeel} /> : null}
        </Section>

        {/* Heater Specs */}
        <Section title="Heater Specifications" icon="hardware-chip">
          <Row label="Model" value={data.heaterModel} />
          <Row label="Capacity" value={`${data.heaterCapacity} L`} />
          <Row label="Wattage" value={`${data.heaterWattage} W`} />
          {data.heaterAgeYears ? <Row label="Age" value={data.heaterAgeYears} /> : null}
          {data.hotWaterTemperatureSetting ? <Row label="Thermostat" value={data.hotWaterTemperatureSetting} /> : null}
        </Section>

        {/* Usage */}
        <Section title="Daily Usage" icon="time">
          <Row label="People/day" value={data.peoplePerDay} />
          <Row label="Baths/day" value={data.bathsPerDay} />
          {data.heaterUsagePattern ? <Row label="Usage Pattern" value={data.heaterUsagePattern} /> : null}
          {data.existingScaleVisualRating ? <Row label="Existing Scale" value={data.existingScaleVisualRating} /> : null}
          {data.additionalComments ? <Row label="Comments" value={data.additionalComments} /> : null}
        </Section>

        {/* Photos */}
        <Section title="Photos" icon="camera">
          <View style={styles.photosRow}>
            <PhotoThumb label="Front View" uri={data.frontPhotoUri} />
            <PhotoThumb label="Side View" uri={data.sidePhotoUri} />
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

        <AppText variant="caption" color={colors.textSecondary} style={styles.disclaimer}>
          By submitting, you confirm that all details are accurate and the anti-scalant unit has been properly installed.
        </AppText>

      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, icon, children }: {
  title: string; icon: string; children: React.ReactNode;
}) {
  return (
    <View style={secStyles.wrapper}>
      <View style={secStyles.titleRow}>
        <View style={secStyles.iconBox}>
          <Ionicons name={icon as any} size={12} color={colors.white} />
        </View>
        <AppText variant="sectionTitle" color={colors.textSecondary}>{title}</AppText>
      </View>
      <View style={secStyles.card}>{children}</View>
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
    padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm,
  },
  photosRow: { flexDirection: 'row', gap: spacing.md },
  submitBtn: {
    flexDirection: 'row', backgroundColor: colors.success,
    borderRadius: 14, paddingVertical: spacing.md + 2,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
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
