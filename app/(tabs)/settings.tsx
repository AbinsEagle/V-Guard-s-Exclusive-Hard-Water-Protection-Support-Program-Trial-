import { ScrollView, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Screen } from '../../src/components/layout';
import { AppText, Card } from '../../src/components/common';
import { colors, spacing } from '../../src/theme';

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

function SettingRow({
  icon,
  label,
  value,
  hasToggle,
  toggleValue,
  onToggle,
  onPress,
}: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <AppText variant="body" style={styles.settingLabel}>
        {label}
      </AppText>
      {hasToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={toggleValue ? colors.primary : colors.textSecondary}
        />
      )}
      {!hasToggle && value && (
        <AppText variant="caption" color={colors.textSecondary}>
          {value}
        </AppText>
      )}
      {!hasToggle && !value && (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoReport, setAutoReport] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Screen>
        <View style={styles.header}>
          <AppText variant="h2" color={colors.white}>
            Settings
          </AppText>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile */}
          <Card style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={28} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <AppText variant="h3">My Account</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Trial Member · ID: VG-2024-XXXXX
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Card>

          {/* Notifications */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            Notifications
          </AppText>
          <Card style={styles.settingsGroup}>
            <SettingRow
              icon="notifications-outline"
              label="Push Notifications"
              hasToggle
              toggleValue={notifications}
              onToggle={setNotifications}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="document-text-outline"
              label="Auto Water Reports"
              hasToggle
              toggleValue={autoReport}
              onToggle={setAutoReport}
            />
          </Card>

          {/* Appearance */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            Appearance
          </AppText>
          <Card style={styles.settingsGroup}>
            <SettingRow
              icon="moon-outline"
              label="Dark Mode"
              hasToggle
              toggleValue={darkMode}
              onToggle={setDarkMode}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="language-outline"
              label="Language"
              value="English"
            />
          </Card>

          {/* About */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            About
          </AppText>
          <Card style={styles.settingsGroup}>
            <SettingRow icon="information-circle-outline" label="About V-Guard" />
            <View style={styles.divider} />
            <SettingRow icon="shield-checkmark-outline" label="Privacy Policy" />
            <View style={styles.divider} />
            <SettingRow icon="document-outline" label="Terms of Service" />
            <View style={styles.divider} />
            <SettingRow
              icon="code-slash-outline"
              label="App Version"
              value="1.0.0"
            />
          </Card>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryDark,
  },
  content: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '100%',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  settingsGroup: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 32 + spacing.md,
  },
});
