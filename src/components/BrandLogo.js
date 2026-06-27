import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';

export default function BrandLogo({ compact = false }) {
  const { language } = useLocalization();

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Image
        source={require('../../assets/branding/adaptiveIcon.foregroundImage.png')}
        style={[styles.logo, compact && styles.logoCompact]}
        resizeMode="contain"
      />
      <View>
        <Text style={[styles.title, compact && styles.titleCompact]}>
          {language === 'ar' ? 'مجموعة الأندلس البيطرية' : 'Andalus'}
        </Text>
        {!compact ? (
          <Text style={styles.subtitle}>
            {language === 'ar' ? 'رعاية بيطرية متكاملة' : 'Integrated Veterinary Care'}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill
  },
  wrapCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentSoft
  },
  logoCompact: {
    width: 34,
    height: 34,
    borderRadius: 17
  },
  title: {
    color: colors.secondary,
    fontSize: typography.label,
    fontWeight: '900'
  },
  titleCompact: {
    fontSize: typography.bodySm
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: typography.caption,
    fontWeight: '700'
  }
});
