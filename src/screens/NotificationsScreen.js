import React, { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatDate, getTextAlign, pickLocalizedText } from '../utils/format';

export default function NotificationsScreen() {
  const { notifications, markAllNotificationsAsRead } = useContext(AppContext);
  const { language, isRTL, t } = useLocalization();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('notifications.title')} subtitle={t('notifications.subtitle')} />
      <TouchableOpacity style={styles.markReadBtn} onPress={markAllNotificationsAsRead}>
        <Text style={styles.markReadText}>{t('notifications.markAllRead')}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!notifications.length ? (
          <View style={styles.emptyCard}>
            <Text style={[styles.emptyText, { textAlign: getTextAlign(isRTL) }]}>{t('notifications.empty')}</Text>
          </View>
        ) : null}
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={[styles.titleText, { textAlign: getTextAlign(isRTL) }]}>
              {pickLocalizedText(item.title, language)}
            </Text>
            <Text style={[styles.messageText, { textAlign: getTextAlign(isRTL) }]}>
              {pickLocalizedText(item.message, language)}
            </Text>
            <Text style={[styles.dateText, { textAlign: getTextAlign(isRTL) }]}>
              {formatDate(item.createdAt || item.created_at, language)}
            </Text>
          </View>
        ))}
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
  markReadBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF3F1',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginBottom: spacing.md
  },
  markReadText: {
    color: colors.secondary,
    fontWeight: '800'
  },
  content: {
    paddingBottom: 120
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: typography.body
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  titleText: {
    color: colors.secondary,
    fontSize: typography.h3,
    fontWeight: '900'
  },
  messageText: {
    color: colors.text,
    marginTop: 6,
    fontSize: typography.body,
    lineHeight: 23
  },
  dateText: {
    color: colors.textSoft,
    marginTop: spacing.sm,
    fontSize: typography.caption
  }
});
