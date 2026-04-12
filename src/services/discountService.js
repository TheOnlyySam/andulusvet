export function normalizeDiscountRule(rule) {
  return {
    ...rule,
    valueType: rule.valueType || rule.value_type || 'percentage',
    isActive: typeof rule.isActive === 'boolean' ? rule.isActive : rule.is_active !== false,
    startsAt: rule.startsAt ?? rule.starts_at ?? null,
    endsAt: rule.endsAt ?? rule.ends_at ?? null
  };
}

export function calculateDiscounts(cartItems, rules = []) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const appliedDiscounts = rules
    .map(normalizeDiscountRule)
    .filter((rule) => rule.isActive && subtotal >= Number(rule.threshold || 0));

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
