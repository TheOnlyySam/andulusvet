const MOCK_DISCOUNTS = [
  {
    id: 'discount_over_50000',
    type: 'threshold',
    threshold: 50000,
    value: 10,
    valueType: 'percentage',
    isActive: true,
    startsAt: null,
    endsAt: null,
    scope: 'order',
    label: {
      ar: 'خصم 10% على الطلبات فوق 50,000 د.ع',
      en: '10% off orders above IQD 50,000'
    }
  }
];

export function getMockDiscountRules() {
  return MOCK_DISCOUNTS;
}

export function calculateDiscounts(cartItems, rules = MOCK_DISCOUNTS) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const appliedDiscounts = rules.filter((rule) => rule.isActive && subtotal >= rule.threshold);

  const discountAmount = appliedDiscounts.reduce((sum, rule) => {
    if (rule.valueType === 'percentage') {
      return sum + subtotal * (rule.value / 100);
    }

    return sum + rule.value;
  }, 0);

  const total = Math.max(subtotal - discountAmount, 0);

  return {
    subtotal,
    discountAmount,
    total,
    appliedDiscounts
  };
}
