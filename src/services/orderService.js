import { calculateDiscounts } from './discountService';
import { formatCurrency, toWesternDigits } from '../utils/format';

export function buildCheckoutSummary(cartItems, discountRules = []) {
  return calculateDiscounts(cartItems, discountRules);
}

export function buildWhatsappOrderMessage({ language, t, cartItems, checkoutDraft, summary }) {
  const checkoutSummary = summary || buildCheckoutSummary(cartItems);
  const locationLine = checkoutDraft.district
    ? `${checkoutDraft.governorate} - ${checkoutDraft.district}`
    : checkoutDraft.governorate;

  const lines = cartItems.map(
    (item) =>
      `- ${item.displayName || item.name} | ${t('cart.quantity')}: ${item.qty} | ${formatCurrency(item.price, language)}`
  );

  const header = language === 'ar' ? 'طلب جديد من التطبيق' : 'New order from the app';

  return [
    header,
    '',
    `${t('cart.receiverName')}: ${checkoutDraft.customerName}`,
    `${t('cart.phone1')}: ${checkoutDraft.phoneNumber1}`,
    `${t('cart.phone2')}: ${checkoutDraft.phoneNumber2 || '-'}`,
    `${t('cart.governorate')}: ${locationLine}`,
    `${t('cart.placeOfResidence')}: ${checkoutDraft.placeOfResidence}`,
    `${t('cart.closestLandmark')}: ${checkoutDraft.closestLandmark}`,
    '',
    ...lines,
    '',
    `${t('cart.subtotal')}: ${formatCurrency(checkoutSummary.subtotal, language)}`,
    `${t('cart.discount')}: ${formatCurrency(checkoutSummary.discountAmount, language)}`,
    `${t('cart.total')}: ${formatCurrency(checkoutSummary.total, language)}`
  ].map(toWesternDigits).join('\n');
}
