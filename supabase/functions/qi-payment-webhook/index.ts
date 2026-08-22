import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function verifyWebhookSignature(payload: Record<string, unknown>, signature: string | null) {
  const publicKey = Deno.env.get('QI_GATEWAY_PUBLIC_KEY');
  if (!publicKey) return true;
  if (!signature) return false;

  const amount = payload.amount ? `${payload.amount}.000` : '-';
  const data = [
    payload.paymentId || '-',
    amount,
    payload.currency || '-',
    payload.creationDate || '-',
    payload.status || '-'
  ].join('|');

  const key = await crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const binarySignature = atob(signature);
  const signatureBytes = new Uint8Array(binarySignature.length);
  for (let i = 0; i < binarySignature.length; i += 1) signatureBytes[i] = binarySignature.charCodeAt(i);

  return crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signatureBytes,
    new TextEncoder().encode(data)
  );
}

async function applyPaymentStatus(adminClient: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const status = String(payload.status || 'UNKNOWN');
  const paidAt = status === 'SUCCESS' ? new Date().toISOString() : null;
  const paymentId = String(payload.paymentId || '');
  const requestId = String(payload.requestId || '');

  let query = adminClient.from('payments').select('*');
  if (paymentId) query = query.eq('qi_payment_id', paymentId);
  else query = query.eq('request_id', requestId);

  const { data: payments, error: fetchError } = await query.limit(1);
  if (fetchError) throw fetchError;
  const payment = payments?.[0];
  if (!payment) return null;

  const { data: updatedPayment, error: updateError } = await adminClient
    .from('payments')
    .update({
      status,
      webhook_payload: payload,
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
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Supabase function environment is not configured.' }, 500);

  const payload = await req.json().catch(() => ({}));
  const isVerified = await verifyWebhookSignature(payload, req.headers.get('X-Signature'));
  if (!isVerified) return json({ error: 'Invalid Qi webhook signature.' }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const payment = await applyPaymentStatus(adminClient, payload);
  return json({ ok: true, payment });
});
