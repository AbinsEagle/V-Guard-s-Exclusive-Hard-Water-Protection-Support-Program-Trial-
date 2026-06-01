import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
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
import {
  WaterSource, WaterHardness, TempSetting, UsagePattern, ScaleRating,
} from '../../src/types';

const STEP_LABELS = ['Technician', 'Units', 'Consent', 'Customer', 'Photos', 'Review'];

const WATER_SOURCES: { label: string; value: WaterSource }[] = [
  { label: 'Borewell',              value: 'Borewell' },
  { label: 'Municipal / BWSSB',     value: 'Municipal / BWSSB' },
  { label: 'Open Well',             value: 'Open Well' },
  { label: 'River / Canal',         value: 'River / Canal' },
  { label: 'Rainwater Harvesting',  value: 'Rainwater Harvesting' },
  { label: 'Water Tanker',          value: 'Water Tanker' },
  { label: 'Mixed / Not Sure',      value: 'Mixed / Not Sure' },
  { label: 'Other',                 value: 'Other' },
];

const HARDNESS_OPTIONS: { label: string; value: WaterHardness }[] = [
  { label: '300–500',        value: '300-500' },
  { label: '500–1,000',      value: '500-1000' },
  { label: '1,000–2,000',    value: '1000-2000' },
  { label: '2,000–4,000',    value: '2000-4000' },
  { label: '> 4,000',        value: '>4000' },
];

const CAPACITY_OPTIONS = ['3L', '6L', '10L', '15L', '25L', '50L', 'Other'];

const WATTAGE_OPTIONS: { label: string; value: string }[] = [
  { label: '2 kW',   value: '2000' },
  { label: '3 kW',   value: '3000' },
  { label: '5.5 kW', value: '5500' },
];


const TEMP_OPTIONS: { label: string; value: TempSetting }[] = [
  { label: 'Low (<55°C)',       value: 'Low (<55°C)' },
  { label: 'Medium (55–65°C)', value: 'Medium (55-65°C)' },
  { label: 'High (>65°C)',     value: 'High (>65°C)' },
];

const USAGE_OPTIONS: { label: string; value: UsagePattern }[] = [
  { label: 'Morning',          value: 'Morning only' },
  { label: 'Evening',          value: 'Evening only' },
  { label: 'Morn + Eve',       value: 'Morning + Evening' },
  { label: 'All day',          value: 'All day' },
  { label: 'Seasonal',         value: 'Seasonal (winter only)' },
];

const SCALE_RATINGS = ['0', '1', '2', '3', '4', '5'];

interface Errors {
  customerName: string; customerWhatsApp: string; pincode: string;
  waterSource: string; waterHardnessEstimate: string; existingScaleVisualRating: string; waterQualityFeel: string;
  heaterModel: string; heaterCapacity: string; heaterWattage: string; heaterAgeYears: string; hotWaterTemperatureSetting: string;
  peoplePerDay: string; bathsPerDay: string; heaterUsagePattern: string;
}

