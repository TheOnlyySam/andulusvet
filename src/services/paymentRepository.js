import { getSupabaseClient } from '../lib/supabase';

export async function fetchAdminPayments() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('payments')
    .select('id, request_id, qi_payment_id, user_id, purpose, amount_iqd, currency, status, cart_payload, checkout_payload, paid_at, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}
