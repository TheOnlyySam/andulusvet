import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const QI_GATEWAY_BASE_URL = Deno.env.get('QI_GATEWAY_BASE_URL') || 'https://uat-sandbox-3ds-api.qi.iq/api/v1';
const QI_USERNAME = Deno.env.get('QI_GATEWAY_USERNAME') || 'paymentgatewaytest';
const QI_PASSWORD = Deno.env.get('QI_GATEWAY_PASSWORD') || 'WHaNFE5C3qlChqNbAzH4';
const QI_TERMINAL_ID = Deno.env.get('QI_GATEWAY_TERMINAL_ID') || '237984';
const VACCINE_BOOK_PRICE_IQD = 5000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function basicAuth() {
  return `Basic ${btoa(`${QI_USERNAME}:${QI_PASSWORD}`)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Supabase function environment is not configured.' }, 500);
  }

  const authorization = req.headers.get('Authorization') || '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } }
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Sign in required.' }, 401);

  const body = await req.json().catch(() => ({}));
  const purpose = body.purpose === 'cart' ? 'cart' : 'vaccine_book';
  const requestId = crypto.randomUUID();
  const amount = purpose === 'vaccine_book' ? VACCINE_BOOK_PRICE_IQD : Number(body.amountIqd || 0);

  if (!amount || amount <= 0) return json({ error: 'A valid payment amount is required.' }, 400);

  let vaccineBookId: string | null = null;
  if (purpose === 'vaccine_book') {
    vaccineBookId = String(body.vaccineBookId || '');
    if (!vaccineBookId) return json({ error: 'vaccineBookId is required.' }, 400);

    const { data: book, error: bookError } = await adminClient
      .from('vaccine_books')
      .select('id, user_id, payment_status, payment_amount_iqd')
      .eq('id', vaccineBookId)
      .single();

    if (bookError || !book) return json({ error: 'Vaccine book was not found.' }, 404);
    if (book.user_id !== userData.user.id) return json({ error: 'You cannot pay for this vaccine book.' }, 403);
    if (book.payment_status === 'paid') return json({ error: 'This vaccine book is already paid.' }, 409);
  }

  const { data: localPayment, error: insertError } = await adminClient
    .from('payments')
    .insert({
      request_id: requestId,
      user_id: userData.user.id,
      purpose,
      vaccine_book_id: vaccineBookId,
      amount_iqd: amount,
      currency: 'IQD',
      status: 'CREATED_LOCAL',
      cart_payload: purpose === 'cart' ? body.cartItems || [] : null,
      checkout_payload: body.checkout || null
    })
    .select()
    .single();

  if (insertError) return json({ error: insertError.message }, 500);

  const finishPaymentUrl =
    Deno.env.get('QI_FINISH_PAYMENT_URL') ||
    `${supabaseUrl}/functions/v1/qi-payment-finish?requestId=${encodeURIComponent(requestId)}`;
  const notificationUrl =
    Deno.env.get('QI_NOTIFICATION_URL') ||
    `${supabaseUrl}/functions/v1/qi-payment-webhook`;

  const gatewayPayload = {
    requestId,
    amount,
    currency: 'IQD',
    locale: body.locale || 'en_US',
    finishPaymentUrl,
    notificationUrl,
    customerInfo: body.customerInfo || undefined,
    additionalInfo: {
      app: 'andulusvet',
      purpose,
      localPaymentId: localPayment.id,
      vaccineBookId: vaccineBookId || undefined
    },
    appChannel: false
  };

  const gatewayResponse = await fetch(`${QI_GATEWAY_BASE_URL}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(),
      'X-Terminal-Id': QI_TERMINAL_ID
    },
    body: JSON.stringify(gatewayPayload)
  });

  const gatewayBody = await gatewayResponse.json().catch(() => ({}));
  if (!gatewayResponse.ok) {
    await adminClient
      .from('payments')
      .update({ status: 'CREATE_FAILED', gateway_payload: gatewayBody, updated_at: new Date().toISOString() })
      .eq('id', localPayment.id);
    return json({ error: gatewayBody.error?.description || 'Qi payment creation failed.', details: gatewayBody }, 502);
  }

  const patch = {
    qi_payment_id: gatewayBody.paymentId || null,
    status: gatewayBody.status || 'CREATED',
    form_url: gatewayBody.formUrl || null,
    gateway_payload: gatewayBody,
    updated_at: new Date().toISOString()
  };
  const { data: savedPayment, error: updateError } = await adminClient
    .from('payments')
    .update(patch)
    .eq('id', localPayment.id)
    .select()
    .single();

  if (updateError) return json({ error: updateError.message }, 500);
  return json({ payment: savedPayment, gateway: gatewayBody, formUrl: gatewayBody.formUrl });
});
