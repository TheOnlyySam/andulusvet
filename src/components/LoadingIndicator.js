import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';

export default function LoadingIndicator({ message, compact = false, style }) {
  const { t } = useLocalization();

  return (
    <View style={[styles.wrap, compact && styles.compact, style]}>
      <ActivityIndicator size={compact ? 'small' : 'large'} color={colors.secondary} />
      <Text style={[styles.message, compact && styles.compactMessage]}>{message || t('common.loading')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.lg
  },
  compact: {
    minHeight: 0,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    padding: spacing.sm,
    gap: spacing.sm
  },
  message: {
    color: colors.secondary,
    fontSize: typography.body,
    fontWeight: '800',
    textAlign: 'center'
  },
  compactMessage: {
    fontSize: typography.bodySm
  }
});
