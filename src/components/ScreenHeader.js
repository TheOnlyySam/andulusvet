import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from './BrandLogo';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign } from '../utils/format';

export default function ScreenHeader({ title, subtitle, showLanguage = true }) {
  const { isRTL, language, setLanguage, t } = useLocalization();

  return (
    <View style={styles.wrap}>
      <View style={[styles.topRow, { flexDirection: getRowDirection(isRTL) }]}>
        <BrandLogo compact />
        {showLanguage ? (
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            <Ionicons name="language" size={16} color={colors.secondary} />
            <Text style={styles.languageText}>
              {language === 'ar' ? t('common.english') : t('common.arabic')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={[styles.title, { textAlign: getTextAlign(isRTL) }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { textAlign: getTextAlign(isRTL) }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    minWidth: 124,
    justifyContent: 'center'
  },
  languageText: {
    color: colors.secondary,
    fontSize: typography.bodySm,
    fontWeight: '800'
  },
  title: {
    color: colors.secondary,
    fontSize: typography.hero,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: typography.body,
    marginTop: 8,
    lineHeight: 24
  }
});
