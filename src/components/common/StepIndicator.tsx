import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors, radius, spacing } from '../../theme';
import { AppText } from './AppText';

interface StepIndicatorProps {
  currentStep: number;   // 1-based
  totalSteps:  number;
  labels?:     string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step        = i + 1;
        const isCompleted = step < currentStep;
        const isActive    = step === currentStep;

        return (
          <React.Fragment key={step}>
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive    && styles.circleActive,
                ]}
              >
                {isCompleted ? (
                  <AppText variant="caption2" color={colors.white} style={styles.tick}>✓</AppText>
                ) : (
                  <AppText
                    variant="caption2"
                    color={isActive ? colors.white : colors.textTertiary}
                    style={styles.stepNum}
                  >
                    {step}
                  </AppText>
                )}
              </View>

              {labels?.[i] && (
                <AppText
                  variant="caption2"
                  color={isActive ? colors.primary : colors.textTertiary}
                  style={[styles.label, isActive && styles.labelActive]}
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

function createStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flexDirection:     'row',
      alignItems:        'flex-start',
      justifyContent:    'center',
      paddingHorizontal: spacing.lg,
      paddingVertical:   spacing.md,
      backgroundColor:   colors.background,
    },

    stepWrapper: { alignItems: 'center', width: 48 },

    circle: {
      width:           26,
      height:          26,
      borderRadius:    13,
      backgroundColor: colors.fillTertiary,
      borderWidth:     1.5,
      borderColor:     colors.borderOpaque,
      alignItems:      'center',
      justifyContent:  'center',
    },
    circleActive: {
      backgroundColor: colors.primary,
      borderColor:     colors.primary,
    },
    circleCompleted: {
      backgroundColor: colors.success,
      borderColor:     colors.success,
    },

    tick:    { fontWeight: '700', fontSize: 11 },
    stepNum: { fontWeight: '600' },

    line: {
      flex:            1,
      height:          1.5,
      backgroundColor: colors.borderOpaque,
      marginTop:       12,
    },
    lineCompleted: { backgroundColor: colors.success },

    label: {
      marginTop:     4,
      fontSize:      10,
      textAlign:     'center',
      letterSpacing: 0,
    },
    labelActive: { color: colors.primary, fontWeight: '600' },
  });
}
