import { calculateDiscounts } from './discountService';
import { formatCurrency, localizeDigits, toWesternDigits } from '../utils/format';

export function buildCheckoutSummary(cartItems, discountRules = []) {
  return calculateDiscounts(cartItems, discountRules);
}

export function buildWhatsappOrderMessage({
  language,
  t,
  cartItems,
  checkoutDraft,
  summary,
  paymentStatus = 'unpaid',
  paymentId,
  orderNumber
}) {
  const checkoutSummary = summary || buildCheckoutSummary(cartItems);
  const locationLine = checkoutDraft.district
    ? `${checkoutDraft.governorate} - ${checkoutDraft.district}`
    : checkoutDraft.governorate;
  const paidLabel = language === 'ar' ? 'مدفوع' : 'Paid';
  const unpaidLabel = language === 'ar' ? 'غير مدفوع' : 'Unpaid';
  const paymentStatusLabel = paymentStatus === 'paid' ? paidLabel : unpaidLabel;
  const itemsHeader = language === 'ar' ? 'قائمة المنتجات:' : 'Items:';

  const lines = cartItems.map((item) => {
    const itemTotal = Number(item.price || 0) * Number(item.qty || 0);
    return `- ${item.displayName || item.name} | ${t('cart.quantity')}: ${item.qty} | ${formatCurrency(item.price, language)} ${t('cart.iqd')} | ${t('cart.total')}: ${formatCurrency(itemTotal, language)} ${t('cart.iqd')}`;
  });

  const header = language === 'ar' ? 'طلب جديد من التطبيق' : 'New order from the app';

  const latinTokens = [orderNumber, paymentId].filter(Boolean);

  return [
    header,
    orderNumber ? `${language === 'ar' ? 'رقم الطلب' : 'Order number'}: ${orderNumber}` : null,
    `${t('cart.paymentStatus')}: ${paymentStatusLabel}`,
    paymentId ? `${language === 'ar' ? 'رقم عملية الدفع' : 'Payment ID'}: ${paymentId}` : null,
    '',
    `${t('cart.receiverName')}: ${checkoutDraft.customerName}`,
    `${t('cart.phone1')}: ${checkoutDraft.phoneNumber1}`,
    `${t('cart.phone2')}: ${checkoutDraft.phoneNumber2 || '-'}`,
    `${t('cart.governorate')}: ${locationLine}`,
    `${t('cart.placeOfResidence')}: ${checkoutDraft.placeOfResidence}`,
    `${t('cart.closestLandmark')}: ${checkoutDraft.closestLandmark}`,
    '',
    itemsHeader,
    ...lines,
    '',
    `${t('cart.subtotal')}: ${formatCurrency(checkoutSummary.subtotal, language)} ${t('cart.iqd')}`,
    `${t('cart.discount')}: ${formatCurrency(checkoutSummary.discountAmount, language)} ${t('cart.iqd')}`,
    `${t('cart.deliveryFee')}: + ${formatCurrency(checkoutSummary.deliveryFee, language)} ${t('cart.iqd')}`,
    `${t('cart.total')}: ${formatCurrency(checkoutSummary.total, language)} ${t('cart.iqd')}`
  ].filter(Boolean).map((line) => (
    latinTokens.some((token) => String(line).includes(token))
      ? toWesternDigits(String(line))
      : localizeDigits(line, language)
  )).join('\n');
}
