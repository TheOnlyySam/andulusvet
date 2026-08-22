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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function basicAuth() {
  return `Basic ${btoa(`${QI_USERNAME}:${QI_PASSWORD}`)}`;
}

async function applyPaymentStatus(adminClient: ReturnType<typeof createClient>, payment: Record<string, any>, payload: Record<string, any>) {
  const status = String(payload.status || 'UNKNOWN');
  const paidAt = status === 'SUCCESS' ? new Date().toISOString() : payment.paid_at || null;

  const { data: updatedPayment, error: updateError } = await adminClient
    .from('payments')
    .update({
      status,
      gateway_payload: payload,
      paid_at: paidAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id)
    .select()
    .single();
  if (updateError) throw updateError;

  if (status === 'SUCCESS' && payment.purpose === 'vaccine_book' && payment.vaccine_book_id) {
    const { error: bookError } = await adminClient
      .from('vaccine_books')
      .update({
        payment_status: 'paid',
        paid_at: paidAt,
        approval_status: 'approved',
        approved_at: paidAt
      })
      .eq('id', payment.vaccine_book_id);
    if (bookError) throw bookError;
  }

  return updatedPayment;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: 'Supabase function environment is not configured.' }, 500);

  const authorization = req.headers.get('Authorization') || '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } }
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Sign in required.' }, 401);

  const body = await req.json().catch(() => ({}));
  const localPaymentId = String(body.paymentId || '');
  const vaccineBookId = String(body.vaccineBookId || '');

  let query = adminClient.from('payments').select('*').eq('user_id', userData.user.id);
  if (localPaymentId) query = query.eq('id', localPaymentId);
  else if (vaccineBookId) query = query.eq('vaccine_book_id', vaccineBookId).order('created_at', { ascending: false });
  else return json({ error: 'paymentId or vaccineBookId is required.' }, 400);

  const { data: payments, error: paymentError } = await query.limit(1);
  if (paymentError) return json({ error: paymentError.message }, 500);
  const payment = payments?.[0];
  if (!payment?.qi_payment_id) return json({ error: 'No Qi payment was found to sync.' }, 404);

  const gatewayResponse = await fetch(`${QI_GATEWAY_BASE_URL}/payment/${payment.qi_payment_id}/status`, {
    method: 'GET',
    headers: {
      Authorization: basicAuth(),
      'X-Terminal-Id': QI_TERMINAL_ID
    }
  });
  const gatewayBody = await gatewayResponse.json().catch(() => ({}));
  if (!gatewayResponse.ok) return json({ error: gatewayBody.error?.description || 'Qi status lookup failed.', details: gatewayBody }, 502);

  const updatedPayment = await applyPaymentStatus(adminClient, payment, gatewayBody);
  return json({ payment: updatedPayment, gateway: gatewayBody });
});
