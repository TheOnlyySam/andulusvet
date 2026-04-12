import React, { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatDate, getTextAlign } from '../utils/format';

export default function AdminVaccinesScreen() {
  const { vaccineBooks, isBooksLoading } = useContext(AppContext);
  const { language, isRTL, t } = useLocalization();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('admin.vaccinesTitle')} subtitle={t('admin.vaccinesSubtitle')} />
      <ScrollView contentContainerStyle={styles.content}>
        {isBooksLoading ? <Text style={[styles.emptyText, { textAlign: getTextAlign(isRTL) }]}>{t('common.loading')}</Text> : null}
        {!isBooksLoading && !vaccineBooks.length ? <Text style={[styles.emptyText, { textAlign: getTextAlign(isRTL) }]}>{t('admin.noVaccines')}</Text> : null}
        {vaccineBooks.map((book) => (
          <View key={book.id} style={styles.card}>
            <Text style={[styles.titleText, { textAlign: getTextAlign(isRTL) }]}>{book.client_name || book.clientName}</Text>
            <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{t('books.petName')}: {book.pet_name || book.petName}</Text>
            <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{t('books.location')}: {book.location}</Text>
            <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{t('books.vetName')}: {book.vet_name || book.vetName}</Text>
            <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{t('books.firstVisitDate')}: {formatDate(book.first_visit_date_iso || book.firstVisitDateIso, language)}</Text>
            <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{t('admin.recordsCount')}: {(book.records || []).length}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  content: { paddingBottom: 140 },
  emptyText: { color: colors.textSoft, fontSize: typography.body },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...shadows.card },
  titleText: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  lineText: { color: colors.text, marginTop: 6, fontSize: typography.bodySm }
});
