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
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../src/components/common/AppText';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { useInstallation } from '../../src/store/installationStore';
import { colors, spacing, radius } from '../../src/theme';
import { WaterSource } from '../../src/types';

const STEP_LABELS = ['Technician', 'Heater', 'Cartridge', 'Customer', 'Photos', 'Review'];

const WATER_SOURCES: { label: string; value: WaterSource }[] = [
  { label: 'Borewell', value: 'Borewell' },
  { label: 'Municipal', value: 'Municipal' },
  { label: 'Tank', value: 'Tank' },
  { label: 'Other', value: 'Other' },
];

interface Errors {
  customerWhatsApp: string;
  pincode: string;
  waterSource: string;
  heaterModel: string;
  heaterCapacity: string;
  heaterWattage: string;
  peoplePerDay: string;
  bathsPerDay: string;
}

export default function CustomerFormScreen() {
  const { data, update } = useInstallation();

  const [whatsApp, setWhatsApp] = useState(data.customerWhatsApp);
  const [pincode, setPincode] = useState(data.pincode);
  const [waterSource, setWaterSource] = useState<WaterSource | ''>(data.waterSource);
  const [waterFeel, setWaterFeel] = useState(data.waterQualityFeel);
  const [heaterModel, setHeaterModel] = useState(data.heaterModel);
  const [heaterCapacity, setHeaterCapacity] = useState(data.heaterCapacity);
  const [heaterWattage, setHeaterWattage] = useState(data.heaterWattage);
  const [peoplePerDay, setPeoplePerDay] = useState(data.peoplePerDay);
  const [bathsPerDay, setBathsPerDay] = useState(data.bathsPerDay);
  const [comments, setComments] = useState(data.additionalComments);

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle');
  const [gpsLabel, setGpsLabel] = useState('');
  const [errors, setErrors] = useState<Errors>({
    customerWhatsApp: '', pincode: '', waterSource: '',
    heaterModel: '', heaterCapacity: '', heaterWattage: '',
    peoplePerDay: '', bathsPerDay: '',
  });

  // Auto-capture date on mount
  useEffect(() => {
    update({ installationDate: new Date().toISOString() });
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setGpsStatus('fetching');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setGpsStatus('error'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      update({ gpsLat: String(latitude), gpsLng: String(longitude) });
      // Reverse geocode for display
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setGpsLabel(`${place?.district || place?.city || ''}, ${place?.region || ''}`);
      setGpsStatus('done');
    } catch {
      setGpsStatus('error');
    }
  };

  const validate = (): boolean => {
    const e: Errors = {
      customerWhatsApp: '', pincode: '', waterSource: '',
      heaterModel: '', heaterCapacity: '', heaterWattage: '',
      peoplePerDay: '', bathsPerDay: '',
    };
    if (!whatsApp.trim()) e.customerWhatsApp = 'WhatsApp number is required';
    else if (!/^[6-9]\d{9}$/.test(whatsApp.trim())) e.customerWhatsApp = 'Enter a valid 10-digit number';
    if (!pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode';
    if (!waterSource) e.waterSource = 'Please select water source';
    if (!heaterModel.trim()) e.heaterModel = 'Heater model is required';
    if (!heaterCapacity.trim()) e.heaterCapacity = 'Capacity is required';
    if (!heaterWattage.trim()) e.heaterWattage = 'Wattage is required';
    if (!peoplePerDay.trim()) e.peoplePerDay = 'Required';
    if (!bathsPerDay.trim()) e.bathsPerDay = 'Required';
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleContinue = () => {
    if (!validate()) return;
    update({
      customerWhatsApp: whatsApp.trim(),
      pincode: pincode.trim(),
      waterSource: waterSource as WaterSource,
      waterQualityFeel: waterFeel.trim(),
      heaterModel: heaterModel.trim(),
      heaterCapacity: heaterCapacity.trim(),
      heaterWattage: heaterWattage.trim(),
      peoplePerDay: peoplePerDay.trim(),
      bathsPerDay: bathsPerDay.trim(),
      additionalComments: comments.trim(),
    });
    router.push('/install/photos');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>Customer Details</AppText>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator currentStep={4} totalSteps={6} labels={STEP_LABELS} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Auto-captured ── */}
          <View style={styles.autoPillRow}>
            <View style={styles.autoPill}>
              <Ionicons name="calendar-outline" size={13} color={colors.primaryDark} />
              <AppText variant="caption2" color={colors.primaryDark} style={styles.autoPillText}>
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </AppText>
            </View>
            <TouchableOpacity
              style={[styles.autoPill, gpsStatus === 'error' && styles.autoPillError]}
              onPress={gpsStatus === 'error' ? fetchLocation : undefined}
              activeOpacity={gpsStatus === 'error' ? 0.7 : 1}
            >
              <Ionicons
                name={gpsStatus === 'done' ? 'location' : 'location-outline'}
                size={13}
                color={gpsStatus === 'error' ? colors.error : colors.primaryDark}
              />
              <AppText
                variant="caption2"
                color={gpsStatus === 'error' ? colors.error : colors.primaryDark}
                style={styles.autoPillText}
              >
                {gpsStatus === 'fetching' ? 'Getting GPS…' :
                 gpsStatus === 'done'     ? (gpsLabel || 'GPS Captured') :
                 gpsStatus === 'error'    ? 'Tap to retry' : 'GPS pending'}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* ── Customer ── */}
          <SectionHeader title="Customer Information" icon="person" />

          <Field label="WhatsApp Number" required error={errors.customerWhatsApp}>
            <View style={[styles.inputBox, errors.customerWhatsApp ? styles.inputErr : null]}>
              <AppText variant="body" color={colors.textSecondary} style={styles.prefix}>+91</AppText>
              <View style={styles.prefixDiv} />
              <TextInput
                style={styles.input}
                placeholder="10-digit number"
                placeholderTextColor={colors.textHint}
                value={whatsApp}
                onChangeText={(t) => { setWhatsApp(t.replace(/\D/g, '').slice(0, 10)); setErrors((e) => ({ ...e, customerWhatsApp: '' })); }}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
          </Field>

          <Field label="Pincode" required error={errors.pincode}>
            <View style={[styles.inputBox, errors.pincode ? styles.inputErr : null]}>
              <TextInput
                style={styles.input}
                placeholder="6-digit area pincode"
                placeholderTextColor={colors.textHint}
                value={pincode}
                onChangeText={(t) => { setPincode(t.replace(/\D/g, '').slice(0, 6)); setErrors((e) => ({ ...e, pincode: '' })); }}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </Field>

          <Field label="Water Source" required error={errors.waterSource}>
            <View style={styles.chipRow}>
              {WATER_SOURCES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.chip, waterSource === s.value && styles.chipSelected]}
                  onPress={() => { setWaterSource(s.value); setErrors((e) => ({ ...e, waterSource: '' })); }}
                  activeOpacity={0.75}
                >
                  <AppText
                    variant="caption"
                    color={waterSource === s.value ? colors.headerBg : colors.textSecondary}
                    style={waterSource === s.value ? styles.chipTextSelected : undefined}
                  >
                    {s.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="How does the water feel? (Customer's words)">
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="e.g. water feels hard, lots of deposits on taps..."
                placeholderTextColor={colors.textHint}
                value={waterFeel}
                onChangeText={setWaterFeel}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </Field>

          {/* ── Heater Specs ── */}
          <SectionHeader title="Water Heater Specifications" icon="hardware-chip" />

          <Field label="Heater Model" required error={errors.heaterModel}>
            <View style={[styles.inputBox, errors.heaterModel ? styles.inputErr : null]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Pebble Ivory 15L"
                placeholderTextColor={colors.textHint}
                value={heaterModel}
                onChangeText={(t) => { setHeaterModel(t); setErrors((e) => ({ ...e, heaterModel: '' })); }}
              />
            </View>
          </Field>

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Field label="Capacity (L)" required error={errors.heaterCapacity}>
                <View style={[styles.inputBox, errors.heaterCapacity ? styles.inputErr : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 15"
                    placeholderTextColor={colors.textHint}
                    value={heaterCapacity}
                    onChangeText={(t) => { setHeaterCapacity(t.replace(/\D/g, '')); setErrors((e) => ({ ...e, heaterCapacity: '' })); }}
                    keyboardType="number-pad"
                  />
                  <AppText variant="caption" color={colors.textHint}>L</AppText>
                </View>
              </Field>
            </View>
            <View style={styles.halfField}>
              <Field label="Wattage (W)" required error={errors.heaterWattage}>
                <View style={[styles.inputBox, errors.heaterWattage ? styles.inputErr : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2000"
                    placeholderTextColor={colors.textHint}
                    value={heaterWattage}
                    onChangeText={(t) => { setHeaterWattage(t.replace(/\D/g, '')); setErrors((e) => ({ ...e, heaterWattage: '' })); }}
                    keyboardType="number-pad"
                  />
                  <AppText variant="caption" color={colors.textHint}>W</AppText>
                </View>
              </Field>
            </View>
          </View>

          {/* ── Usage ── */}
          <SectionHeader title="Daily Usage" icon="time" />

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Field label="People using heater" required error={errors.peoplePerDay}>
                <View style={[styles.inputBox, errors.peoplePerDay ? styles.inputErr : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 4"
                    placeholderTextColor={colors.textHint}
                    value={peoplePerDay}
                    onChangeText={(t) => { setPeoplePerDay(t.replace(/\D/g, '')); setErrors((e) => ({ ...e, peoplePerDay: '' })); }}
                    keyboardType="number-pad"
                  />
                  <AppText variant="caption" color={colors.textHint}>persons</AppText>
                </View>
              </Field>
            </View>
            <View style={styles.halfField}>
              <Field label="Total baths/day" required error={errors.bathsPerDay}>
                <View style={[styles.inputBox, errors.bathsPerDay ? styles.inputErr : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    placeholderTextColor={colors.textHint}
                    value={bathsPerDay}
                    onChangeText={(t) => { setBathsPerDay(t.replace(/\D/g, '')); setErrors((e) => ({ ...e, bathsPerDay: '' })); }}
                    keyboardType="number-pad"
                  />
                  <AppText variant="caption" color={colors.textHint}>baths</AppText>
                </View>
              </Field>
            </View>
          </View>

          {/* ── Comments ── */}
          <SectionHeader title="Additional Comments" icon="chatbubble-ellipses" />
          <View style={styles.inputBox}>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Any other observations or notes..."
              placeholderTextColor={colors.textHint}
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* ── CTA ── */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
            <AppText variant="label" color={colors.headerBg}>Continue to Photos</AppText>
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
    <View style={sectionStyles.row}>
      <View style={sectionStyles.iconBox}>
        <Ionicons name={icon as any} size={14} color={colors.white} />
      </View>
      <AppText variant="sectionTitle" color={colors.textPrimary}>{title}</AppText>
    </View>
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <AppText variant="label" style={fieldStyles.label}>
        {label}{required && <AppText variant="label" color={colors.error}> *</AppText>}
      </AppText>
      {children}
      {error ? <AppText variant="caption" color={colors.error} style={fieldStyles.error}>{error}</AppText> : null}
    </View>
  );
}



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
  autoPillRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  autoPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1, borderColor: 'rgba(196,122,0,0.25)',
  },
  autoPillError: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  autoPillText: { fontWeight: '600' },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 12, backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, minHeight: 48,
  },
  inputErr: { borderColor: colors.error },
  prefix: { marginRight: spacing.xs },
  prefixDiv: { width: 1, height: 20, backgroundColor: colors.border, marginRight: spacing.sm },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: spacing.sm },
  multilineInput: { minHeight: 72, paddingTop: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryFaint },
  chipTextSelected: { fontWeight: '600' },
  rowFields: { flexDirection: 'row', gap: spacing.sm },
  halfField: { flex: 1 },
  primaryBtn: {
    flexDirection: 'row', backgroundColor: colors.primary,
    borderRadius: 14, paddingVertical: spacing.md,
    alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.md,
  },
  btnArrow: {
    marginLeft: spacing.md,
    backgroundColor: colors.primaryDark,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
});

const sectionStyles = StyleSheet.create({
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
  wrapper: { marginBottom: spacing.sm },
  label: { marginBottom: spacing.xs },
  error: { marginTop: 4 },
});

