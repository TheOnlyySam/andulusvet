import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseConfig } from '../config/supabase';

let client = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (client) {
    return client;
  }

  client = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false
    }
  });

  return client;
}
