import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandLogo from './BrandLogo';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { APP_ROUTES } from '../constants/navigation';
import { colors, radius, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign } from '../utils/format';

export default function ScreenHeader({ title, subtitle, showLanguage = true }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { unreadNotificationsCount } = React.useContext(AppContext);
  const { isRTL, language, setLanguage, t } = useLocalization();

  return (
    <View style={[styles.wrap, { paddingTop: Platform.OS === 'android' ? Math.max(insets.top, spacing.md) : spacing.sm }]}>
      <View style={[styles.topRow, { flexDirection: getRowDirection(isRTL) }]}>
        <BrandLogo compact />
        <View style={[styles.actionsRow, { flexDirection: getRowDirection(isRTL) }]}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate(APP_ROUTES.notifications)}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.secondary} />
            {unreadNotificationsCount ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotificationsCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          {showLanguage ? (
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            >
              <Ionicons name="language" size={16} color={colors.secondary} />
              <Text style={styles.languageText}>
                {language === 'ar' ? t('common.english') : t('common.arabic')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <Text style={[styles.title, { textAlign: getTextAlign(isRTL) }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { textAlign: getTextAlign(isRTL) }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  actionsRow: {
    alignItems: 'center',
    gap: 10
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    minWidth: 124,
    justifyContent: 'center'
  },
  languageText: {
    color: colors.secondary,
    fontSize: typography.bodySm,
    fontWeight: '800'
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationBadgeText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '900'
  },
  title: {
    color: colors.secondary,
    fontSize: typography.hero,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: typography.body,
    marginTop: 8,
    lineHeight: 24
  }
});
