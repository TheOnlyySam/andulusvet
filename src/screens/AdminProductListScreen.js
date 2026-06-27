import React, { useContext } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { Text } from '../components/Typography';
import { AppContext } from '../context/AppContext';
import { APP_ROUTES } from '../constants/navigation';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

export default function AdminProductListScreen() {
  const navigation = useNavigation();
  const { products, isCatalogLoading, refreshCatalog } = useContext(AppContext);
  const { language, isRTL } = useLocalization();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={language === 'ar' ? 'تعديل المنتجات' : 'Edit products'} subtitle={language === 'ar' ? 'اختر منتجاً لعرض بياناته وتعديلها' : 'Select a product to review and edit'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heading, { flexDirection: getRowDirection(isRTL) }]}>
          <View><Text style={[styles.title, { textAlign: getTextAlign(isRTL) }]}>{language === 'ar' ? 'المنتجات الحالية' : 'Current products'}</Text><Text style={styles.count}>{products.length} {language === 'ar' ? 'منتج' : 'products'}</Text></View>
          <Pressable style={styles.refresh} onPress={refreshCatalog}><Ionicons name="refresh" size={18} color={colors.secondary} /><Text style={styles.refreshText}>{isCatalogLoading ? '...' : language === 'ar' ? 'تحديث' : 'Refresh'}</Text></Pressable>
        </View>

        {!products.length && !isCatalogLoading ? <View style={styles.empty}><Ionicons name="cube-outline" size={30} color={colors.secondary} /><Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد منتجات حالياً.' : 'No products available.'}</Text></View> : null}

        {products.map((item) => (
          <Pressable key={item.id} style={[styles.card, { flexDirection: getRowDirection(isRTL) }]} onPress={() => navigation.navigate(APP_ROUTES.adminEditProduct, { productId: item.id })}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : <View style={styles.imageFallback}><Ionicons name="cube-outline" size={23} color={colors.primary} /></View>}
            <View style={styles.copy}>
              <Text numberOfLines={1} style={[styles.name, { textAlign: getTextAlign(isRTL) }]}>{pickLocalizedText(item.name, language)}</Text>
              <Text numberOfLines={1} style={[styles.brand, { textAlign: getTextAlign(isRTL) }]}>{pickLocalizedText(item.brand, language)}</Text>
              <Text style={[styles.price, { textAlign: getTextAlign(isRTL) }]}>{formatCurrency(item.price, language)}</Text>
            </View>
            <View style={styles.editButton}><Ionicons name="create-outline" size={20} color="#fff" /></View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  content: { paddingBottom: 140 },
  heading: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  count: { color: colors.textSoft, fontSize: typography.caption, marginTop: 3 },
  refresh: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 9 },
  refreshText: { color: colors.secondary, fontSize: typography.caption, fontWeight: '900' },
  card: { alignItems: 'center', gap: spacing.md, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 10, marginBottom: spacing.sm, ...shadows.soft },
  image: { width: 70, height: 70, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  imageFallback: { width: 70, height: 70, borderRadius: radius.md, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  name: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  brand: { color: colors.textSoft, fontSize: typography.caption, marginTop: 3 },
  price: { color: colors.secondary, fontSize: typography.bodySm, fontWeight: '900', marginTop: 5 },
  editButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: spacing.sm, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  emptyText: { color: colors.textSoft, fontSize: typography.body }
});
