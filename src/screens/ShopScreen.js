import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { products } from '../data/mockData';
import { colors } from '../theme/colors';

const segmentCards = [
  {
    id: 'kitten',
    label: 'قطط صغيرة',
    subtitle: 'مرحلة النمو',
    match: (p) => p.animalType === 'cat' && p.lifeStage === 'kitten'
  },
  {
    id: 'cat',
    label: 'قطط بالغة',
    subtitle: 'مرحلة البلوغ',
    match: (p) => p.animalType === 'cat' && p.lifeStage === 'cat'
  },
  {
    id: 'puppy',
    label: 'جراء',
    subtitle: 'مرحلة النمو',
    match: (p) => p.animalType === 'dog' && p.lifeStage === 'puppy'
  },
  {
    id: 'dog',
    label: 'كلاب بالغة',
    subtitle: 'مرحلة البلوغ',
    match: (p) => p.animalType === 'dog' && p.lifeStage === 'dog'
  },
  {
    id: 'horse',
    label: 'خيول',
    subtitle: 'كل المراحل',
    match: (p) => p.animalType === 'horse'
  },
  {
    id: 'cattle',
    label: 'مواشي',
    subtitle: 'كل المراحل',
    match: (p) => p.animalType === 'cattle'
  }
];

const typeCards = [
  { id: 'all', label: 'كل الأصناف', match: () => true },
  { id: 'dry', label: 'أكل جاف', match: (p) => p.categoryId === 'c1' },
  { id: 'wet', label: 'أكل رطب', match: (p) => p.categoryId === 'c2' },
  { id: 'litter', label: 'رمل قطط', match: (p) => p.categoryId === 'c4' && p.animalType === 'cat' },
  { id: 'toys', label: 'ألعاب', match: (p) => p.categoryId === 'c4' },
  { id: 'accessories', label: 'إكسسوارات', match: (p) => p.categoryId === 'c4' },
  { id: 'offers', label: 'عروض', match: (p) => p.price <= 18000 }
];

function FilterChip({ item, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text allowFontScaling={false} numberOfLines={1} style={[styles.filterTitle, active && styles.filterTitleActive]}>
        {item.label}
      </Text>
      {item.subtitle ? (
        <Text allowFontScaling={false} numberOfLines={1} style={[styles.filterSub, active && styles.filterSubActive]}>
          {item.subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Header({ selectedSegment, setSelectedSegment, selectedType, setSelectedType }) {
  return (
    <View>
      <Text style={styles.title}>المتجر</Text>
      <Text style={styles.subtitle}>اختر فئة الحيوان ثم صنف المنتج</Text>

      <Text style={styles.rowLabel}>فئة الحيوان</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {segmentCards.map((item) => (
          <FilterChip
            key={item.id}
            item={item}
            active={selectedSegment === item.id}
            onPress={() => {
              setSelectedSegment(item.id);
              setSelectedType('all');
            }}
          />
        ))}
      </ScrollView>

      <Text style={styles.rowLabel}>صنف المنتج</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowBottom}>
        {typeCards.map((item) => (
          <FilterChip
            key={item.id}
            item={item}
            active={selectedType === item.id}
            onPress={() => setSelectedType(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default function ShopScreen() {
  const [selectedSegment, setSelectedSegment] = useState('kitten');
  const [selectedType, setSelectedType] = useState('all');

  const currentSegment = useMemo(
    () => segmentCards.find((item) => item.id === selectedSegment) || segmentCards[0],
    [selectedSegment]
  );

  const currentType = useMemo(
    () => typeCards.find((item) => item.id === selectedType) || typeCards[0],
    [selectedType]
  );

  const visibleProducts = useMemo(() => {
    return products.filter((p) => currentSegment.match(p) && currentType.match(p));
  }, [currentSegment, currentType]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListHeaderComponent={
          <Header
            selectedSegment={selectedSegment}
            setSelectedSegment={setSelectedSegment}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد منتجات في هذا التصنيف حاليًا.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 150,
    paddingTop: 4
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.secondary,
    textAlign: 'right'
  },
  subtitle: {
    marginTop: 5,
    marginBottom: 8,
    color: colors.muted,
    textAlign: 'right'
  },
  rowLabel: {
    textAlign: 'right',
    color: colors.secondary,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 4
  },
  row: {
    paddingBottom: 8,
    paddingHorizontal: 2,
    flexDirection: 'row-reverse',
    alignItems: 'center'
  },
  rowBottom: {
    paddingBottom: 10,
    paddingHorizontal: 2,
    flexDirection: 'row-reverse',
    alignItems: 'center'
  },
  filterChip: {
    minWidth: 100,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
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
    fontWeight: '900',
    fontSize: 13,
    lineHeight: 16
  },
  filterTitleActive: {
    color: '#fff'
  },
  filterSub: {
    textAlign: 'center',
    color: colors.muted,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 13,
    marginTop: 2
  },
  filterSubActive: {
    color: '#dbe3ff'
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 32
  }
});
