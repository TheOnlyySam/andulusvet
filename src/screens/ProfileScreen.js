import React, { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { APP_ROUTES } from '../constants/navigation';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign } from '../utils/format';

function ActionCard({ title, subtitle, icon, onPress, tone = 'light', isRTL }) {
  const toneStyle = tone === 'dark' ? styles.actionCardDark : styles.actionCardLight;
  const titleStyle = tone === 'dark' ? styles.actionTitleDark : styles.actionTitle;
  const subtitleStyle = tone === 'dark' ? styles.actionSubtitleDark : styles.actionSubtitle;

  return (
    <Pressable style={[styles.actionCard, toneStyle]} onPress={onPress}>
      <View style={[styles.actionHeader, { flexDirection: getRowDirection(isRTL) }]}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={tone === 'dark' ? '#fff' : colors.secondary} />
        </View>
        <Ionicons name="chevron-forward" size={18} color={tone === 'dark' ? '#fff' : colors.secondary} />
      </View>
      <Text style={[titleStyle, { textAlign: getTextAlign(isRTL) }]}>{title}</Text>
      <Text style={[subtitleStyle, { textAlign: getTextAlign(isRTL) }]}>{subtitle}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const { isReady, isLoggedIn, isAdmin, currentUser, currentProfile, authSignOut } = useContext(AppContext);
  const { isRTL, t } = useLocalization();

  const welcomeName =
    currentProfile?.display_name || currentProfile?.username || currentUser?.email?.split('@')[0] || t('profile.guestName');

  const logout = async () => {
    await authSignOut();
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title={t('profile.title')} subtitle={t('common.loading')} showLanguage />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.lg }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={t('profile.title')} subtitle={t('profile.accountSubtitle')} showLanguage />

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={[styles.kicker, { textAlign: getTextAlign(isRTL) }]}>{t('profile.welcome')}</Text>
          <Text style={[styles.heroTitle, { textAlign: getTextAlign(isRTL) }]}>{welcomeName}</Text>
          <Text style={[styles.heroSubtitle, { textAlign: getTextAlign(isRTL) }]}>
            {isLoggedIn ? t('profile.accountReady') : t('profile.guestSubtitle')}
          </Text>
          {currentUser?.email ? (
            <View style={styles.emailPill}>
              <Ionicons name="mail-outline" size={15} color={colors.secondary} />
              <Text style={styles.emailPillText}>{currentUser.email}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.grid}>
          {isLoggedIn ? (
            <>
              {isAdmin ? (
                <ActionCard
                  title={t('profile.adminPanel')}
                  subtitle={t('profile.adminPanelHint')}
                  icon="shield-checkmark-outline"
                  onPress={() => navigation.navigate(APP_ROUTES.adminHome)}
                  tone="dark"
                  isRTL={isRTL}
                />
              ) : null}
              <ActionCard
                title={t('profile.privacyPolicy')}
                subtitle={t('profile.privacyHint')}
                icon="document-text-outline"
                onPress={() => navigation.navigate(APP_ROUTES.privacyPolicy)}
                isRTL={isRTL}
              />
              <ActionCard
                title={t('profile.termsOfService')}
                subtitle={t('profile.termsHint')}
                icon="reader-outline"
                onPress={() => navigation.navigate(APP_ROUTES.termsOfService)}
                isRTL={isRTL}
              />
            </>
          ) : (
            <>
              <ActionCard
                title={t('profile.signIn')}
                subtitle={t('profile.signInSubtitle')}
                icon="log-in-outline"
                onPress={() => navigation.navigate(APP_ROUTES.signIn)}
                tone="dark"
                isRTL={isRTL}
              />
              <ActionCard
                title={t('profile.signUp')}
                subtitle={t('profile.signUpSubtitle')}
                icon="person-add-outline"
                onPress={() => navigation.navigate(APP_ROUTES.signUp)}
                isRTL={isRTL}
              />
              <ActionCard
                title={t('profile.privacyPolicy')}
                subtitle={t('profile.privacyHint')}
                icon="document-text-outline"
                onPress={() => navigation.navigate(APP_ROUTES.privacyPolicy)}
                isRTL={isRTL}
              />
              <ActionCard
                title={t('profile.termsOfService')}
                subtitle={t('profile.termsHint')}
                icon="reader-outline"
                onPress={() => navigation.navigate(APP_ROUTES.termsOfService)}
                isRTL={isRTL}
              />
            </>
          )}
        </View>

        {isLoggedIn ? (
          <View style={styles.accountCard}>
            <Text style={[styles.accountTitle, { textAlign: getTextAlign(isRTL) }]}>{t('profile.accountDetails')}</Text>
            <Text style={[styles.accountLine, { textAlign: getTextAlign(isRTL) }]}>
              {t('profile.displayName')}: {welcomeName}
            </Text>
            <Text style={[styles.accountLine, { textAlign: getTextAlign(isRTL) }]}>
              {t('profile.email')}: {currentUser?.email}
            </Text>
            <Text style={[styles.accountLine, { textAlign: getTextAlign(isRTL) }]}>
              {t('profile.role')}: {isAdmin ? t('profile.admin') : t('profile.customer')}
            </Text>
            <Pressable style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>{t('profile.logout')}</Text>
            </Pressable>
          </View>
        ) : null}
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
    paddingBottom: spacing.xxl
  },
  heroCard: {
    backgroundColor: colors.secondary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    ...shadows.card
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(243, 201, 119, 0.2)',
    top: -50,
    right: -35
  },
  kicker: {
    color: '#DDEDEA',
    fontSize: typography.bodySm,
    fontWeight: '800'
  },
  heroTitle: {
    color: '#fff',
    fontSize: typography.hero,
    fontWeight: '900',
    marginTop: spacing.sm
  },
  heroSubtitle: {
    color: '#DDEDEA',
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.sm
  },
  emailPill: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  emailPillText: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: typography.bodySm
  },
  grid: {
    marginTop: spacing.md,
    gap: spacing.md
  },
  actionCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card
  },
  actionCardLight: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border
  },
  actionCardDark: {
    backgroundColor: colors.primaryDeep
  },
  actionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTitle: {
    color: colors.secondary,
    fontSize: typography.h3,
    fontWeight: '900'
  },
  actionTitleDark: {
    color: '#fff',
    fontSize: typography.h3,
    fontWeight: '900'
  },
  actionSubtitle: {
    color: colors.textSoft,
    fontSize: typography.bodySm,
    lineHeight: 21,
    marginTop: 6
  },
  actionSubtitleDark: {
    color: '#DDEDEA',
    fontSize: typography.bodySm,
    lineHeight: 21,
    marginTop: 6
  },
  accountCard: {
    marginTop: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  accountTitle: {
    color: colors.secondary,
    fontSize: typography.h3,
    fontWeight: '900',
    marginBottom: spacing.md
  },
  accountLine: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.sm
  },
  logoutButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontSize: typography.button,
    fontWeight: '900'
  }
});
