import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { Text } from '../components/Typography';
import { AppContext } from '../context/AppContext';
import { useAppFeedback } from '../context/AppFeedbackContext';
import { useLocalization } from '../context/LocalizationContext';
import { fetchAdminPayments } from '../services/paymentRepository';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, formatDate, getTextAlign, pickLocalizedText } from '../utils/format';

function isPaidPayment(payment) {
  const status = String(payment.status || '').toUpperCase();
  return status === 'SUCCESS' || Boolean(payment.paid_at);
}

function getCheckoutValue(checkout, key) {
  if (!checkout || typeof checkout !== 'object') return '';
  return checkout[key] || '';
}

function normalizeCartItems(items) {
  return Array.isArray(items) ? items : [];
}

export default function AdminPaymentsScreen() {
  const { language, isRTL, t } = useLocalization();
  const { showAlert } = useAppFeedback();
  const { isAdmin } = useContext(AppContext);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const copy = {
    title: language === 'ar' ? 'المدفوعات' : 'Payments',
    subtitle: language === 'ar' ? 'تحقق من حالة مدفوعات الطلبات الإلكترونية' : 'Check online order payment status',
    empty: language === 'ar' ? 'لا توجد مدفوعات حالياً.' : 'No payments yet.',
    status: language === 'ar' ? 'الحالة' : 'Status',
    paid: language === 'ar' ? 'مدفوع' : 'Paid',
    unpaid: language === 'ar' ? 'غير مدفوع' : 'Unpaid',
    customer: language === 'ar' ? 'الزبون' : 'Customer',
    phone: language === 'ar' ? 'الهاتف' : 'Phone',
    paidAt: language === 'ar' ? 'وقت الدفع' : 'Paid at',
    items: language === 'ar' ? 'المنتجات' : 'Items',
    paymentId: language === 'ar' ? 'رقم الدفع' : 'Payment ID',
    cart: language === 'ar' ? 'طلب متجر' : 'Cart order',
    vaccine: language === 'ar' ? 'دفتر لقاحات' : 'Vaccine book'
  };

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await fetchAdminPayments();
      setPayments(next);
    } catch (error) {
      showAlert(t('alerts.error'), error.message || t('alerts.error'));
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, t]);

  useEffect(() => {
    if (isAdmin) loadPayments();
  }, [isAdmin, loadPayments]);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title={copy.title} subtitle={t('admin.noAccess')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={copy.title} subtitle={copy.subtitle} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadPayments} tintColor={colors.secondary} colors={[colors.secondary]} />}
      >
        {isLoading ? <ActivityIndicator color={colors.secondary} style={styles.loader} /> : null}
        {!isLoading && !payments.length ? (
          <Text style={[styles.emptyText, { textAlign: getTextAlign(isRTL) }]}>{copy.empty}</Text>
        ) : null}

        {payments.map((payment) => {
          const paid = isPaidPayment(payment);
          const checkout = payment.checkout_payload || {};
          const items = normalizeCartItems(payment.cart_payload);
          const statusLabel = paid ? copy.paid : copy.unpaid;
          const purposeLabel = payment.purpose === 'cart' ? copy.cart : copy.vaccine;

          return (
            <View key={payment.id} style={styles.card}>
              <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.cardTitleWrap}>
                  <Text style={[styles.titleText, { textAlign: getTextAlign(isRTL) }]}>{purposeLabel}</Text>
                  <Text style={[styles.metaText, { textAlign: getTextAlign(isRTL) }]}>{formatDate(payment.created_at, language)}</Text>
                </View>
                <View style={[styles.statusPill, paid ? styles.paidPill : styles.unpaidPill]}>
                  <Text style={[styles.statusPillText, paid ? styles.paidText : styles.unpaidText]}>{statusLabel}</Text>
                </View>
              </View>

              <Text style={[styles.amountText, { textAlign: getTextAlign(isRTL) }]}>
                {formatCurrency(payment.amount_iqd || 0, language)} {language === 'ar' ? 'د.ع' : 'IQD'}
              </Text>
              <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{copy.status}: {statusLabel}</Text>
              <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{copy.customer}: {getCheckoutValue(checkout, 'customerName') || '-'}</Text>
              <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{copy.phone}: {getCheckoutValue(checkout, 'phoneNumber1') || '-'}</Text>
              <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{copy.paymentId}: {payment.qi_payment_id || payment.id}</Text>
              <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{copy.paidAt}: {payment.paid_at ? formatDate(payment.paid_at, language) : '-'}</Text>

              {items.length ? (
                <View style={styles.itemsBox}>
                  <Text style={[styles.itemsTitle, { textAlign: getTextAlign(isRTL) }]}>{copy.items}</Text>
                  {items.map((item, index) => (
                    <Text key={`${payment.id}-${item.id || index}`} style={[styles.itemText, { textAlign: getTextAlign(isRTL) }]}>
                      {index + 1}. {pickLocalizedText(item.name, language) || item.displayName || '-'} x {item.qty || 1}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  content: { paddingBottom: 140 },
  loader: { marginVertical: spacing.md },
  emptyText: { color: colors.textSoft, fontSize: typography.body, marginTop: spacing.md },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...shadows.card },
  cardHeader: { alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardTitleWrap: { flex: 1 },
  titleText: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  metaText: { color: colors.textSoft, fontSize: typography.caption, marginTop: 2 },
  amountText: { color: colors.secondary, fontSize: typography.h2, fontWeight: '900', marginTop: spacing.sm },
  lineText: { color: colors.text, fontSize: typography.bodySm, marginTop: 6 },
  statusPill: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  paidPill: { backgroundColor: '#E8F7EF' },
  unpaidPill: { backgroundColor: '#FFF2E0' },
  statusPillText: { fontSize: typography.caption, fontWeight: '900' },
  paidText: { color: '#167243' },
  unpaidText: { color: '#9A5A00' },
  itemsBox: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.sm },
  itemsTitle: { color: colors.secondary, fontSize: typography.bodySm, fontWeight: '900', marginBottom: 4 },
  itemText: { color: colors.text, fontSize: typography.caption, marginTop: 3 }
});
