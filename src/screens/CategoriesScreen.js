import React, { useContext, useMemo } from 'react';
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BrandChip from '../components/BrandChip';
import { AppContext } from '../context/AppContext';
import { animalTypes, categories, detailedFoodCategories } from '../data/mockData';
import { colors } from '../theme/colors';

export default function CategoriesScreen() {
  const navigation = useNavigation();
  const {
    selectedCategory,
    setSelectedCategory,
    selectedAnimalType,
    setSelectedAnimalType,
    setSelectedFoodFocus,
    setSelectedLifeStage
  } = useContext(AppContext);

  const visibleCategories = useMemo(() => {
    if (!selectedAnimalType) return categories;
    return categories.filter((cat) => cat.animalTypes.includes(selectedAnimalType));
  }, [selectedAnimalType]);

  const visibleDetailedFood = useMemo(() => {
    if (!selectedAnimalType) return detailedFoodCategories;
    return detailedFoodCategories.filter((d) => d.animalType === selectedAnimalType);
  }, [selectedAnimalType]);

  const pickCategory = (id) => {
    setSelectedCategory(id);
    setSelectedFoodFocus(null);
    navigation.navigate('المتجر');
  };

  const pickDetailedFood = (focusId, animalId) => {
    setSelectedFoodFocus(focusId);
    setSelectedAnimalType(animalId);
    setSelectedCategory(null);
    setSelectedLifeStage(null);
    navigation.navigate('المتجر');
  };

  const animalItems = [
    { id: 'all', name: 'الكل' },
    ...animalTypes.map((item) => ({ id: item.id, name: item.name }))
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>التصنيفات</Text>
      <Text style={styles.subtitle}>اختر نوع الحيوان ثم تصنيف عام أو تصنيف غذاء تفصيلي</Text>

      <FlatList
        horizontal
        inverted
        data={animalItems}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.animalRow}
        renderItem={({ item }) => {
          const active = item.id === 'all' ? !selectedAnimalType : selectedAnimalType === item.id;
          return (
            <BrandChip
              label={item.name}
              active={active}
              onPress={() => {
                setSelectedAnimalType(item.id === 'all' ? null : item.id);
                setSelectedLifeStage(null);
              }}
            />
          );
        }}
      />

      <Text style={styles.sectionTitle}>تصنيفات غذاء تفصيلية</Text>
      <FlatList
        horizontal
        inverted
        data={visibleDetailedFood}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => pickDetailedFood(item.id, item.animalType)}
            style={styles.detailWrap}
            activeOpacity={0.9}
          >
            <ImageBackground source={{ uri: item.image }} style={styles.detailCard} imageStyle={styles.detailImage}>
              <View style={styles.detailOverlay}>
                <Text style={styles.detailName}>{item.name}</Text>
                <Text style={styles.detailHint}>ثم اختر kitten/cat أو puppy/dog في المتجر</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>التصنيفات العامة</Text>
      <FlatList
        data={visibleCategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 130, paddingTop: 8 }}
        renderItem={({ item }) => {
          const active = selectedCategory === item.id;
          return (
            <TouchableOpacity onPress={() => pickCategory(item.id)} style={styles.cardWrap} activeOpacity={0.9}>
              <ImageBackground source={{ uri: item.image }} style={styles.card} imageStyle={styles.cardImage}>
                <View style={[styles.overlay, active && styles.overlayActive]}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardHint}>اضغط للعرض في المتجر</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد تصنيف لهذا النوع.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.secondary,
    textAlign: 'right',
    marginTop: 4
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 8,
    color: colors.muted,
    textAlign: 'right'
  },
  sectionTitle: {
    textAlign: 'right',
    color: colors.secondary,
    fontWeight: '900',
    marginTop: 8
  },
  animalRow: {
    paddingVertical: 8,
    paddingHorizontal: 2
  },
  detailWrap: {
    width: 240,
    marginLeft: 10
  },
  detailCard: {
    height: 110,
    justifyContent: 'flex-end'
  },
  detailImage: {
    borderRadius: 14
  },
  detailOverlay: {
    backgroundColor: 'rgba(34,62,140,0.55)',
    borderRadius: 14,
    padding: 10
  },
  detailName: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 18,
    fontWeight: '900'
  },
  detailHint: {
    color: '#fff',
    textAlign: 'right',
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700'
  },
  cardWrap: {
    marginBottom: 10
  },
  card: {
    height: 120,
    justifyContent: 'flex-end'
  },
  cardImage: {
    borderRadius: 16
  },
  overlay: {
    backgroundColor: 'rgba(34,62,140,0.45)',
    borderRadius: 16,
    padding: 12
  },
  overlayActive: {
    backgroundColor: 'rgba(249,168,37,0.72)'
  },
  cardName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'right'
  },
  cardHint: {
    color: '#fff',
    textAlign: 'right',
    marginTop: 4,
    fontWeight: '700'
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 36
  }
});
