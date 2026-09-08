import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

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
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Sign in required.' }, 401);

  const body = await req.json().catch(() => ({}));
  if (body.confirmation !== 'DELETE') return json({ error: 'Deletion confirmation is required.' }, 400);

  const userId = userData.user.id;
  const { data: books, error: booksError } = await adminClient
    .from('vaccine_books')
    .select('id')
    .eq('user_id', userId);
  if (booksError) return json({ error: booksError.message }, 500);

  const bookIds = (books || []).map((book) => book.id);
  if (bookIds.length) {
    const { error } = await adminClient.from('booking_records').delete().in('vaccine_book_id', bookIds);
    if (error) return json({ error: error.message }, 500);
  }

  const { error: notificationError } = await adminClient.from('notifications').delete().eq('user_id', userId);
  if (notificationError) return json({ error: notificationError.message }, 500);

  const { error: paymentError } = await adminClient
    .from('payments')
    .update({
      user_id: null,
      vaccine_book_id: null,
      cart_payload: null,
      checkout_payload: null,
      gateway_payload: null,
      webhook_payload: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  if (paymentError) return json({ error: paymentError.message }, 500);

  const { error: bookDeleteError } = await adminClient.from('vaccine_books').delete().eq('user_id', userId);
  if (bookDeleteError) return json({ error: bookDeleteError.message }, 500);

  const { error: profileError } = await adminClient.from('profiles').delete().eq('user_id', userId);
  if (profileError) return json({ error: profileError.message }, 500);

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
  if (deleteUserError) return json({ error: deleteUserError.message }, 500);

  return json({ deleted: true });
});
