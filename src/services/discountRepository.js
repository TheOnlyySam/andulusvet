import { getSupabaseClient } from '../lib/supabase';

function normalizeDiscountRuleRow(rule) {
  return {
    ...rule,
    threshold: Number(rule.threshold || 0),
    value: Number(rule.value || 0),
    label:
      typeof rule.label === 'object' && rule.label
        ? rule.label
        : {
            ar: rule.label_ar || rule.label || '',
            en: rule.label_en || rule.label || ''
          },
    valueType: rule.valueType || rule.value_type || 'percentage',
    value_type: rule.value_type || rule.valueType || 'percentage',
    isActive: typeof rule.isActive === 'boolean' ? rule.isActive : rule.is_active !== false,
    is_active: typeof rule.is_active === 'boolean' ? rule.is_active : rule.isActive !== false,
    startsAt: rule.startsAt ?? rule.starts_at ?? null,
    starts_at: rule.starts_at ?? rule.startsAt ?? null,
    endsAt: rule.endsAt ?? rule.ends_at ?? null,
    ends_at: rule.ends_at ?? rule.endsAt ?? null
  };
}

export async function fetchDiscountRulesFromRepository() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('discount_rules')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeDiscountRuleRow);
}

export async function createDiscountRuleInRepository(payload) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured for discount writes.');
  }

  const dbPayload = {
    label_ar: payload.label?.ar || '',
    label_en: payload.label?.en || '',
    threshold: Number(payload.threshold || 0),
    value: Number(payload.value || 0),
    value_type: payload.valueType || payload.value_type || 'percentage',
    is_active: typeof payload.is_active === 'boolean' ? payload.is_active : payload.isActive !== false,
    starts_at: payload.startsAt || payload.starts_at || null,
    ends_at: payload.endsAt || payload.ends_at || null,
    scope: payload.scope || 'order',
    type: payload.type || 'threshold',
    created_by: payload.created_by || null
  };

  const { data, error } = await supabase
    .from('discount_rules')
    .insert(dbPayload)
    .select()
    .single();

  if (error) throw error;
  return normalizeDiscountRuleRow(data);
}
