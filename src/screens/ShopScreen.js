import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

function buildSegmentCards(t) {
  return [
    {
      id: 'cat',
      label: { ar: 'قطط', en: 'Cats' },
      subtitle: { ar: 'كل المراحل', en: 'All stages' },
      match: (product) => product.animalType === 'cat'
    },
    {
      id: 'dog',
      label: { ar: 'كلاب', en: 'Dogs' },
      subtitle: { ar: 'كل المراحل', en: 'All stages' },
      match: (product) => product.animalType === 'dog'
    },
    {
      id: 'horse',
      label: { ar: 'خيول', en: 'Horses' },
      subtitle: { ar: 'كل المراحل', en: 'All stages' },
      match: (product) => product.animalType === 'horse'
    },
    {
      id: 'cattle',
      label: { ar: 'مواشي', en: 'Cattle' },
      subtitle: { ar: 'كل المراحل', en: 'All stages' },
      match: (product) => product.animalType === 'cattle'
    },
    {
      id: 'bird',
      label: { ar: 'طيور', en: 'Birds' },
      subtitle: { ar: 'رعاية يومية', en: 'Daily care' },
      match: (product) => product.animalType === 'bird'
    },
    {
      id: 'all',
      label: { ar: 'الكل', en: 'All' },
      subtitle: { ar: 'كل الحيوانات', en: 'All animals' },
      match: () => true
    }
  ];
}

function buildTypeCards(t) {
  return [
    { id: 'all', label: t('shop.allTypes'), match: () => true },
    { id: 'dry', label: t('shop.dryFood'), match: (product) => product.categoryId === 'c1' },
    { id: 'wet', label: t('shop.wetFood'), match: (product) => product.categoryId === 'c2' },
    { id: 'vitamins', label: { ar: 'فيتامينات', en: 'Vitamins' }, match: (product) => product.categoryId === 'c3' },
    { id: 'litter', label: t('shop.litter'), match: (product) => product.categoryId === 'c4' && product.animalType === 'cat' },
    { id: 'toys', label: t('shop.toys'), match: (product) => product.categoryId === 'c4' },
    { id: 'meds', label: { ar: 'أدوية', en: 'Medicine' }, match: (product) => product.categoryId === 'c5' },
    { id: 'offers', label: t('shop.offer'), match: (product) => product.price <= 18000 }
  ];
}

function FilterChip({ item, active, onPress, language }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text numberOfLines={1} style={[styles.filterTitle, active && styles.filterTitleActive]}>
        {pickLocalizedText(item.label, language)}
      </Text>
    </Pressable>
  );
}

export default function ShopScreen() {
  const { language, isRTL, t } = useLocalization();
  const {
    products,
    selectedCategory,
    selectedAnimalType,
    selectedFoodFocus,
    clearCatalogFilters,
    setSelectedAnimalType,
    setSelectedFoodFocus,
    setSelectedCategory
  } = useContext(AppContext);
  const segmentCards = useMemo(() => buildSegmentCards(t), [t]);
  const typeCards = useMemo(() => buildTypeCards(t), [t]);

  const initialSegment = selectedAnimalType || 'all';
  const [selectedSegment, setSelectedSegment] = useState(initialSegment);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    setSelectedSegment(selectedAnimalType || 'all');
  }, [selectedAnimalType]);

  const currentSegment = useMemo(
    () => segmentCards.find((item) => item.id === selectedSegment) || segmentCards[0],
    [segmentCards, selectedSegment]
  );

  const currentType = useMemo(
    () => typeCards.find((item) => item.id === selectedType) || typeCards[0],
    [selectedType, typeCards]
  );

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSegment = currentSegment.match(product);
      const matchesType = currentType.match(product);
      const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
      const matchesFoodFocus = selectedFoodFocus
        ? product.animalType === selectedFoodFocus.replace('_food', '')
        : true;

      return matchesSegment && matchesType && matchesCategory && matchesFoodFocus;
    });
  }, [currentSegment, currentType, products, selectedCategory, selectedFoodFocus]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListHeaderComponent={
          <View>
            <ScreenHeader title={t('shop.title')} subtitle={t('shop.subtitle')} />

            <View style={styles.filterPanel}>
              <View style={[styles.filterPanelHeader, { flexDirection: getRowDirection(isRTL) }]}>
                <View style={[styles.filterSectionTitleWrap, { flexDirection: getRowDirection(isRTL) }]}>
                  <Ionicons name="paw-outline" size={16} color={colors.secondary} />
                  <Text style={[styles.rowLabel, styles.rowLabelCompact, { textAlign: getTextAlign(isRTL) }]}>
                    {t('shop.animalSection')}
                  </Text>
                </View>
                {(selectedCategory || selectedFoodFocus || selectedAnimalType) ? (
                  <Pressable
                    onPress={() => {
                      clearCatalogFilters();
                      setSelectedSegment('all');
                      setSelectedType('all');
                    }}
                    style={styles.resetChip}
                  >
                    <Text style={styles.resetChipText}>{language === 'ar' ? 'مسح' : 'Reset'}</Text>
                  </Pressable>
                ) : null}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.row, { flexDirection: getRowDirection(isRTL) }]}
              >
                {segmentCards.map((item) => (
                  <FilterChip
                    key={item.id}
                    item={item}
                    language={language}
                    active={selectedSegment === item.id}
                    onPress={() => {
                      setSelectedSegment(item.id);
                      setSelectedAnimalType(item.id === 'all' ? null : item.id);
                      if (item.id === 'all') {
                        setSelectedFoodFocus(null);
                        setSelectedCategory(null);
                      }
                      setSelectedType('all');
                    }}
                  />
                ))}
              </ScrollView>

              <View style={[styles.filterSectionTitleWrap, styles.productSectionTitle, { flexDirection: getRowDirection(isRTL) }]}>
                <Ionicons name="options-outline" size={16} color={colors.secondary} />
                <Text style={[styles.rowLabel, styles.rowLabelCompact, { textAlign: getTextAlign(isRTL) }]}>
                  {t('shop.productSection')}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.rowBottom, { flexDirection: getRowDirection(isRTL) }]}
              >
                {typeCards.map((item) => (
                  <FilterChip
                    key={item.id}
                    item={item}
                    language={language}
                    active={selectedType === item.id}
                    onPress={() => setSelectedType(item.id)}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>{t('shop.empty')}</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 160,
    paddingTop: 4
  },
  rowLabel: {
    color: colors.secondary,
    fontWeight: '900',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: typography.label
  },
  rowLabelCompact: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: typography.bodySm
  },
  filterPanel: {
    backgroundColor: '#F8FBF8',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  filterPanelHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  filterSectionTitleWrap: {
    alignItems: 'center',
    gap: 6
  },
  productSectionTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  row: {
    paddingBottom: 2,
    paddingHorizontal: 2,
    alignItems: 'center'
  },
  rowBottom: {
    paddingBottom: 2,
    paddingHorizontal: 2,
    alignItems: 'center'
  },
  filterChip: {
    minWidth: 78,
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary
  },
  filterTitle: {
    textAlign: 'center',
    color: colors.secondary,
    fontWeight: '800',
    fontSize: typography.bodySm,
    lineHeight: 18
  },
  filterTitleActive: {
    color: '#fff'
  },
  empty: {
    textAlign: 'center',
    color: colors.textSoft,
    marginTop: 32,
    fontSize: typography.body
  },
  resetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#EEF3F1'
  },
  resetChipText: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: typography.caption
  }
});
