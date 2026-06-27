export function formatCurrency(value, language = 'ar') {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-IQ-u-nu-latn' : 'en-US', {
    numberingSystem: 'latn'
  }).format(value);
}

export function formatDate(value, language = 'ar') {
  return new Date(value).toLocaleDateString(language === 'ar' ? 'ar-IQ-u-nu-latn' : 'en-US', {
    numberingSystem: 'latn'
  });
}

export function toWesternDigits(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
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
