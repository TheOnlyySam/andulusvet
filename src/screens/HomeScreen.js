import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign } from '../utils/format';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { t, isRTL } = useLocalization();
  const introAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const quickActions = [
    {
      id: 'books',
      title: t('home.cards.booksTitle'),
      subtitle: t('home.cards.booksSubtitle'),
      icon: 'book-outline',
      accent: colors.accentSoft,
      screen: t('nav.books')
    },
    {
      id: 'shop',
      title: t('home.cards.shopTitle'),
      subtitle: t('home.cards.shopSubtitle'),
      icon: 'storefront-outline',
      accent: colors.accentSoft,
      screen: t('nav.shop')
    },
    {
      id: 'categories',
      title: t('home.cards.categoriesTitle'),
      subtitle: t('home.cards.categoriesSubtitle'),
      icon: 'paw-outline',
      accent: colors.accentSoft,
      screen: t('nav.categories')
    },
    {
      id: 'cart',
      title: t('home.cards.cartTitle'),
      subtitle: t('home.cards.cartSubtitle'),
      icon: 'cart-outline',
      accent: colors.accentSoft,
      screen: t('nav.cart')
    }
  ];

  useEffect(() => {
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [floatAnim, introAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={t('nav.home')}
          subtitle={t('common.clinicSubtitle')}
          showLanguage
        />

        <Animated.View
          style={[
            styles.hero,
            {
              opacity: introAnim,
              transform: [
                {
                  translateY: introAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.heroGlowPrimary} />
          <View style={styles.heroGlowSecondary} />
          <Animated.View
            style={[
              styles.floatingBadge,
              {
                transform: [
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -8]
                    })
                  }
                ]
              }
            ]}
          >
            <Ionicons name="paw" size={18} color={colors.secondary} />
            <Text style={styles.floatingText}>Care</Text>
          </Animated.View>

          <Text style={[styles.heroTitle, { textAlign: getTextAlign(isRTL) }]}>{t('home.heroTitle')}</Text>
          <Text style={[styles.heroSubtitle, { textAlign: getTextAlign(isRTL) }]}>{t('home.heroSubtitle')}</Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate(t('nav.books'))}>
            <Text style={styles.heroBtnTxt}>{t('home.heroCta')}</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.bookFeature}
          onPress={() => navigation.navigate(t('nav.books'))}
          activeOpacity={0.88}
        >
          <View style={[styles.bookFeatureRow, { flexDirection: getRowDirection(isRTL) }]}>
            <View style={styles.bookFeatureIcon}>
              <Ionicons name="book" size={30} color={colors.primaryDark} />
            </View>
            <View style={styles.bookFeatureCopy}>
              <Text style={[styles.bookFeatureTitle, { textAlign: getTextAlign(isRTL) }]}>{t('home.cards.booksTitle')}</Text>
              <Text style={[styles.bookFeatureSubtitle, { textAlign: getTextAlign(isRTL) }]}>{t('home.cards.booksSubtitle')}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={25} color={colors.primaryDark} />
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('home.quickTitle')}</Text>

        <View style={styles.grid}>
          {quickActions.filter((item) => item.id !== 'books').map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.actionCard, { backgroundColor: item.accent }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.9}
            >
              <View style={[styles.cardTopRow, { flexDirection: getRowDirection(isRTL) }]}>
                <View style={styles.iconWrap}>
                  <Ionicons name={item.icon} size={22} color={colors.secondary} />
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
              </View>
              <Text style={[styles.cardTitle, { textAlign: getTextAlign(isRTL) }]}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, { textAlign: getTextAlign(isRTL) }]}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.highlight}>
          <View style={[styles.highlightRow, { flexDirection: getRowDirection(isRTL) }]}>
            <View style={styles.highlightIcon}>
              <Ionicons name="medkit-outline" size={20} color="#fff" />
            </View>
            <Text style={[styles.highlightTitle, { textAlign: getTextAlign(isRTL) }]}>
              {t('home.highlightTitle')}
            </Text>
          </View>
          <Text style={[styles.highlightText, { textAlign: getTextAlign(isRTL) }]}>
            {t('home.highlightText')}
          </Text>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate(t('nav.profile'))}>
            <Text style={styles.secondaryBtnTxt}>{t('home.manageAccount')}</Text>
          </TouchableOpacity>
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
    paddingBottom: 120
  },
  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    ...shadows.card
  },
  heroGlowPrimary: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(108, 197, 199, 0.30)',
    top: -54,
    left: -24
  },
  heroGlowSecondary: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    bottom: -50,
    right: -24
  },
  floatingBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.md
  },
  floatingText: {
    color: colors.secondary,
    fontWeight: '800'
  },
  heroTitle: {
    color: '#fff',
    fontSize: typography.hero,
    fontWeight: '900',
    lineHeight: 40
  },
  heroSubtitle: {
    color: '#E7F3EE',
    fontSize: typography.body,
    marginTop: 10,
    lineHeight: 23
  },
  heroBtn: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12
  },
  heroBtnTxt: {
    color: colors.secondary,
    fontWeight: '900',
    fontSize: typography.bodySm
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: typography.h2,
    fontWeight: '900',
    marginTop: spacing.xl,
    marginBottom: spacing.md
  },
  bookFeature: {
    marginTop: spacing.lg,
    minHeight: 126,
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card
  },
  bookFeatureRow: {
    alignItems: 'center',
    gap: spacing.md
  },
  bookFeatureIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bookFeatureCopy: { flex: 1 },
  bookFeatureTitle: {
    color: colors.primaryDark,
    fontSize: typography.h2,
    fontWeight: '900',
    marginBottom: 5
  },
  bookFeatureSubtitle: {
    color: colors.primaryDark,
    fontSize: typography.bodySm,
    lineHeight: 21
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md
  },
  actionCard: {
    width: '48.5%',
    minHeight: 160,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15,31,45,0.08)',
    ...shadows.soft
  },
  cardTopRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFFC8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    color: colors.secondary,
    fontWeight: '900',
    fontSize: typography.h3,
    marginBottom: 6
  },
  cardSubtitle: {
    color: colors.textSoft,
    fontSize: typography.bodySm,
    lineHeight: 20
  },
  highlight: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  highlightRow: {
    alignItems: 'center',
    gap: spacing.sm
  },
  highlightIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center'
  },
  highlightTitle: {
    flex: 1,
    color: colors.secondary,
    fontSize: typography.h3,
    fontWeight: '900'
  },
  highlightText: {
    color: colors.textSoft,
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.md
  },
  secondaryBtn: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12
  },
  secondaryBtnTxt: {
    color: colors.secondary,
    fontWeight: '800'
  }
});
