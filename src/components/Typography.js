import React, { forwardRef } from 'react';
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { fontFamily } from '../theme';
import { localizeDigits, toWesternDigits } from '../utils/format';

function usesBoldFace(style) {
  const weight = StyleSheet.flatten(style)?.fontWeight;
  return weight === 'bold' || Number.parseInt(weight, 10) >= 600;
}

function getBrandFont(style) {
  return usesBoldFace(style) ? fontFamily.arabicBold : fontFamily.arabicLight;
}

function normalizeChildren(children, language) {
  return React.Children.map(children, (child) => {
    if (typeof child !== 'string' && typeof child !== 'number') return child;

    const localized = localizeDigits(child, language);
    if (language === 'ar') return localized;

    return localized.split(/([0-9][0-9.,:/%+\-]*)/g).map((part, index) => (
      /^[0-9]/.test(part)
        ? <NativeText key={`${part}-${index}`} style={styles.latinDigits}>{part}</NativeText>
        : part
    ));
  });
}

export const Text = forwardRef(function Text({ style, children, ...props }, ref) {
  const { language } = useLocalization();
  const brandFont = getBrandFont(style);
  return (
    <NativeText
      ref={ref}
      {...props}
      style={[style, { fontFamily: brandFont, fontWeight: 'normal' }]}
    >
      {normalizeChildren(children, language)}
    </NativeText>
  );
});

export const TextInput = forwardRef(function TextInput({ style, value, defaultValue, placeholder, onChangeText, ...props }, ref) {
  const { language } = useLocalization();
  const brandFont = getBrandFont(style);
  const localizedValue = typeof value === 'string' ? localizeDigits(value, language) : value;
  const localizedDefaultValue = typeof defaultValue === 'string' ? localizeDigits(defaultValue, language) : defaultValue;
  const localizedPlaceholder = typeof placeholder === 'string' ? localizeDigits(placeholder, language) : placeholder;
  const latinKeyboard = ['email-address', 'phone-pad', 'numeric', 'number-pad', 'decimal-pad'].includes(props.keyboardType);
  const containsDigits = /[0-9]/.test(toWesternDigits(value || defaultValue || placeholder || ''));
  const inputFont = language === 'en' && (latinKeyboard || containsDigits) ? 'System' : brandFont;

  return (
    <NativeTextInput
      ref={ref}
      {...props}
      value={localizedValue}
      defaultValue={localizedDefaultValue}
      placeholder={localizedPlaceholder}
      onChangeText={onChangeText ? (text) => onChangeText(toWesternDigits(text)) : undefined}
      style={[style, { fontFamily: inputFont, fontWeight: 'normal' }]}
    />
  );
});

const styles = StyleSheet.create({
  latinDigits: {
    fontFamily: 'System',
    fontWeight: 'normal'
  }
});
