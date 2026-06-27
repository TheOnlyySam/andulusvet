import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import ScreenHeader from '../components/ScreenHeader';
import { Text } from '../components/Typography';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

const animals = [
  { id: 'all', icon: 'apps-outline', label: { ar: 'الكل', en: 'All' } },
  { id: 'cat', icon: 'paw-outline', label: { ar: 'قطط', en: 'Cats' } },
  { id: 'dog', icon: 'paw-outline', label: { ar: 'كلاب', en: 'Dogs' } },
  { id: 'bird', icon: 'leaf-outline', label: { ar: 'طيور', en: 'Birds' } },
  { id: 'horse', icon: 'fitness-outline', label: { ar: 'خيول', en: 'Horses' } },
  { id: 'cattle', icon: 'nutrition-outline', label: { ar: 'مواشي', en: 'Cattle' } }
];

function buildTypes(t) {
  return [
    { id: 'all', label: t('shop.allTypes'), match: () => true },
    { id: 'dry', label: t('shop.dryFood'), match: (item) => item.categoryId === 'c1' },
    { id: 'wet', label: t('shop.wetFood'), match: (item) => item.categoryId === 'c2' },
    { id: 'vitamins', label: { ar: 'فيتامينات', en: 'Vitamins' }, match: (item) => item.categoryId === 'c3' },
    { id: 'care', label: { ar: 'العناية', en: 'Care' }, match: (item) => item.categoryId === 'c4' },
    { id: 'medicine', label: { ar: 'أدوية', en: 'Medicine' }, match: (item) => item.categoryId === 'c5' },
    { id: 'treats', label: { ar: 'مكافآت', en: 'Treats' }, match: (item) => item.categoryId === 'c6' },
    { id: 'toys', label: { ar: 'ألعاب', en: 'Toys' }, match: (item) => item.categoryId === 'c7' }
  ];
}

