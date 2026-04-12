import { calculateDiscounts } from './discountService';

export function buildCheckoutSummary(cartItems, discountRules = []) {
  return calculateDiscounts(cartItems, discountRules);
}

export function buildWhatsappOrderMessage({ language, t, cartItems, checkoutDraft, summary }) {
  const checkoutSummary = summary || buildCheckoutSummary(cartItems);
  const locale = language === 'ar' ? 'ar-IQ' : 'en-US';
  const locationLine = checkoutDraft.district
    ? `${checkoutDraft.governorate} - ${checkoutDraft.district}`
    : checkoutDraft.governorate;

  const lines = cartItems.map(
    (item) =>
      `- ${item.displayName || item.name} | ${t('cart.quantity')}: ${item.qty} | ${item.price.toLocaleString(locale)}`
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
    `${t('cart.subtotal')}: ${checkoutSummary.subtotal.toLocaleString(locale)}`,
    `${t('cart.discount')}: ${checkoutSummary.discountAmount.toLocaleString(locale)}`,
    `${t('cart.total')}: ${checkoutSummary.total.toLocaleString(locale)}`
  ].join('\n');
}