export default function CustomerFormScreen() {
  const { data, update } = useInstallation();
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 380; // e.g. iPhone SE, older Android

  const [customerName,    setCustomerName]    = useState(data.customerName);
  const [whatsApp,        setWhatsApp]        = useState(data.customerWhatsApp);
  const [pincode,         setPincode]         = useState(data.pincode);
  const [waterSource,     setWaterSource]     = useState<WaterSource | ''>(data.waterSource);
  const [waterHardness,   setWaterHardness]   = useState<WaterHardness | ''>(data.waterHardnessEstimate);
  const [waterFeel,       setWaterFeel]       = useState(data.waterQualityFeel);
  const [heaterModel,     setHeaterModel]     = useState(data.heaterModel);
  const [heaterCapacity,  setHeaterCapacity]  = useState(data.heaterCapacity);
  const [capacityOther,   setCapacityOther]   = useState(
    data.heaterCapacity && !CAPACITY_OPTIONS.includes(data.heaterCapacity) ? data.heaterCapacity : ''
  );
  const [heaterWattage,   setHeaterWattage]   = useState(data.heaterWattage);
  const [heaterAge,       setHeaterAge]       = useState(data.heaterAgeYears || '');
  const [tempSetting,     setTempSetting]     = useState<TempSetting | ''>(data.hotWaterTemperatureSetting);
  const [peoplePerDay,    setPeoplePerDay]    = useState(data.peoplePerDay);
  const [bathsPerDay,     setBathsPerDay]     = useState(data.bathsPerDay);
  const [usagePattern,    setUsagePattern]    = useState<UsagePattern | ''>(data.heaterUsagePattern);
  const [scaleRating,     setScaleRating]     = useState<ScaleRating | ''>(data.existingScaleVisualRating);

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle');
  const [gpsLabel,  setGpsLabel]  = useState('');
  const [errors,    setErrors]    = useState<Errors>({
    customerName: '', customerWhatsApp: '', pincode: '',
    waterSource: '', waterHardnessEstimate: '', existingScaleVisualRating: '', waterQualityFeel: '',
    heaterModel: '', heaterCapacity: '', heaterWattage: '', heaterAgeYears: '', hotWaterTemperatureSetting: '',
    peoplePerDay: '', bathsPerDay: '', heaterUsagePattern: '',
  });

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
      const { latitude, longitude, accuracy } = loc.coords;
      update({ gpsLat: String(latitude), gpsLng: String(longitude), gpsAccuracyMeters: accuracy });
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setGpsLabel(`${place?.district || place?.city || ''}, ${place?.region || ''}`);
      setGpsStatus('done');
    } catch {
      setGpsStatus('error');
    }
  };

  // Resolve capacity value — chip label or custom text
  const resolvedCapacity = heaterCapacity === 'Other' ? capacityOther : heaterCapacity;

  const validate = (): boolean => {
    const e: Errors = {
      customerName: '', customerWhatsApp: '', pincode: '',
      waterSource: '', waterHardnessEstimate: '', existingScaleVisualRating: '', waterQualityFeel: '',
      heaterModel: '', heaterCapacity: '', heaterWattage: '', heaterAgeYears: '', hotWaterTemperatureSetting: '',
      peoplePerDay: '', bathsPerDay: '', heaterUsagePattern: '',
    };
    if (!customerName.trim()) e.customerName = 'Required';
    if (!whatsApp.trim()) e.customerWhatsApp = 'Required';
    else if (!/^[6-9]\d{9}$/.test(whatsApp.trim())) e.customerWhatsApp = 'Enter a valid 10-digit number';
    if (!pincode.trim()) e.pincode = 'Required';
    else if (!/^\d{6}$/.test(pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode';
    if (!waterSource) e.waterSource = 'Please select water source';
    if (!waterHardness) e.waterHardnessEstimate = 'Please select TDS range';
    if (scaleRating === '') e.existingScaleVisualRating = 'Please rate the scale condition (0–5)';
    if (!heaterModel.trim()) e.heaterModel = 'Required';
    if (!resolvedCapacity.trim()) e.heaterCapacity = 'Please select capacity';
    if (!heaterWattage) e.heaterWattage = 'Please select wattage';
    if (!heaterAge.trim()) e.heaterAgeYears = 'Required';
    if (!tempSetting) e.hotWaterTemperatureSetting = 'Please select thermostat setting';
    if (!peoplePerDay.trim()) e.peoplePerDay = 'Required';
    if (!bathsPerDay.trim()) e.bathsPerDay = 'Required';
    if (!usagePattern) e.heaterUsagePattern = 'Please select heater on time';
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleContinue = () => {
    if (!validate()) return;
    update({
      customerName:              customerName.trim(),
      customerWhatsApp:          whatsApp.trim(),
      pincode:                   pincode.trim(),
      waterSource:               waterSource as WaterSource,
      waterHardnessEstimate:     waterHardness as WaterHardness,
      waterQualityFeel:          waterFeel.trim(),
      heaterModel:               heaterModel.trim(),
      heaterCapacity:            resolvedCapacity.trim(),
      heaterWattage:             heaterWattage,
      heaterAgeYears:            heaterAge,
      hotWaterTemperatureSetting: tempSetting as TempSetting,
      peoplePerDay:              peoplePerDay.trim(),
      bathsPerDay:               bathsPerDay.trim(),
      heaterUsagePattern:        usagePattern as UsagePattern,
      existingScaleVisualRating: scaleRating as ScaleRating,
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

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Auto-captured pills ── */}
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
          <SectionHeader title="Customer" icon="person" />

          <Field label="Name" required error={errors.customerName}>
            <View style={[styles.inputBox, errors.customerName ? styles.inputErr : null]}>
              <TextInput
                style={styles.input} placeholder="Full name"
                placeholderTextColor={colors.textHint} value={customerName}
                onChangeText={(t) => { setCustomerName(t); setErrors((e) => ({ ...e, customerName: '' })); }}
                autoCapitalize="words"
              />
            </View>
          </Field>

          <Field label="WhatsApp Number" required error={errors.customerWhatsApp}>
            <View style={[styles.inputBox, errors.customerWhatsApp ? styles.inputErr : null]}>
              <AppText variant="body" color={colors.textSecondary} style={styles.prefix}>+91</AppText>
              <View style={styles.prefixDiv} />
              <TextInput
                style={styles.input} placeholder="10-digit number"
                placeholderTextColor={colors.textHint} value={whatsApp}
                onChangeText={(t) => { setWhatsApp(t.replace(/\D/g, '').slice(0, 10)); setErrors((e) => ({ ...e, customerWhatsApp: '' })); }}
                keyboardType="number-pad" maxLength={10}
              />
            </View>
          </Field>

          <Field label="Pincode" required error={errors.pincode}>
            <View style={[styles.inputBox, errors.pincode ? styles.inputErr : null]}>
              <TextInput
                style={styles.input} placeholder="6-digit pincode"
                placeholderTextColor={colors.textHint} value={pincode}
                onChangeText={(t) => { setPincode(t.replace(/\D/g, '').slice(0, 6)); setErrors((e) => ({ ...e, pincode: '' })); }}
                keyboardType="number-pad" maxLength={6}
              />
            </View>
          </Field>

          {/* ── Water Quality ── */}
          <SectionHeader title="Water Quality" icon="water" />

          <Field label="Water Source" required error={errors.waterSource}>
            <View style={styles.chipRow}>
              {WATER_SOURCES.map((s) => (
                <Chip
                  key={s.value} label={s.label}
                  selected={waterSource === s.value}
                  onPress={() => { setWaterSource(s.value); setErrors((e) => ({ ...e, waterSource: '' })); }}
                />
              ))}
            </View>
          </Field>

          <Field label="Water Hardness (TDS)" required error={errors.waterHardnessEstimate}>
            <View style={styles.chipRow}>
              {HARDNESS_OPTIONS.map((o) => (
                <Chip
                  key={o.value} label={o.label}
                  selected={waterHardness === o.value}
                  onPress={() => { setWaterHardness(o.value); setErrors((e) => ({ ...e, waterHardnessEstimate: '' })); }}
                />
              ))}
            </View>
          </Field>

          <Field label="Existing Scale Condition" required error={errors.existingScaleVisualRating}>
            <View style={styles.scaleRow}>
              <AppText variant="caption2" color={colors.textSecondary} style={styles.scaleEndLabel}>0 Clean</AppText>
              <View style={[styles.chipRow, { flex: 1 }]}>
                {SCALE_RATINGS.map((n) => (
                  <Chip
                    key={n} label={n}
                    selected={scaleRating === n}
                    onPress={() => { setScaleRating(n); setErrors((e) => ({ ...e, existingScaleVisualRating: '' })); }}
                  />
                ))}
              </View>
              <AppText variant="caption2" color={colors.textSecondary} style={styles.scaleEndLabel}>5 Worst</AppText>
            </View>
          </Field>

          <Field label="How does the water feel? (customer's words)" error={errors.waterQualityFeel}>
            <View style={[styles.inputBox, errors.waterQualityFeel ? styles.inputErr : null]}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="e.g. water feels hard, lots of deposits on taps..."
                placeholderTextColor={colors.textHint}
                value={waterFeel}
                onChangeText={(t) => { setWaterFeel(t); setErrors((e) => ({ ...e, waterQualityFeel: '' })); }}
                multiline numberOfLines={3} textAlignVertical="top"
              />
            </View>
          </Field>

          {/* ── Water Heater ── */}
          <SectionHeader title="Water Heater" icon="hardware-chip" />

          <Field label="Model" required error={errors.heaterModel}>
            <View style={[styles.inputBox, errors.heaterModel ? styles.inputErr : null]}>
              <TextInput
                style={styles.input} placeholder="e.g. Pebble Ivory 15L"
                placeholderTextColor={colors.textHint} value={heaterModel}
                onChangeText={(t) => { setHeaterModel(t); setErrors((e) => ({ ...e, heaterModel: '' })); }}
              />
            </View>
          </Field>

          <Field label="Capacity" required error={errors.heaterCapacity}>
            <View style={styles.chipRow}>
              {CAPACITY_OPTIONS.map((cap) => (
                <Chip
                  key={cap} label={cap}
                  selected={heaterCapacity === cap}
                  onPress={() => { setHeaterCapacity(cap); setErrors((e) => ({ ...e, heaterCapacity: '' })); }}
                />
              ))}
            </View>
            {heaterCapacity === 'Other' && (
              <View style={[styles.inputBox, { marginTop: spacing.sm }]}>
                <TextInput
                  style={styles.input} placeholder="Enter capacity (e.g. 35L)"
                  placeholderTextColor={colors.textHint} value={capacityOther}
                  onChangeText={setCapacityOther} autoFocus
                />
              </View>
            )}
          </Field>

          <Field label="Wattage" required error={errors.heaterWattage}>
            <View style={styles.chipRow}>
              {WATTAGE_OPTIONS.map((o) => (
                <Chip
                  key={o.value} label={o.label}
                  selected={heaterWattage === o.value}
                  onPress={() => { setHeaterWattage(o.value); setErrors((e) => ({ ...e, heaterWattage: '' })); }}
                />
              ))}
            </View>
          </Field>

          <Field label="Water Heater Age (years)" required error={errors.heaterAgeYears}>
            <View style={[styles.inputBox, errors.heaterAgeYears ? styles.inputErr : null, { width: isSmall ? 88 : 108, alignSelf: 'flex-start' }]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 3"
                placeholderTextColor={colors.textHint}
                value={heaterAge}
                onChangeText={(t) => { setHeaterAge(t.replace(/\D/g, '').slice(0, 2)); setErrors((e) => ({ ...e, heaterAgeYears: '' })); }}
                keyboardType="number-pad"
                maxLength={2}
              />
              <AppText variant="caption2" color={colors.textHint}>yrs</AppText>
            </View>
          </Field>

          <Field label="Thermostat Setting" required error={errors.hotWaterTemperatureSetting}>
            <View style={styles.chipRow}>
              {TEMP_OPTIONS.map((o) => (
                <Chip key={o.value} label={o.label} selected={tempSetting === o.value} onPress={() => { setTempSetting(o.value); setErrors((e) => ({ ...e, hotWaterTemperatureSetting: '' })); }} />
              ))}
            </View>
          </Field>

          {/* ── Daily Usage ── */}
          <SectionHeader title="Daily Usage" icon="time" />

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Field label="People / day" required error={errors.peoplePerDay}>
                <View style={[styles.inputBox, errors.peoplePerDay ? styles.inputErr : null]}>
                  <TextInput
                    style={styles.input} placeholder="e.g. 4"
                    placeholderTextColor={colors.textHint} value={peoplePerDay}
                    onChangeText={(t) => { setPeoplePerDay(t.replace(/\D/g, '')); setErrors((e) => ({ ...e, peoplePerDay: '' })); }}
                    keyboardType="number-pad"
                  />
                  <AppText variant="caption2" color={colors.textHint}>ppl</AppText>
                </View>
              </Field>
            </View>
            <View style={styles.halfField}>
              <Field label="Avg baths / person / day" required error={errors.bathsPerDay}>
                <View style={[styles.inputBox, errors.bathsPerDay ? styles.inputErr : null]}>
                  <TextInput
                    style={styles.input} placeholder="e.g. 2"
                    placeholderTextColor={colors.textHint} value={bathsPerDay}
                    onChangeText={(t) => { setBathsPerDay(t.replace(/\D/g, '')); setErrors((e) => ({ ...e, bathsPerDay: '' })); }}
                    keyboardType="number-pad"
                  />
                  <AppText variant="caption2" color={colors.textHint}>×</AppText>
                </View>
              </Field>
            </View>
          </View>

          <Field label="Heater On Time" required error={errors.heaterUsagePattern}>
            <View style={styles.chipRow}>
              {USAGE_OPTIONS.map((o) => (
                <Chip
                  key={o.value} label={o.label}
                  selected={usagePattern === o.value}
                  onPress={() => { setUsagePattern(o.value); setErrors((e) => ({ ...e, heaterUsagePattern: '' })); }}
                />
              ))}
            </View>
          </Field>

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

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, selected && chipStyles.selected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <AppText
        variant="caption"
        color={selected ? colors.headerBg : colors.textSecondary}
        style={selected ? chipStyles.selectedText : undefined}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(196,122,0,0.25)',
  },
  autoPillError: { backgroundColor: colors.errorLight, borderColor: colors.error },
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
  input: { flex: 1, fontSize: 16, color: colors.textPrimary, paddingVertical: spacing.sm },
  multilineInput: { minHeight: 72, paddingTop: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rowFields: { flexDirection: 'row', gap: spacing.sm },
  halfField: { flex: 1, minWidth: 0 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  scaleEndLabel: { fontWeight: '600', minWidth: 36, textAlign: 'center' },
  primaryBtn: {
    flexDirection: 'row', backgroundColor: colors.primary,
    borderRadius: 14, paddingVertical: spacing.md,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
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
  wrapper: { marginBottom: spacing.xs },
  label: { marginBottom: spacing.xs },
  error: { marginTop: 4 },
});

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryFaint },
  selectedText: { fontWeight: '600' },
});

