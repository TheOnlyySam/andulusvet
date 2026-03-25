import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export default function HomeScreen() {
  const navigation = useNavigation();
  const introAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;

  const quickActions = [
    { id: 'vaccines', title: 'دفاتر اللقاحات', subtitle: 'إضافة دفاتر وتحديث الجرعات', icon: 'medkit', screen: 'الحيوانات واللقاحات', bg: '#e9f2ff' },
    { id: 'shop', title: 'المتجر', subtitle: 'منتجات ورعاية يومية', icon: 'storefront', screen: 'المتجر', bg: '#fff1dc' },
    { id: 'cats', title: 'التصنيفات', subtitle: 'تصفية حسب النوع والاحتياج', icon: 'grid', screen: 'التصنيفات', bg: '#f2edff' },
    { id: 'cart', title: 'السلة', subtitle: 'حجز وإرسال الطلب', icon: 'cart', screen: 'السلة', bg: '#e8fbef' }
  ];
  const bannerItems = [...quickActions, ...quickActions];

  useEffect(() => {
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 950, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 950, useNativeDriver: true })
      ])
    );
    pulseLoop.start();

    const bannerLoop = Animated.loop(
      Animated.timing(bannerAnim, {
        toValue: -420,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    bannerLoop.start();

    return () => {
      pulseLoop.stop();
      bannerLoop.stop();
    };
  }, [bannerAnim, introAnim, pulseAnim]);

  const introStyle = {
    opacity: introAnim,
    transform: [
      {
        translateY: introAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0]
        })
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.hero, introStyle]}>
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          <Text style={styles.title}>مجموعة الاندلس البيطرية</Text>
          <Text style={styles.subtitle}>منصة بسيطة وذكية لمتابعة حيوانك خطوة بخطوة</Text>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('الحيوانات واللقاحات')}>
              <Text style={styles.heroBtnTxt}>ابدأ دفتر لقاحات جديد</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <View style={styles.bannerWrap}>
          <Animated.View style={[styles.bannerTrack, { transform: [{ translateX: bannerAnim }] }]}>
            {bannerItems.map((item, index) => (
              <TouchableOpacity
                key={`${item.id}_${index}`}
                style={styles.bannerChip}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.88}
              >
                <Ionicons name={item.icon} size={16} color={colors.secondary} />
                <Text style={styles.bannerChipText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>الوصول السريع</Text>
        </View>

        <View style={styles.grid}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.actionCard, { backgroundColor: item.bg }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.9}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={24} color={colors.secondary} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.highlight}>
          <Text style={styles.highlightTitle}>رحلة أوضح لصحة الحيوان</Text>
          <Text style={styles.highlightText}>وثّق اللقاحات، أضف الملاحظات والمرفقات، وصدّر دفتر كامل PDF بسهولة.</Text>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('حسابي')}>
            <Text style={styles.secondaryBtnTxt}>إدارة الحساب</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 14
  },
  content: {
    paddingBottom: 110
  },
  hero: {
    backgroundColor: colors.secondary,
    borderRadius: 24,
    padding: 18,
    marginTop: 6,
    overflow: 'hidden'
  },
  heroBlob1: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(248,232,69,0.3)',
    top: -44,
    left: -44
  },
  heroBlob2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.18)',
    bottom: -56,
    right: -24
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'right'
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: '#e4ebff',
    textAlign: 'right',
    fontWeight: '600'
  },
  heroBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center'
  },
  heroBtnTxt: {
    color: '#1a2e62',
    fontWeight: '900'
  },
  bannerWrap: {
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dfe6fb',
    backgroundColor: '#f6f9ff',
    paddingVertical: 9,
    overflow: 'hidden'
  },
  bannerTrack: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10
  },
  bannerChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dae3fa',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  bannerChipText: {
    color: colors.secondary,
    fontWeight: '800'
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8
  },
  sectionTitle: {
    textAlign: 'right',
    color: colors.secondary,
    fontSize: 20,
    fontWeight: '900'
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10
  },
  actionCard: {
    width: '48.7%',
    minHeight: 135,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8fa'
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffffcc',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 8
  },
  cardTitle: {
    textAlign: 'right',
    color: colors.secondary,
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 4
  },
  cardSubtitle: {
    textAlign: 'right',
    color: '#3f4b6d',
    lineHeight: 20,
    fontWeight: '600'
  },
  highlight: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14
  },
  highlightTitle: {
    textAlign: 'right',
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6
  },
  highlightText: {
    textAlign: 'right',
    color: '#465373',
    fontWeight: '600',
    marginBottom: 12
  },
  secondaryBtn: {
    borderRadius: 12,
    backgroundColor: '#ecf1ff',
    paddingVertical: 10,
    alignItems: 'center'
  },
  secondaryBtnTxt: {
    color: colors.secondary,
    fontWeight: '900'
  }
});
