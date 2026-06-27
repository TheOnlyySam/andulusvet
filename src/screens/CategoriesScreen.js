import React, { useContext, useMemo } from 'react';
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BrandChip from '../components/BrandChip';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { getAnimalTypes, getCategories, getDetailedFoodCategories } from '../services/catalogService';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

const animalTypes = getAnimalTypes();
const categories = getCategories();
const detailedFoodCategories = getDetailedFoodCategories();

const animalIcons = {
  all: 'apps-outline',
  cat: 'logo-octocat',
  dog: 'paw-outline',
  bird: 'leaf-outline',
  horse: 'flag-outline',
  cattle: 'nutrition-outline'
};

export default function CategoriesScreen() {
  const navigation = useNavigation();
  const { language, isRTL, t } = useLocalization();
  const {
    selectedCategory,
    setSelectedCategory,
    selectedAnimalType,
    setSelectedAnimalType,
    setSelectedFoodFocus,
    setSelectedLifeStage,
    clearCatalogFilters
  } = useContext(AppContext);

  const visibleCategories = useMemo(() => {
    if (!selectedAnimalType) return categories;
    return categories.filter((category) => category.animalTypes.includes(selectedAnimalType));
  }, [selectedAnimalType]);

  const visibleDetailedFood = useMemo(() => {
    if (!selectedAnimalType) return detailedFoodCategories;
    return detailedFoodCategories.filter((item) => item.animalType === selectedAnimalType);
  }, [selectedAnimalType]);

  const animalItems = useMemo(
    () => [{ id: 'all', name: { ar: 'الكل', en: 'All' } }, ...animalTypes.map((item) => ({ id: item.id, name: item.name }))],
    []
  );

  const selectAnimal = (animalId) => {
    if (animalId === 'all') {
      clearCatalogFilters();
    } else {
      setSelectedAnimalType(animalId);
      setSelectedCategory(null);
      setSelectedFoodFocus(null);
      setSelectedLifeStage(null);
    }
  };

  const pickCategory = (id) => {
    setSelectedCategory(id);
    setSelectedFoodFocus(null);
    navigation.navigate(t('nav.shop'));
  };

  const pickDetailedFood = (focusId, animalId) => {
    setSelectedAnimalType(animalId);
    setSelectedFoodFocus(focusId);
    setSelectedCategory(null);
    setSelectedLifeStage(null);
    navigation.navigate(t('nav.shop'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={t('categories.title')} subtitle={t('categories.subtitle')} />

        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={[styles.heroTopRow, { flexDirection: getRowDirection(isRTL) }]}>
            <View style={styles.heroBadge}>
              <Ionicons name="grid-outline" size={18} color={colors.secondary} />
              <Text style={styles.heroBadgeText}>{language === 'ar' ? 'تصفح سريع' : 'Quick browse'}</Text>
            </View>
            {(selectedAnimalType || selectedCategory) ? (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => clearCatalogFilters()}
              >
                <Text style={styles.resetButtonText}>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={[styles.heroTitle, { textAlign: getTextAlign(isRTL) }]}>
            {language === 'ar' ? 'اختر الحيوان ثم افتح التصنيف المناسب مباشرة' : 'Choose the animal, then jump into the right category instantly'}
          </Text>
          <Text style={[styles.heroSubtitle, { textAlign: getTextAlign(isRTL) }]}>
            {language === 'ar'
              ? 'واجهة أوضح وأهدأ تشبه الصفحة الرئيسية، مع انتقالات نظيفة نحو المتجر.'
              : 'A calmer, clearer layout that matches the home screen and routes cleanly into the shop.'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>
          {language === 'ar' ? 'أنواع الحيوانات' : 'Animal Types'}
        </Text>
        <View style={[styles.chipWrap, { flexDirection: getRowDirection(isRTL) }]}>
          {animalItems.map((item) => {
            const active = item.id === 'all' ? !selectedAnimalType : selectedAnimalType === item.id;
            return (
              <View key={item.id} style={styles.chipHolder}>
                <BrandChip
                  label={pickLocalizedText(item.name, language)}
                  active={active}
                  onPress={() => selectAnimal(item.id)}
                />
              </View>
            );
          })}
        </View>

        {visibleDetailedFood.length ? (
          <>
            <View style={[styles.sectionHeaderRow, { flexDirection: getRowDirection(isRTL) }]}>
              <Text style={[styles.sectionTitle, styles.sectionTitleCompact, { textAlign: getTextAlign(isRTL) }]}>
                {t('categories.detailedFood')}
              </Text>
              <Ionicons name="nutrition-outline" size={20} color={colors.secondary} />
            </View>
            <View style={styles.topGrid}>
              {visibleDetailedFood.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => pickDetailedFood(item.id, item.animalType)}
                  style={styles.topGridItem}
                  activeOpacity={0.92}
                >
                  <ImageBackground source={{ uri: item.image }} style={styles.topCard} imageStyle={styles.topCardImage}>
                    <View style={styles.topCardOverlay}>
                      <Text style={[styles.topCardTitle, { textAlign: getTextAlign(isRTL) }]}>
                        {pickLocalizedText(item.name, language)}
                      </Text>
                      <Text style={[styles.topCardHint, { textAlign: getTextAlign(isRTL) }]}>
                        {t('categories.hint')}
                      </Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        <View style={[styles.sectionHeaderRow, { flexDirection: getRowDirection(isRTL) }]}>
          <Text style={[styles.sectionTitle, styles.sectionTitleCompact, { textAlign: getTextAlign(isRTL) }]}>
            {t('categories.general')}
          </Text>
          <Ionicons name="layers-outline" size={20} color={colors.secondary} />
        </View>

        {!visibleCategories.length ? (
          <Text style={[styles.empty, { textAlign: getTextAlign(isRTL) }]}>{t('categories.empty')}</Text>
        ) : null}

        <View style={styles.categoryStack}>
          {visibleCategories.map((item, index) => {
            const active = selectedCategory === item.id;
            const accentColors = ['rgba(108,197,199,0.92)', 'rgba(108,197,199,0.76)', 'rgba(108,197,199,0.60)'];
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => pickCategory(item.id)}
                style={styles.categoryCardWrap}
                activeOpacity={0.92}
              >
                <ImageBackground source={{ uri: item.image }} style={styles.categoryCard} imageStyle={styles.categoryCardImage}>
                  <View
                    style={[
                      styles.categoryOverlay,
                      { backgroundColor: active ? accentColors[index % accentColors.length] : 'rgba(15,31,45,0.56)' }
                    ]}
                  >
                    <View style={[styles.categoryIconPill, { flexDirection: getRowDirection(isRTL) }]}>
                      <Ionicons
                        name={animalIcons[selectedAnimalType || 'all'] || 'paw-outline'}
                        size={16}
                        color={colors.secondary}
                      />
                      <Text style={styles.categoryIconPillText}>
                        {selectedAnimalType ? pickLocalizedText(animalTypes.find((a) => a.id === selectedAnimalType)?.name, language) : pickLocalizedText({ ar: 'عام', en: 'General' }, language)}
                      </Text>
                    </View>
                    <Text style={[styles.categoryName, { textAlign: getTextAlign(isRTL) }]}>
                      {pickLocalizedText(item.name, language)}
                    </Text>
                    <Text style={[styles.categoryHint, { textAlign: getTextAlign(isRTL) }]}>
                      {t('categories.hint')}
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            );
          })}
        </View>
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
    paddingBottom: 132
  },
  heroCard: {
    backgroundColor: colors.secondary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.card
  },
  heroGlowOne: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(108,197,199,0.24)',
    top: -50,
    left: -28
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(255,255,255,0.12)',
    bottom: -44,
    right: -18
  },
  heroTopRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  heroBadgeText: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: typography.caption
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: typography.caption
  },
  heroTitle: {
    color: '#fff',
    fontSize: typography.h2,
    fontWeight: '900',
    lineHeight: 30
  },
  heroSubtitle: {
    color: '#E7F3EE',
    fontSize: typography.bodySm,
    lineHeight: 22,
    marginTop: spacing.sm
  },
  sectionHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: typography.h2,
    fontWeight: '900',
    marginBottom: spacing.sm
  },
  sectionTitleCompact: {
    marginBottom: 0
  },
  chipWrap: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
    marginBottom: spacing.md
  },
  chipHolder: {
    marginBottom: 8
  },
  topGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md
  },
  topGridItem: {
    width: '48.4%'
  },
  topCard: {
    minHeight: 152,
    justifyContent: 'flex-end'
  },
  topCardImage: {
    borderRadius: radius.lg
  },
  topCardOverlay: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(15,31,45,0.54)',
    minHeight: 152,
    justifyContent: 'flex-end'
  },
  topCardTitle: {
    color: '#fff',
    fontSize: typography.h2,
    fontWeight: '900'
  },
  topCardHint: {
    color: '#F2F8F5',
    fontSize: typography.bodySm,
    fontWeight: '700',
    marginTop: 4
  },
  categoryStack: {
    marginTop: 2
  },
  categoryCardWrap: {
    marginBottom: spacing.md
  },
  categoryCard: {
    minHeight: 178,
    justifyContent: 'flex-end'
  },
  categoryCardImage: {
    borderRadius: radius.xl
  },
  categoryOverlay: {
    minHeight: 178,
    borderRadius: radius.xl,
    padding: spacing.xl,
    justifyContent: 'flex-end'
  },
  categoryIconPill: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.lg
  },
  categoryIconPillText: {
    color: colors.secondary,
    fontSize: typography.caption,
    fontWeight: '800'
  },
  categoryName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900'
  },
  categoryHint: {
    color: '#fff',
    marginTop: 6,
    fontWeight: '700',
    fontSize: typography.body
  },
  empty: {
    color: colors.textSoft,
    fontSize: typography.body,
    marginTop: spacing.sm
  }
});
