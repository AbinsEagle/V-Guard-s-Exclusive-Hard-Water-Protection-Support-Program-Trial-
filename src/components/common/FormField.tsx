import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../theme';

// ─── Text Field ───────────────────────────────────────────────────────────────
// Apple HIG "inset grouped" style — label above, input in rounded rect

interface FormFieldProps extends TextInputProps {
  label:        string;
  error?:       string;
  required?:    boolean;
  hint?:        string;
  rightElement?: React.ReactNode;
}

export function FormField({
  label, error, required, hint, rightElement, style, ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText variant="caption" style={styles.label}>
          {label}
          {required && <AppText variant="caption" color={colors.error}>  *</AppText>}
        </AppText>
        {hint && <AppText variant="caption" color={colors.textTertiary}>{hint}</AppText>}
      </View>

      <View style={[styles.field, error ? styles.fieldError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textHint}
          {...inputProps}
        />
        {rightElement && <View style={styles.right}>{rightElement}</View>}
      </View>

      {error && (
        <AppText variant="caption" color={colors.error} style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
}

// ─── Chip Select ──────────────────────────────────────────────────────────────
// iOS segmented-control feel using tappable pill chips

interface SelectOption { label: string; value: string; }

interface SelectFieldProps {
  label:    string;
  options:  SelectOption[];
  value:    string;
  onSelect: (v: string) => void;
  error?:   string;
  required?: boolean;
}

export function SelectField({
  label, options, value, onSelect, error, required,
}: SelectFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="caption" style={styles.label}>
        {label}
        {required && <AppText variant="caption" color={colors.error}>  *</AppText>}
      </AppText>

      <View style={styles.chipRow}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
            >
              <AppText
                variant="subhead"
                color={active ? colors.primary : colors.textSecondary}
                style={active ? styles.chipLabelActive : undefined}
              >
                {opt.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
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
  container:  { marginBottom: spacing.md },
  labelRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label:      { color: colors.textSecondary },

  // Input field — Apple "fill" style
  field: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.fillTertiary,
    borderRadius:     radius.md,
    paddingHorizontal: spacing.md,
    minHeight:        44,
    borderWidth:      0.5,
    borderColor:      'transparent',
  },
  fieldError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  input: {
    flex:        1,
    fontSize:    17,
    color:       colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  right:       { marginLeft: spacing.sm },
  errorText:   { marginTop: 4 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm - 2,
    borderRadius:      radius.pill,
    backgroundColor:   colors.fillTertiary,
    borderWidth:       0.5,
    borderColor:       'transparent',
  },
  chipActive: {
    backgroundColor: colors.primaryFaint,
    borderColor:     colors.primary,
  },
  chipLabelActive: { fontWeight: '600' },
});
