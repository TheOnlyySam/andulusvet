import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

export default function OptionSelector({ label, options, value, onChange }) {
  const { language, isRTL } = useLocalization();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{label}</Text>
      <View style={[styles.options, { flexDirection: getRowDirection(isRTL) }]}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.option, active && styles.optionActive]}>
              {active ? <Ionicons name="checkmark-circle" size={16} color="#fff" /> : null}
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{pickLocalizedText(option.label, language)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: { color: colors.secondary, marginBottom: 8, fontSize: typography.label, fontWeight: '900' },
  options: { flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.border, backgroundColor: '#F6FAFA', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
  optionActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  optionText: { color: colors.secondary, fontSize: typography.bodySm, fontWeight: '800' },
  optionTextActive: { color: '#fff' }
});
