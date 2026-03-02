import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function BrandChip({ label, active, onPress }) {
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
        style={[styles.label, active && styles.activeLabel]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 38,
    minWidth: 74,
    maxWidth: 160,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
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
    fontSize: 13,
    lineHeight: 17
  },
  activeLabel: {
    color: '#fff'
  }
});