function FilterChip({ active, icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      {icon ? <Ionicons name={icon} size={16} color={active ? '#fff' : colors.secondary} /> : null}
      <Text numberOfLines={1} style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function ShopScreen() {
  const { language, isRTL, t } = useLocalization();
  const {
    products,
    isCatalogLoading,
    refreshCatalog,
    selectedCategory,
    selectedAnimalType,
    selectedFoodFocus,
    clearCatalogFilters,
    setSelectedAnimalType,
    setSelectedFoodFocus,
    setSelectedCategory
  } = useContext(AppContext);
  const [selectedAnimal, setSelectedAnimal] = useState(selectedAnimalType || 'all');
  const [selectedType, setSelectedType] = useState('all');
  const types = useMemo(() => buildTypes(t), [t]);

  useFocusEffect(useCallback(() => {
    refreshCatalog();
  }, [refreshCatalog]));

  useEffect(() => setSelectedAnimal(selectedAnimalType || 'all'), [selectedAnimalType]);

  const activeType = types.find((item) => item.id === selectedType) || types[0];
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesAnimal = selectedAnimal === 'all' || product.animalType === 'all' || product.animalType === selectedAnimal;
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesFocus = !selectedFoodFocus || product.animalType === selectedFoodFocus.replace('_food', '');
    return matchesAnimal && activeType.match(product) && matchesCategory && matchesFocus;
  }), [activeType, products, selectedAnimal, selectedCategory, selectedFoodFocus]);

  const resetFilters = () => {
    clearCatalogFilters();
    setSelectedAnimal('all');
    setSelectedType('all');
  };

  const header = (
    <View>
      <ScreenHeader title={t('shop.title')} subtitle={t('shop.subtitle')} />

      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <View style={[styles.heroTop, { flexDirection: getRowDirection(isRTL) }]}>
          <View style={styles.heroIcon}><Ionicons name="bag-handle-outline" size={24} color="#fff" /></View>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { textAlign: getTextAlign(isRTL) }]}>
              {language === 'ar' ? 'اختيارات موثوقة لصحة حيوانك' : 'Trusted picks for healthier pets'}
            </Text>
            <Text style={[styles.heroSubtitle, { textAlign: getTextAlign(isRTL) }]}>
              {language === 'ar' ? 'منتجات واضحة، أسعار مباشرة، وطلب سريع عبر واتساب' : 'Clear products, upfront prices, and quick WhatsApp ordering'}
            </Text>
          </View>
        </View>
        <View style={[styles.heroMeta, { flexDirection: getRowDirection(isRTL) }]}>
          <Text style={styles.heroCount}>{products.length}</Text>
          <Text style={styles.heroMetaText}>{language === 'ar' ? 'منتج متوفر الآن' : 'products available now'}</Text>
        </View>
      </View>

      <View style={styles.filterCard}>
        <View style={[styles.filterHeading, { flexDirection: getRowDirection(isRTL) }]}>
          <View style={[styles.headingGroup, { flexDirection: getRowDirection(isRTL) }]}>
            <Ionicons name="options-outline" size={18} color={colors.secondary} />
            <Text style={styles.filterTitle}>{language === 'ar' ? 'تصفّح حسب الحيوان' : 'Browse by animal'}</Text>
          </View>
          {(selectedAnimal !== 'all' || selectedType !== 'all' || selectedCategory || selectedFoodFocus) ? (
            <Pressable onPress={resetFilters} style={styles.resetButton}>
              <Text style={styles.resetText}>{language === 'ar' ? 'مسح الفلاتر' : 'Clear'}</Text>
            </Pressable>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {animals.map((item) => (
            <FilterChip
              key={item.id}
              active={selectedAnimal === item.id}
              icon={item.icon}
              label={pickLocalizedText(item.label, language)}
              onPress={() => {
                setSelectedAnimal(item.id);
                setSelectedAnimalType(item.id === 'all' ? null : item.id);
                if (item.id === 'all') {
                  setSelectedFoodFocus(null);
                  setSelectedCategory(null);
                }
              }}
            />
          ))}
        </ScrollView>
        <View style={styles.divider} />
        <Text style={[styles.typeLabel, { textAlign: getTextAlign(isRTL) }]}>{t('shop.productSection')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {types.map((item) => (
            <FilterChip
              key={item.id}
              active={selectedType === item.id}
              label={pickLocalizedText(item.label, language)}
              onPress={() => setSelectedType(item.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.resultHeading, { flexDirection: getRowDirection(isRTL) }]}>
        <Text style={styles.resultTitle}>{language === 'ar' ? 'المنتجات' : 'Products'}</Text>
        <View style={styles.resultBadge}><Text style={styles.resultCount}>{visibleProducts.length}</Text></View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={isCatalogLoading} onRefresh={refreshCatalog} tintColor={colors.secondary} colors={[colors.secondary]} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}><Ionicons name="cube-outline" size={30} color={colors.secondary} /></View>
            <Text style={styles.emptyTitle}>{isCatalogLoading ? t('common.loading') : t('shop.empty')}</Text>
            {!isCatalogLoading ? <Pressable style={styles.retryButton} onPress={refreshCatalog}><Text style={styles.retryText}>{language === 'ar' ? 'إعادة المحاولة' : 'Try again'}</Text></Pressable> : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingBottom: 150 },
  heroCard: { backgroundColor: colors.secondary, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, overflow: 'hidden', ...shadows.card },
  heroGlow: { position: 'absolute', width: 170, height: 170, borderRadius: 90, backgroundColor: 'rgba(108,197,199,0.16)', top: -80, right: -35 },
  heroTop: { alignItems: 'center', gap: spacing.md },
  heroIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: typography.h3, fontWeight: '900', lineHeight: 25 },
  heroSubtitle: { color: '#CFE4E6', fontSize: typography.caption, lineHeight: 19, marginTop: 5 },
  heroMeta: { alignItems: 'baseline', gap: 7, marginTop: spacing.md },
  heroCount: { color: colors.accent, fontSize: 23, fontWeight: '900' },
  heroMetaText: { color: '#fff', fontSize: typography.caption, fontWeight: '700' },
  filterCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  filterHeading: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  headingGroup: { alignItems: 'center', gap: 7 },
  filterTitle: { color: colors.secondary, fontWeight: '900', fontSize: typography.label },
  resetButton: { backgroundColor: '#F1F7F7', borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  resetText: { color: colors.textSoft, fontSize: typography.caption, fontWeight: '800' },
  chipRow: { gap: 8, paddingHorizontal: 1 },
  chip: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: '#F4F8F8', borderWidth: 1, borderColor: '#E0ECEC' },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { color: colors.secondary, fontSize: typography.bodySm, fontWeight: '800' },
  chipTextActive: { color: '#fff' },
  pressed: { opacity: 0.72 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  typeLabel: { color: colors.textSoft, fontSize: typography.caption, fontWeight: '800', marginBottom: spacing.sm },
  resultHeading: { alignItems: 'center', gap: 8, marginTop: spacing.lg, marginBottom: spacing.sm },
  resultTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  resultBadge: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  resultCount: { color: colors.secondary, fontSize: typography.caption, fontWeight: '900' },
  emptyCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, marginTop: spacing.sm },
  emptyIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { textAlign: 'center', color: colors.textSoft, fontSize: typography.body },
  retryButton: { marginTop: spacing.md, backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '900', fontSize: typography.bodySm }
});
