import { getSupabaseClient } from '../lib/supabase';

function requireSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is required for Qi payment testing.');
  }
  return supabase;
}

async function assertInvokeResult({ data, error }) {
  if (error) {
    const context = error.context || error;
    const status = context?.status ? ` (${context.status})` : '';
    let bodyMessage = '';
    if (typeof context?.clone === 'function') {
      const body = await context.clone().json().catch(() => null);
      bodyMessage = body?.error ? `: ${body.error}` : '';
    }
    throw new Error(`${error.message || 'Payment request failed.'}${status}${bodyMessage}`);
  }
  if (data?.error) {
    const details = data.details ? ` ${JSON.stringify(data.details)}` : '';
    throw new Error(`${data.error}${details}`);
  }
  return data;
}

export async function createVaccineBookQiPayment({ vaccineBookId, locale, customerInfo }) {
  const supabase = requireSupabase();
  const result = await supabase.functions.invoke('qi-create-payment', {
    body: {
      purpose: 'vaccine_book',
      vaccineBookId,
      locale,
      customerInfo
    }
  });
  return assertInvokeResult(result);
}

export async function createCartQiPayment({ amountIqd, cartItems, checkout, locale, customerInfo }) {
  const supabase = requireSupabase();
  const result = await supabase.functions.invoke('qi-create-payment', {
    body: {
      purpose: 'cart',
      amountIqd,
      cartItems,
      checkout,
      locale,
      customerInfo
    }
  });
  return assertInvokeResult(result);
}

export async function syncQiPaymentStatus({ paymentId, vaccineBookId }) {
  const supabase = requireSupabase();
  const result = await supabase.functions.invoke('qi-payment-sync', {
    body: {
      paymentId,
      vaccineBookId
    }
  });
  return assertInvokeResult(result);
}
