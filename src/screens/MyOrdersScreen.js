import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { Text } from '../components/Typography';
import { useAppFeedback } from '../context/AppFeedbackContext';
import { useLocalization } from '../context/LocalizationContext';
import { fetchMyPayments } from '../services/paymentRepository';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, formatDate, getTextAlign, pickLocalizedText } from '../utils/format';

function isPaidPayment(payment) {
  const status = String(payment.status || '').toUpperCase();
  return status === 'SUCCESS' || Boolean(payment.paid_at);
}

function normalizeCartItems(items) {
  return Array.isArray(items) ? items : [];
}

export default function MyOrdersScreen() {
  const { language, isRTL, t } = useLocalization();
  const { showAlert } = useAppFeedback();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const copy = {
    title: language === 'ar' ? 'طلباتي' : 'My Orders',
    subtitle: language === 'ar' ? 'تابع طلباتك والمدفوعات الخاصة بحسابك' : 'Track your orders and payment status',
    empty: language === 'ar' ? 'لا توجد طلبات بعد.' : 'No orders yet.',
    paid: language === 'ar' ? 'مدفوع' : 'Paid',
    unpaid: language === 'ar' ? 'بانتظار الدفع' : 'To be paid',
    orderNumber: language === 'ar' ? 'رقم الطلب' : 'Order number',
    paymentId: language === 'ar' ? 'رقم الدفع' : 'Payment ID',
    paidAt: language === 'ar' ? 'وقت الدفع' : 'Paid at',
    items: language === 'ar' ? 'المنتجات' : 'Items',
    cart: language === 'ar' ? 'طلب متجر' : 'Cart order',
    vaccine: language === 'ar' ? 'دفتر لقاحات' : 'Vaccine book'
  };

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await fetchMyPayments();
      setOrders(next);
    } catch (error) {
      showAlert(t('alerts.error'), error.message || t('alerts.error'));
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={copy.title} subtitle={copy.subtitle} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadOrders} tintColor={colors.secondary} colors={[colors.secondary]} />}
      >
        {isLoading ? <ActivityIndicator color={colors.secondary} style={styles.loader} /> : null}
        {!isLoading && !orders.length ? (
          <Text style={[styles.emptyText, { textAlign: getTextAlign(isRTL) }]}>{copy.empty}</Text>
        ) : null}

        {orders.map((order) => {
          const paid = isPaidPayment(order);
          const items = normalizeCartItems(order.cart_payload);
          const statusLabel = paid ? copy.paid : copy.unpaid;
          const purposeLabel = order.purpose === 'cart' ? copy.cart : copy.vaccine;

          return (
            <View key={order.id} style={styles.card}>
              <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.cardTitleWrap}>
                  <Text style={[styles.titleText, { textAlign: getTextAlign(isRTL) }]}>{purposeLabel}</Text>
                  <Text style={[styles.metaText, { textAlign: getTextAlign(isRTL) }]}>{formatDate(order.created_at, language)}</Text>
                </View>
                <View style={[styles.statusPill, paid ? styles.paidPill : styles.unpaidPill]}>
                  <Text style={[styles.statusPillText, paid ? styles.paidText : styles.unpaidText]}>{statusLabel}</Text>
                </View>
              </View>

              <Text style={[styles.amountText, { textAlign: getTextAlign(isRTL) }]}>
                {formatCurrency(order.amount_iqd || 0, language)} {language === 'ar' ? 'د.ع' : 'IQD'}
              </Text>
              <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{copy.orderNumber}: {order.order_number || '-'}</Text>
              <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{copy.paymentId}: {order.qi_payment_id || order.id}</Text>
              <Text style={[styles.lineText, { textAlign: getTextAlign(isRTL) }]}>{copy.paidAt}: {order.paid_at ? formatDate(order.paid_at, language) : '-'}</Text>

              {items.length ? (
                <View style={styles.itemsBox}>
                  <Text style={[styles.itemsTitle, { textAlign: getTextAlign(isRTL) }]}>{copy.items}</Text>
                  {items.map((item, index) => (
                    <Text key={`${order.id}-${item.id || index}`} style={[styles.itemText, { textAlign: getTextAlign(isRTL) }]}>
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
