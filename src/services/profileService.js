import { getSupabaseClient } from '../lib/supabase';

export async function fetchProfile(user) {
  if (!user) return null;
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      id: user.id,
      user_id: user.id,
      username: user.username || user.email?.split('@')[0] || 'user',
      display_name:
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.username ||
        user.username ||
        user.email?.split('@')[0] ||
        'user',
      role: user.role || user.user_metadata?.role || 'customer'
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  return {
    id: user.id,
    user_id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
    display_name:
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.username ||
      user.email?.split('@')[0] ||
      'user',
    role: user.user_metadata?.role || 'customer'
  };
}

export async function upsertProfile({ user, username, displayName, role = 'customer' }) {
  if (!user) return null;
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      id: user.id,
      user_id: user.id,
      username,
      display_name: displayName || username,
      role
    };
  }

  const payload = {
    user_id: user.id,
    username,
    display_name: displayName || username,
    role
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}
