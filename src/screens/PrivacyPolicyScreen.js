import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getTextAlign } from '../utils/format';

export default function PrivacyPolicyScreen() {
  const { isRTL, t } = useLocalization();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('legal.privacyTitle')} subtitle={t('legal.privacySubtitle')} showLanguage={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {['privacyIntro', 'privacyData', 'privacyUsage', 'privacySharing', 'privacyRights'].map((key) => (
          <View key={key} style={styles.card}>
            <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t(`legal.${key}Title`)}</Text>
            <Text style={[styles.bodyText, { textAlign: getTextAlign(isRTL) }]}>{t(`legal.${key}Body`)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md
  },
  content: {
    paddingBottom: spacing.xxl
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: typography.h3,
    fontWeight: '900',
    marginBottom: spacing.sm
  },
  bodyText: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24
  }
});
