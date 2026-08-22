import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from './Typography';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';
import { getTextAlign } from '../utils/format';

export default function FormField({ label, multiline = false, style, inputStyle, ...inputProps }) {
  const { isRTL } = useLocalization();
  const [isFocused, setIsFocused] = useState(false);
  const autofillProps = {
    autoComplete: inputProps.autoComplete ?? 'off',
    textContentType: inputProps.textContentType ?? 'none',
    importantForAutofill: inputProps.importantForAutofill ?? 'no'
  };

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{label}</Text>
      <TextInput
        {...autofillProps}
        {...inputProps}
        multiline={multiline}
        onFocus={(event) => {
          setIsFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          inputProps.onBlur?.(event);
        }}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
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
    marginBottom: spacing.md
  },
  label: {
    color: colors.secondary,
    marginBottom: 8,
    fontSize: typography.bodySm,
    fontWeight: '800'
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7E8E9',
    backgroundColor: '#F8FBFB',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    minHeight: 52,
    color: colors.text,
    fontSize: typography.body
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top'
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    paddingHorizontal: spacing.md - 1,
    paddingVertical: 11,
    backgroundColor: colors.surface
  }
});
