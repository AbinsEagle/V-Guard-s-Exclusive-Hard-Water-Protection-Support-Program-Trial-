import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppText } from '../src/components/common/AppText';
import { useInstallation } from '../src/store/installationStore';
import { colors, spacing, radius } from '../src/theme';
import { buildPayload } from '../src/services/submission';
import endpoints from '../config/microsoft-endpoints.json';
import {
  WaterSource, WaterHardness, TempSetting, UsagePattern, ScaleRating,
} from '../src/types';

type Tab = 'JSON' | 'TABLE' | 'EDIT' | 'CONFIG';

// ─── Config constants ─────────────────────────────────────────────────────────
const GITHUB_OWNER  = 'abinseagle';
const GITHUB_REPO   = 'v-guard-s-exclusive-hard-water-protection-support-program-trial-';
const GITHUB_BRANCH = 'claude/modular-mobile-app-setup-T39Hd';
const CONFIG_PATH   = 'config/microsoft-endpoints.json';
const TOKEN_KEY     = '@vguard_github_token';

// ─── Option arrays (mirrors customer-form) ───────────────────────────────────
const WATER_SOURCES: WaterSource[] = [
  'Borewell', 'Municipal / BWSSB', 'Open Well', 'River / Canal',
  'Rainwater Harvesting', 'Water Tanker', 'Mixed / Not Sure', 'Other',
];
const HARDNESS_OPTS: { label: string; value: WaterHardness }[] = [
  { label: '300–500',     value: '300-500' },
  { label: '500–1,000',   value: '500-1000' },
  { label: '1,000–2,000', value: '1000-2000' },
  { label: '2,000–4,000', value: '2000-4000' },
  { label: '> 4,000',     value: '>4000' },
];
const TEMP_OPTS: { label: string; value: TempSetting }[] = [
  { label: 'Low',    value: 'Low (<55°C)' },
  { label: 'Medium', value: 'Medium (55-65°C)' },
  { label: 'High',   value: 'High (>65°C)' },
];
const USAGE_OPTS: { label: string; value: UsagePattern }[] = [
  { label: 'Morning',    value: 'Morning only' },
  { label: 'Evening',    value: 'Evening only' },
  { label: 'Morn+Eve',   value: 'Morning + Evening' },
  { label: 'All day',    value: 'All day' },
  { label: 'Seasonal',   value: 'Seasonal (winter only)' },
];
const SCALE_OPTS = ['0', '1', '2', '3', '4', '5'];

