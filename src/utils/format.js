export function formatCurrency(value, language = 'ar') {
  const isArabic = language === 'ar';
  return new Intl.NumberFormat(isArabic ? 'ar-IQ-u-nu-arab' : 'en-US', {
    numberingSystem: isArabic ? 'arab' : 'latn'
  }).format(value);
}

export function formatDate(value, language = 'ar') {
  const isArabic = language === 'ar';
  return new Date(value).toLocaleDateString(isArabic ? 'ar-IQ-u-nu-arab' : 'en-US', {
    numberingSystem: isArabic ? 'arab' : 'latn'
  });
}

export function toWesternDigits(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

export function localizeDigits(value, language = 'ar') {
  if (value === null || value === undefined) return value;
  const normalized = toWesternDigits(String(value));
  if (language !== 'ar') return normalized;
  return normalized.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
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
