import { ScrollView, View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/layout';
import { AppText, Card } from '../../src/components/common';
import { colors, spacing } from '../../src/theme';
import { SUPPORT_OPTIONS, FAQ_ITEMS } from '../../src/utils/constants';

export default function SupportScreen() {
  const handleContact = (action: string) => {
    if (action.startsWith('tel:') || action.startsWith('mailto:')) {
      Linking.openURL(action);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Screen>
        <View style={styles.header}>
          <AppText variant="h2" color={colors.white}>
            Support
          </AppText>
          <AppText variant="body" color={colors.primaryLight} style={styles.subtitle}>
            We're here to help
          </AppText>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Contact Options */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            Contact Us
          </AppText>
          <View style={styles.contactGrid}>
            {SUPPORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactCard}
                onPress={() => handleContact(option.action)}
                activeOpacity={0.8}
              >
                <View style={[styles.contactIcon, { backgroundColor: option.color + '22' }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <AppText variant="label" style={styles.contactLabel}>
                  {option.label}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {option.detail}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Schedule Service */}
          <TouchableOpacity style={styles.scheduleButton} activeOpacity={0.85}>
            <Ionicons name="calendar" size={20} color={colors.white} />
            <AppText variant="label" color={colors.white} style={styles.scheduleText}>
              Schedule a Service Visit
            </AppText>
          </TouchableOpacity>

          {/* FAQs */}
          <AppText variant="sectionTitle" style={styles.sectionLabel}>
            Frequently Asked Questions
          </AppText>
          {FAQ_ITEMS.map((faq) => (
            <Card key={faq.id} style={styles.faqCard}>
              <AppText variant="label">{faq.question}</AppText>
              <AppText variant="caption" color={colors.textSecondary} style={styles.faqAnswer}>
                {faq.answer}
              </AppText>
            </Card>
          ))}
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
  subtitle: {
    marginTop: spacing.xs,
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
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  contactCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    textAlign: 'center',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  scheduleText: {
    marginLeft: spacing.xs,
  },
  faqCard: {
    marginBottom: spacing.sm,
  },
  faqAnswer: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
