import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from './Typography';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';
import { getTextAlign } from '../utils/format';

export default function FormField({ label, multiline = false, style, inputStyle, ...inputProps }) {
  const { isRTL } = useLocalization();

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.textArea,
          { textAlign: getTextAlign(isRTL) },
          inputStyle
        ]}
        placeholderTextColor={colors.tabInactive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.sm
  },
  label: {
    color: colors.secondary,
    marginBottom: 7,
    fontSize: typography.label,
    fontWeight: '800'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    color: colors.text,
    fontSize: typography.body
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top'
  }
});
