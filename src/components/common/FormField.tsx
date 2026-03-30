import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../../theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  rightElement?: React.ReactNode;
}

export function FormField({
  label,
  error,
  required,
  hint,
  rightElement,
  style,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText variant="label" style={styles.label}>
          {label}
          {required && (
            <AppText variant="label" color={colors.error}>
              {' '}*
            </AppText>
          )}
        </AppText>
        {hint && (
          <AppText variant="caption" color={colors.textHint}>
            {hint}
          </AppText>
        )}
      </View>

      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textHint}
          {...inputProps}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>

      {error && (
        <AppText variant="caption" color={colors.error} style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function SelectField({
  label,
  options,
  value,
  onSelect,
  error,
  required,
}: SelectFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label" style={styles.label}>
        {label}
        {required && (
          <AppText variant="label" color={colors.error}>
            {' '}*
          </AppText>
        )}
      </AppText>
      <View style={styles.optionsRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, value === opt.value && styles.optionSelected]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.75}
          >
            <AppText
              variant="caption"
              color={value === opt.value ? colors.primary : colors.textSecondary}
              style={value === opt.value ? styles.optionTextSelected : undefined}
            >
              {opt.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
      {error && (
        <AppText variant="caption" color={colors.error} style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  rightElement: {
    marginLeft: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
});
