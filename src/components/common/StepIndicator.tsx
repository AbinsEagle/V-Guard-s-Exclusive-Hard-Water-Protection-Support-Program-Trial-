import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { AppText } from './AppText';

interface StepIndicatorProps {
  currentStep: number;   // 1-based
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={step}>
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}
              >
                {isCompleted ? (
                  <AppText variant="caption" color={colors.white} style={styles.tick}>✓</AppText>
                ) : (
                  <AppText
                    variant="caption"
                    color={isActive ? colors.white : colors.textHint}
                  >
                    {step}
                  </AppText>
                )}
              </View>
              {labels?.[i] && (
                <AppText
                  variant="caption"
                  color={isActive ? colors.primary : colors.textHint}
                  style={styles.label}
                  numberOfLines={1}
                >
                  {labels[i]}
                </AppText>
              )}
            </View>
            {step < totalSteps && (
              <View style={[styles.line, isCompleted && styles.lineCompleted]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stepWrapper: {
    alignItems: 'center',
    width: 52,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  circleCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  tick: {
    fontSize: 13,
    fontWeight: '700',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginTop: 13,
  },
  lineCompleted: {
    backgroundColor: colors.success,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: 10,
    textAlign: 'center',
  },
});