export default function DevScreen() {
  const { data, update } = useInstallation();
  const [tab, setTab] = useState<Tab>('JSON');

  // JSON tab
  const [showExportInput, setShowExportInput] = useState(false);
  const [exportPass,      setExportPass]      = useState('');
  const [copied,          setCopied]          = useState(false);

  // EDIT tab
  const [savedFlash, setSavedFlash] = useState(false);

  // CONFIG tab
  const [ghToken,    setGhToken]    = useState('');
  const [webhookUrl, setWebhookUrl] = useState((endpoints as any).powerAutomate?.installationWebhookUrl ?? '');
  const [notifEmail, setNotifEmail] = useState((endpoints as any).notification?.notificationEmail ?? '');
  const [spSiteUrl,  setSpSiteUrl]  = useState((endpoints as any).sharePoint?.siteUrl ?? '');
  const [pushStatus, setPushStatus] = useState<'idle' | 'pushing' | 'ok' | 'err'>('idle');
  const [pushMsg,    setPushMsg]    = useState('');

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then((t) => { if (t) setGhToken(t); });
  }, []);

  // ── JSON helpers ──────────────────────────────────────────────────────────
  const previewPayload = buildPayload(data, { front: null, side: null, scale: null });
  // Elide photos in preview
  const previewJson = JSON.stringify(
    { ...previewPayload, photos: { front: '[photo]', side: '[photo]', scale: '[photo]' } },
    null, 2,
  );

  const handleCopy = async () => {
    await Clipboard.setStringAsync(previewJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (exportPass !== 'vguard') {
      Alert.alert('', 'Wrong password');
      setExportPass('');
      return;
    }
    setShowExportInput(false);
    setExportPass('');

    async function toBase64(uri: string | null): Promise<string | null> {
      if (!uri) return null;
      try {
        if (Platform.OS === 'web') {
          const res = await fetch(uri);
          const buf = await res.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let bin = '';
          bytes.forEach((b) => { bin += String.fromCharCode(b); });
          return btoa(bin);
        }
        return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      } catch { return null; }
    }

    const [front, side, scale] = await Promise.all([
      toBase64(data.frontPhotoUri),
      toBase64(data.sidePhotoUri),
      toBase64(data.scalePhotoUri),
    ]);
    const full = buildPayload(data, { front, side, scale });
    const json = JSON.stringify(full, null, 2);
    const filename = `installation_${data.heaterSerialNumber || 'draft'}.json`;

    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } else {
      Share.share({ message: json, title: filename });
    }
  };

  // ── EDIT save flash ───────────────────────────────────────────────────────
  const flashSaved = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const editUpdate = useCallback((patch: Parameters<typeof update>[0]) => {
    update(patch);
    flashSaved();
  }, [update]);

  // ── CONFIG push ───────────────────────────────────────────────────────────
  const handlePushConfig = async () => {
    if (!ghToken.trim()) { Alert.alert('', 'Enter your GitHub Personal Access Token first'); return; }

    setPushStatus('pushing');
    setPushMsg('');

    try {
      await AsyncStorage.setItem(TOKEN_KEY, ghToken.trim());

      // 1. Get current file SHA
      const metaRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONFIG_PATH}?ref=${GITHUB_BRANCH}`,
        { headers: { Authorization: `Bearer ${ghToken.trim()}`, Accept: 'application/vnd.github+json' } },
      );
      if (!metaRes.ok) throw new Error(`Could not fetch file: HTTP ${metaRes.status}`);
      const meta = await metaRes.json();
      const sha  = meta.sha;

      // 2. Build updated config
      const current = JSON.parse(atob(meta.content.replace(/\n/g, '')));
      current.powerAutomate = { ...current.powerAutomate, installationWebhookUrl: webhookUrl.trim() };
      current.notification  = { ...current.notification,  notificationEmail: notifEmail.trim() };
      current.sharePoint    = { ...current.sharePoint,    siteUrl: spSiteUrl.trim() };
      const newContent      = btoa(unescape(encodeURIComponent(JSON.stringify(current, null, 2))));

      // 3. Commit
      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONFIG_PATH}`,
        {
          method:  'PUT',
          headers: { Authorization: `Bearer ${ghToken.trim()}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
          body: JSON.stringify({
            message: `chore: update endpoints config from dev screen`,
            content: newContent,
            sha,
            branch: GITHUB_BRANCH,
          }),
        },
      );
      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message ?? `HTTP ${putRes.status}`);
      }
      setPushStatus('ok');
      setPushMsg('Pushed to GitHub. All devices will get the update on next build.');
    } catch (err: any) {
      setPushStatus('err');
      setPushMsg(err?.message ?? 'Unknown error');
    }
  };

  // ── TABLE rows ────────────────────────────────────────────────────────────
  const TABLE_SECTIONS = [
    {
      title: 'Technician',
      rows: [
        { k: 'Name',   v: data.technicianName },
        { k: 'Phone',  v: data.technicianPhone },
      ],
    },
    {
      title: 'Units',
      rows: [
        { k: 'Heater S/N',  v: data.heaterSerialNumber },
        { k: 'Cartridge',   v: data.cartridgeNumber },
        { k: 'Batch Code',  v: data.cartridgeBatchCode },
        { k: 'Sample',      v: data.waterSampleCollected ? 'Yes' : 'No' },
      ],
    },
    {
      title: 'Customer',
      rows: [
        { k: 'Name',        v: data.customerName },
        { k: 'WhatsApp',    v: `+91 ${data.customerWhatsApp}` },
        { k: 'Pincode',     v: data.pincode },
        { k: 'Water Source',v: data.waterSource },
        { k: 'TDS Range',   v: data.waterHardnessEstimate ? `${data.waterHardnessEstimate} ppm` : '' },
        { k: 'Water Feel',  v: data.waterQualityFeel },
        { k: 'GPS',         v: data.gpsLat ? `${parseFloat(data.gpsLat).toFixed(5)}, ${parseFloat(data.gpsLng).toFixed(5)}` : '' },
        { k: 'GPS Accuracy',v: data.gpsAccuracyMeters ? `${Math.round(data.gpsAccuracyMeters)}m` : '' },
        { k: 'Date',        v: data.installationDate ? new Date(data.installationDate).toLocaleDateString('en-IN') : '' },
      ],
    },
    {
      title: 'Heater',
      rows: [
        { k: 'Model',       v: data.heaterModel },
        { k: 'Capacity',    v: data.heaterCapacity },
        { k: 'Wattage',     v: data.heaterWattage ? `${parseInt(data.heaterWattage) / 1000} kW` : '' },
        { k: 'Age',         v: data.heaterAgeYears },
        { k: 'Thermostat',  v: data.hotWaterTemperatureSetting },
        { k: 'Scale',       v: data.existingScaleVisualRating },
        { k: 'People/day',  v: data.peoplePerDay },
        { k: 'Baths/person',v: data.bathsPerDay },
        { k: 'Heater On',   v: data.heaterUsagePattern },
      ],
    },
    {
      title: 'Photos',
      rows: [
        { k: 'Front', v: data.frontPhotoUri },
        { k: 'Side',  v: data.sidePhotoUri },
        { k: 'Scale', v: data.scalePhotoUri },
      ],
      isPhoto: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <AppText variant="h3" color={colors.white}>Developer View</AppText>
        <View style={{ width: 38 }} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['JSON', 'TABLE', 'EDIT', 'CONFIG'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <AppText
              variant="caption"
              color={tab === t ? colors.headerBg : colors.textSecondary}
              style={tab === t ? styles.tabTextActive : undefined}
            >
              {t}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── JSON tab ─────────────────────────────────────────────────────────── */}
      {tab === 'JSON' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.jsonBody}>
          <View style={styles.jsonToolbar}>
            <TouchableOpacity style={styles.toolbarBtn} onPress={handleCopy}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? colors.success : colors.primary} />
              <AppText variant="caption" color={copied ? colors.success : colors.primary}>
                {copied ? 'Copied!' : 'Copy'}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => setShowExportInput((v) => !v)}
            >
              <Ionicons name="download-outline" size={16} color={colors.primary} />
              <AppText variant="caption" color={colors.primary}>Export</AppText>
            </TouchableOpacity>
          </View>

          {showExportInput && (
            <View style={styles.exportRow}>
              <TextInput
                style={styles.exportInput}
                value={exportPass}
                onChangeText={setExportPass}
                placeholder="password"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleExport}
                autoFocus
                placeholderTextColor={colors.textHint}
              />
              <TouchableOpacity style={styles.exportGo} onPress={handleExport}>
                <AppText variant="caption" color={colors.white}>Go</AppText>
              </TouchableOpacity>
            </View>
          )}

          <AppText style={styles.jsonText} selectable>
            {previewJson}
          </AppText>
        </ScrollView>
      )}

      {/* ── TABLE tab ────────────────────────────────────────────────────────── */}
      {tab === 'TABLE' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tableBody}>
          {TABLE_SECTIONS.map((sec) => (
            <View key={sec.title} style={styles.tableSection}>
              <View style={styles.tableSectionHeader}>
                <AppText variant="sectionTitle" color={colors.textSecondary}>{sec.title}</AppText>
              </View>
              {sec.rows.map((row) => (
                <View key={row.k} style={styles.tableRow}>
                  <AppText style={styles.tableKey}>{row.k}</AppText>
                  {sec.isPhoto && row.v ? (
                    <Image source={{ uri: row.v as string }} style={styles.tableThumb} resizeMode="cover" />
                  ) : (
                    <AppText style={styles.tableVal} numberOfLines={2}>{row.v || '—'}</AppText>
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── EDIT tab ─────────────────────────────────────────────────────────── */}
      {tab === 'EDIT' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.editBody}>
          {savedFlash && (
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <AppText variant="caption" color={colors.success}>Saved</AppText>
            </View>
          )}

          <EditSection title="Water Source">
            <ChipRow
              options={WATER_SOURCES.map((v) => ({ label: v, value: v }))}
              value={data.waterSource}
              onSelect={(v) => editUpdate({ waterSource: v as WaterSource })}
            />
          </EditSection>

          <EditSection title="Water Hardness (TDS)">
            <ChipRow
              options={HARDNESS_OPTS}
              value={data.waterHardnessEstimate}
              onSelect={(v) => editUpdate({ waterHardnessEstimate: v as WaterHardness })}
            />
          </EditSection>

          <EditSection title="Heater Age (years)">
            <TextInput
              style={styles.editTextInput}
              value={data.heaterAgeYears || ''}
              onChangeText={(t) => editUpdate({ heaterAgeYears: t.replace(/\D/g, '').slice(0, 2) })}
              keyboardType="number-pad"
              placeholder="e.g. 3"
              placeholderTextColor={colors.textHint}
              maxLength={2}
            />
          </EditSection>

          <EditSection title="Thermostat Setting">
            <ChipRow
              options={TEMP_OPTS}
              value={data.hotWaterTemperatureSetting}
              onSelect={(v) => editUpdate({ hotWaterTemperatureSetting: v as TempSetting })}
            />
          </EditSection>

          <EditSection title="Heater On Time">
            <ChipRow
              options={USAGE_OPTS}
              value={data.heaterUsagePattern}
              onSelect={(v) => editUpdate({ heaterUsagePattern: v as UsagePattern })}
            />
          </EditSection>

          <EditSection title="Scale Condition (0 = Clean, 5 = Worst)">
            <ChipRow
              options={SCALE_OPTS.map((v) => ({ label: v, value: v }))}
              value={data.existingScaleVisualRating}
              onSelect={(v) => editUpdate({ existingScaleVisualRating: v as ScaleRating })}
            />
          </EditSection>

          <EditSection title="Water Sample Collected">
            <ChipRow
              options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
              value={data.waterSampleCollected ? 'yes' : 'no'}
              onSelect={(v) => editUpdate({ waterSampleCollected: v === 'yes' })}
            />
          </EditSection>

          <EditSection title="Batch Code">
            <TextInput
              style={styles.editTextInput}
              value={data.cartridgeBatchCode}
              onChangeText={(t) => editUpdate({ cartridgeBatchCode: t.toUpperCase() })}
              placeholder="e.g. B2024-07"
              placeholderTextColor={colors.textHint}
              autoCapitalize="characters"
            />
          </EditSection>
        </ScrollView>
      )}

      {/* ── CONFIG tab ───────────────────────────────────────────────────────── */}
      {tab === 'CONFIG' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.configBody}>
          <AppText variant="caption" color={colors.textSecondary} style={styles.configNote}>
            Changes are committed to GitHub and applied to all devices on the next app build.
          </AppText>

          <ConfigField label="GitHub Personal Access Token" sensitive>
            <TextInput
              style={styles.configInput}
              value={ghToken}
              onChangeText={setGhToken}
              placeholder="ghp_xxxxxxxxxxxx"
              placeholderTextColor={colors.textHint}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ConfigField>

          <ConfigField label="Power Automate Webhook URL">
            <TextInput
              style={[styles.configInput, styles.configInputMulti]}
              value={webhookUrl}
              onChangeText={setWebhookUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textHint}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
            />
          </ConfigField>

          <ConfigField label="Notification Email">
            <TextInput
              style={styles.configInput}
              value={notifEmail}
              onChangeText={setNotifEmail}
              placeholder="you@vguard.in"
              placeholderTextColor={colors.textHint}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ConfigField>

          <ConfigField label="SharePoint Site URL">
            <TextInput
              style={styles.configInput}
              value={spSiteUrl}
              onChangeText={setSpSiteUrl}
              placeholder="https://vguard.sharepoint.com/sites/..."
              placeholderTextColor={colors.textHint}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ConfigField>

          <TouchableOpacity
            style={[styles.pushBtn, pushStatus === 'pushing' && styles.pushBtnDisabled]}
            onPress={handlePushConfig}
            disabled={pushStatus === 'pushing'}
            activeOpacity={0.8}
          >
            <Ionicons
              name={pushStatus === 'ok' ? 'checkmark-circle' : pushStatus === 'err' ? 'alert-circle' : 'cloud-upload-outline'}
              size={18}
              color={pushStatus === 'ok' ? colors.success : pushStatus === 'err' ? colors.error : colors.headerBg}
            />
            <AppText variant="label" color={colors.headerBg} style={{ marginLeft: spacing.sm }}>
              {pushStatus === 'pushing' ? 'Pushing…' : 'Save & Push to GitHub'}
            </AppText>
          </TouchableOpacity>

          {pushMsg ? (
            <View style={[styles.pushFeedback, { borderColor: pushStatus === 'ok' ? colors.success : colors.error }]}>
              <AppText variant="caption" color={pushStatus === 'ok' ? colors.success : colors.error}>
                {pushMsg}
              </AppText>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={editStyles.section}>
      <AppText variant="caption" color={colors.textSecondary} style={editStyles.label}>{title}</AppText>
      {children}
    </View>
  );
}

function ChipRow({ options, value, onSelect }: {
  options: { label: string; value: string }[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={editStyles.chipRow}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[editStyles.chip, value === o.value && editStyles.chipSelected]}
          onPress={() => onSelect(o.value)}
          activeOpacity={0.75}
        >
          <AppText
            variant="caption"
            color={value === o.value ? colors.headerBg : colors.textSecondary}
            style={value === o.value ? { fontWeight: '600' } : undefined}
          >
            {o.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ConfigField({ label, sensitive, children }: { label: string; sensitive?: boolean; children: React.ReactNode }) {
  return (
    <View style={configStyles.field}>
      <View style={configStyles.labelRow}>
        <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
        {sensitive && (
          <View style={configStyles.sensitiveBadge}>
            <AppText variant="caption2" color={colors.warning}>SENSITIVE</AppText>
          </View>
        )}
      </View>
      {children}
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

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tabBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabTextActive: { fontWeight: '700' },

  tabContent: { flex: 1, backgroundColor: colors.background },

  // JSON
  jsonBody: { padding: spacing.md, gap: spacing.sm },
  jsonToolbar: { flexDirection: 'row', gap: spacing.sm },
  toolbarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2,
    borderWidth: 1, borderColor: colors.border,
  },
  exportRow: { flexDirection: 'row', gap: spacing.sm },
  exportInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontSize: 14,
    color: colors.textPrimary, backgroundColor: colors.surface,
  },
  exportGo: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center',
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11, color: colors.textSecondary, lineHeight: 18,
    backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },

  // TABLE
  tableBody: { padding: spacing.md, gap: spacing.md },
  tableSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  tableSectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  tableKey: {
    width: 100, fontSize: 12, color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tableVal: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  tableThumb: { width: 48, height: 48, borderRadius: 6 },

  // EDIT body
  editBody: { padding: spacing.md, gap: spacing.sm },

  // EDIT
  savedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.pill,
  },
  editTextInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surface,
    letterSpacing: 1,
  },

  // CONFIG body + inputs
  configBody: { padding: spacing.md, gap: spacing.md },
  configNote: { lineHeight: 18 },
  configInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surface,
  },
  configInputMulti: { minHeight: 72, textAlignVertical: 'top' as const },

  // CONFIG
  pushBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg, paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  pushBtnDisabled: { opacity: 0.6 },
  pushFeedback: {
    borderRadius: radius.sm, padding: spacing.sm,
    borderWidth: 1,
  },
});

const editStyles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, gap: spacing.sm,
  },
  label: { fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryFaint },
});

const configStyles = StyleSheet.create({
  field: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sensitiveBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.xs + 2, paddingVertical: 1,
    borderRadius: 4,
  },
});

