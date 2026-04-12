import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';

export default function BrandLogo({ compact = false }) {
  const { language } = useLocalization();

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Image source={require('../../assets/branding/header-logo.png')} style={[styles.logo, compact && styles.logoCompact]} />
      <View>
        <Text style={[styles.title, compact && styles.titleCompact]}>
          {language === 'ar' ? 'مجموعة الاندلس البيطرية' : 'Andulus Veterinary Clinic'}
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
    backgroundColor: 'rgba(255,255,255,0.78)',
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
    borderRadius: 21
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
