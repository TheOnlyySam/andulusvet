export function formatCurrency(value, language = 'ar') {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ' : 'en-US').format(value);
}

export function formatDate(value, language = 'ar') {
  return new Date(value).toLocaleDateString(language === 'ar' ? 'ar-IQ' : 'en-US');
}

export function pickLocalizedText(value, language = 'ar') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.ar || value.en || '';
}

export function getRowDirection(isRTL = true) {
  return isRTL ? 'row-reverse' : 'row';
}

export function getTextAlign(isRTL = true) {
  return isRTL ? 'right' : 'left';
}
