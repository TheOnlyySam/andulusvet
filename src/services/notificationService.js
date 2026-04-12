import { getSupabaseClient } from '../lib/supabase';

function normalizeNotification(item) {
  return {
    ...item,
    title:
      typeof item.title === 'object' && item.title
        ? item.title
        : { ar: item.title_ar || item.title || '', en: item.title_en || item.title || '' },
    message:
      typeof item.message === 'object' && item.message
        ? item.message
        : { ar: item.message_ar || item.message || '', en: item.message_en || item.message || '' },
    userId: item.userId || item.user_id || null,
    isRead: typeof item.isRead === 'boolean' ? item.isRead : item.is_read === true,
    createdAt: item.createdAt || item.created_at || new Date().toISOString()
  };
}

export async function fetchNotifications({ userId, role }) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (role !== 'admin') {
    query = query.or(`audience.eq.all,user_id.eq.${userId}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeNotification);
}

export async function markNotificationsRead(notificationIds = []) {
  const supabase = getSupabaseClient();
  if (!supabase || !notificationIds.length) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', notificationIds);

  if (error) throw error;
}

export async function createNotification(payload) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured for notifications.');
  }

  const dbPayload = {
    title_ar: payload.title?.ar || '',
    title_en: payload.title?.en || '',
    message_ar: payload.message?.ar || payload.message || '',
    message_en: payload.message?.en || payload.message || '',
    audience: payload.audience === 'user' ? 'user' : 'all',
    type: payload.type || 'general',
    is_read: payload.is_read === true,
    user_id: payload.audience === 'user' ? payload.user_id || null : null
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(dbPayload)
    .select()
    .single();

  if (error) throw error;
  return normalizeNotification(data);
}
