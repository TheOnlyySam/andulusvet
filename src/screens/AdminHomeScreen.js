import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { APP_ROUTES } from '../constants/navigation';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getTextAlign } from '../utils/format';

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const { isAdmin } = useContext(AppContext);
  const { isRTL, t } = useLocalization();

  const cards = [
    { key: APP_ROUTES.adminProducts, title: t('admin.productsTitle'), subtitle: t('admin.productsSubtitle') },
    { key: APP_ROUTES.adminDiscounts, title: t('admin.discountsTitle'), subtitle: t('admin.discountsSubtitle') },
    { key: APP_ROUTES.adminVaccines, title: t('admin.vaccinesTitle'), subtitle: t('admin.vaccinesSubtitle') }
  ];

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title={t('admin.title')} subtitle={t('admin.noAccess')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('admin.title')} subtitle={t('admin.subtitle')} />
      {cards.map((card) => (
        <TouchableOpacity key={card.key} style={styles.card} onPress={() => navigation.navigate(card.key)}>
          <Text style={[styles.cardTitle, { textAlign: getTextAlign(isRTL) }]}>{card.title}</Text>
          <Text style={[styles.cardSubtitle, { textAlign: getTextAlign(isRTL) }]}>{card.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card
  },
  cardTitle: {
    color: colors.secondary,
    fontSize: typography.h3,
    fontWeight: '900'
  },
  cardSubtitle: {
    color: colors.textSoft,
    fontSize: typography.body,
    marginTop: 6,
    lineHeight: 22
  }
});
