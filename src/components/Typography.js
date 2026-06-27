import React, { forwardRef } from 'react';
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { fontFamily } from '../theme';
import { toWesternDigits } from '../utils/format';

function usesBoldFace(style) {
  const weight = StyleSheet.flatten(style)?.fontWeight;
  return weight === 'bold' || Number.parseInt(weight, 10) >= 600;
}

function useArabicFont(style) {
  const { language } = useLocalization();
  if (language !== 'ar') return undefined;
  return usesBoldFace(style) ? fontFamily.arabicBold : fontFamily.arabicLight;
}

function normalizeChildren(children) {
  return React.Children.map(children, (child) => {
    if (typeof child !== 'string') return child;

    return toWesternDigits(child).split(/([0-9][0-9.,:/%+\-]*)/g).map((part, index) => (
      /^[0-9]/.test(part)
        ? <NativeText key={`${part}-${index}`} style={styles.latinDigits}>{part}</NativeText>
        : part
    ));
  });
}

export const Text = forwardRef(function Text({ style, children, ...props }, ref) {
  const arabicFont = useArabicFont(style);
  return (
    <NativeText
      ref={ref}
      {...props}
      style={[style, arabicFont && { fontFamily: arabicFont, fontWeight: 'normal' }]}
    >
      {normalizeChildren(children)}
    </NativeText>
  );
});

export const TextInput = forwardRef(function TextInput({ style, value, defaultValue, placeholder, onChangeText, ...props }, ref) {
  const arabicFont = useArabicFont(style);
  const normalizedValue = toWesternDigits(value);
  const normalizedDefaultValue = toWesternDigits(defaultValue);
  const normalizedPlaceholder = toWesternDigits(placeholder);
  const latinKeyboard = ['email-address', 'phone-pad', 'numeric', 'number-pad', 'decimal-pad'].includes(props.keyboardType);
  const containsDigits = /[0-9]/.test(normalizedValue || normalizedDefaultValue || normalizedPlaceholder || '');
  const inputFont = latinKeyboard || containsDigits ? 'System' : arabicFont;

  return (
    <NativeTextInput
      ref={ref}
      {...props}
      value={normalizedValue}
      defaultValue={normalizedDefaultValue}
      placeholder={normalizedPlaceholder}
      onChangeText={onChangeText ? (text) => onChangeText(toWesternDigits(text)) : undefined}
      style={[style, inputFont && { fontFamily: inputFont, fontWeight: 'normal' }]}
    />
  );
});

const styles = StyleSheet.create({
  latinDigits: {
    fontFamily: 'System',
    fontWeight: 'normal'
  }
});
