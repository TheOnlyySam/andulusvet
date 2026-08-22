import { getSupabaseClient } from '../lib/supabase';

const PAYMENT_COLUMNS = 'id, order_number, request_id, qi_payment_id, user_id, purpose, amount_iqd, currency, status, cart_payload, checkout_payload, paid_at, created_at, updated_at';

function filterPayments(payments, search) {
  const query = String(search || '').trim().toLowerCase();
  if (!query) return payments;

  return payments.filter((payment) => {
    const checkout = payment.checkout_payload || {};
    const items = Array.isArray(payment.cart_payload) ? payment.cart_payload : [];
    const haystack = [
      payment.order_number,
      payment.qi_payment_id,
      payment.id,
      checkout.customerName,
      checkout.phoneNumber1,
      checkout.phoneNumber2,
      ...items.map((item) => typeof item.name === 'string' ? item.name : `${item.name?.ar || ''} ${item.name?.en || ''}`)
    ].filter(Boolean).join(' ').toLowerCase();

    return haystack.includes(query);
  });
}

export async function fetchAdminPayments({ search } = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('payments')
    .select(PAYMENT_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return filterPayments(data || [], search);
}

export async function fetchMyPayments() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('payments')
    .select(PAYMENT_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}
