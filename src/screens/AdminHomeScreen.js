import React, { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { Text } from '../components/Typography';
import { AppContext } from '../context/AppContext';
import { APP_ROUTES } from '../constants/navigation';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign } from '../utils/format';

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const { isAdmin, products, discountRules, vaccineBooks } = useContext(AppContext);
  const { language, isRTL, t } = useLocalization();

  const cards = [
    { key: APP_ROUTES.adminProducts, icon: 'add-circle-outline', color: '#E7F7F7', title: language === 'ar' ? 'إضافة منتج' : 'Add product', subtitle: language === 'ar' ? 'إضافة منتج جديد إلى المتجر' : 'Create a new product for the shop' },
    { key: APP_ROUTES.adminProductList, icon: 'create-outline', color: '#EAF3FF', title: language === 'ar' ? 'تعديل المنتجات' : 'Edit products', subtitle: language === 'ar' ? 'اختيار منتج حالي وتعديل بياناته' : 'Select and update an existing product' },
    { key: APP_ROUTES.adminDiscounts, icon: 'pricetag-outline', color: '#FFF5DF', title: t('admin.discountsTitle'), subtitle: t('admin.discountsSubtitle') },
    { key: APP_ROUTES.adminVaccines, icon: 'medkit-outline', color: '#EEF0FF', title: t('admin.vaccinesTitle'), subtitle: t('admin.vaccinesSubtitle') }
  ];

  if (!isAdmin) return <SafeAreaView style={styles.container} edges={['top']}><ScreenHeader title={t('admin.title')} subtitle={t('admin.noAccess')} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={t('admin.title')} subtitle={t('admin.subtitle')} />
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={[styles.heroRow, { flexDirection: getRowDirection(isRTL) }]}>
            <View style={styles.heroIcon}><Ionicons name="shield-checkmark-outline" size={28} color="#fff" /></View>
            <View style={styles.heroCopy}><Text style={[styles.heroTitle, { textAlign: getTextAlign(isRTL) }]}>{language === 'ar' ? 'مركز التحكم' : 'Control center'}</Text><Text style={[styles.heroSubtitle, { textAlign: getTextAlign(isRTL) }]}>{language === 'ar' ? 'تابع المحتوى والطلبات من مكان واحد' : 'Manage content and requests in one place'}</Text></View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statNumber}>{products.length}</Text><Text style={styles.statLabel}>{language === 'ar' ? 'منتج' : 'Products'}</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statNumber}>{discountRules.length}</Text><Text style={styles.statLabel}>{language === 'ar' ? 'خصم' : 'Discounts'}</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statNumber}>{vaccineBooks.length}</Text><Text style={styles.statLabel}>{language === 'ar' ? 'ملف' : 'Files'}</Text></View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{language === 'ar' ? 'أدوات الإدارة' : 'Management tools'}</Text>
        {cards.map((card) => (
          <Pressable key={card.key} style={({ pressed }) => [styles.card, { flexDirection: getRowDirection(isRTL) }, pressed && styles.pressed]} onPress={() => navigation.navigate(card.key)}>
            <View style={[styles.cardIcon, { backgroundColor: card.color }]}><Ionicons name={card.icon} size={25} color={colors.secondary} /></View>
            <View style={styles.cardCopy}><Text style={[styles.cardTitle, { textAlign: getTextAlign(isRTL) }]}>{card.title}</Text><Text style={[styles.cardSubtitle, { textAlign: getTextAlign(isRTL) }]}>{card.subtitle}</Text></View>
            <View style={styles.arrow}><Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.secondary} /></View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  content: { paddingBottom: 120 },
  hero: { backgroundColor: colors.secondary, borderRadius: radius.xl, padding: spacing.lg, overflow: 'hidden', ...shadows.card },
  heroGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(108,197,199,0.13)', right: -55, top: -80 },
  heroRow: { alignItems: 'center', gap: spacing.md },
  heroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: typography.h2, fontWeight: '900' },
  heroSubtitle: { color: '#CFE0E2', fontSize: typography.bodySm, marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.lg, paddingVertical: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { color: colors.accent, fontSize: typography.h2, fontWeight: '900' },
  statLabel: { color: '#fff', fontSize: typography.caption, marginTop: 2 },
  statDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.15)' },
  sectionTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.md },
  card: { alignItems: 'center', gap: spacing.md, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.soft },
  cardIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1 },
  cardTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  cardSubtitle: { color: colors.textSoft, fontSize: typography.bodySm, marginTop: 4, lineHeight: 20 },
  arrow: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] }
});
