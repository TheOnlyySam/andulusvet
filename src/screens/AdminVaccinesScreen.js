import React, { useContext } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, formatDate, getTextAlign } from '../utils/format';

export default function AdminVaccinesScreen() {
  const { vaccineBooks, isBooksLoading, markVaccineBookPaid, VACCINE_BOOK_PRICE_IQD } = useContext(AppContext);
  const { language, isRTL, t } = useLocalization();

  const markPaid = async (bookId) => {
    const result = await markVaccineBookPaid(bookId);
    if (!result.ok) {
      Alert.alert(t('alerts.error'), result.message || t('alerts.error'));
      return;
    }
    Alert.alert(t('alerts.success'), t('admin.requestPaid'));
  };

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
            <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{t('books.bookCount')}: {book.bookCount || book.book_count || 1}</Text>
            <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{t('books.bookFee')}: {formatCurrency(book.paymentAmountIqd || book.payment_amount_iqd || VACCINE_BOOK_PRICE_IQD, language)}</Text>
            <Text style={[styles.statusText, { textAlign: getTextAlign(isRTL) }]}>
              {t('books.requestStatus')}: {(book.approvalStatus || book.approval_status) === 'pending' ? t('books.statusPending') : t('books.statusApproved')}
            </Text>
            <Text style={[styles.statusText, { textAlign: getTextAlign(isRTL) }]}>
              {t('books.paymentStatus')}: {(book.paymentStatus || book.payment_status) === 'paid' ? t('books.statusPaid') : t('books.statusUnpaid')}
            </Text>
            {(book.paymentStatus || book.payment_status) !== 'paid' ? (
              <TouchableOpacity style={styles.approveBtn} onPress={() => markPaid(book.id)}>
                <Text style={styles.approveBtnTxt}>{t('admin.markPaid')}</Text>
              </TouchableOpacity>
            ) : null}
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
  lineText: { color: colors.text, marginTop: 6, fontSize: typography.bodySm },
  statusText: { color: colors.secondary, marginTop: spacing.sm, fontSize: typography.bodySm, fontWeight: '800' },
  approveBtn: { marginTop: spacing.sm, borderRadius: radius.md, backgroundColor: colors.secondary, alignItems: 'center', paddingVertical: 11 },
  approveBtnTxt: { color: '#fff', fontWeight: '900', fontSize: typography.caption }
});
