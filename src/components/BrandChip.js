import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';

export default function BrandChip({ label, active, onPress }) {
  const { isRTL } = useLocalization();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.activeChip]}
      activeOpacity={0.85}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }, active && styles.activeLabel]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 42,
    minWidth: 84,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  activeChip: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary
  },
  label: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: typography.caption,
    lineHeight: 18
  },
  activeLabel: {
    color: '#fff'
  }
});
