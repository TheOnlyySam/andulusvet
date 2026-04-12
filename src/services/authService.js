import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '../lib/supabase';

const STORAGE_KEYS = {
  users: 'andulusvet_users_v2',
  session: 'andulusvet_session_v2'
};

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function humanizeAuthError(error) {
  const message = error?.message || 'Authentication failed.';
  const lower = message.toLowerCase();

  if (lower.includes('network request failed')) {
    return 'Unable to reach Supabase. Check device internet, then restart Expo with `npx expo start -c`.';
  }

  if (lower.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Email confirmation is still required for this account.';
  }

  if (lower.includes('user already registered')) {
    return 'This email is already registered.';
  }

  return message;
}

export async function getStoredUsers() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.users);
  return raw ? JSON.parse(raw) : [];
}

async function setStoredUsers(users) {
  await AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

export async function getLocalSessionId() {
  return AsyncStorage.getItem(STORAGE_KEYS.session);
}

export async function setLocalSessionId(userId) {
  if (!userId) {
    await AsyncStorage.removeItem(STORAGE_KEYS.session);
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEYS.session, userId);
}

export async function getAuthBootstrap() {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data: sessionData } = await supabase.auth.getSession();

    return {
      session: sessionData.session,
      user: sessionData.session?.user || null,
      mode: 'supabase'
    };
  }

  const users = await getStoredUsers();
  const currentUserId = await getLocalSessionId();
  const user = users.find((item) => item.id === currentUserId) || null;

  return {
    session: user ? { user } : null,
    user,
    mode: 'local'
  };
}

export async function signUpWithRole({ identifier, password, metadata }) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const email = normalizeEmail(identifier);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      return data.user;
    } catch (error) {
      throw new Error(humanizeAuthError(error));
    }
  }

  const users = await getStoredUsers();
  const cleanIdentifier = identifier.trim().toLowerCase();
  const exists = users.some((user) => user.username === cleanIdentifier);
  if (exists) {
    throw new Error('Username already exists.');
  }

  const user = {
    id: `local_${Date.now()}`,
    email: normalizeEmail(identifier),
    username: cleanIdentifier,
    password: password.trim(),
    role: cleanIdentifier === 'admin' ? 'admin' : 'customer',
    created_at: new Date().toISOString()
  };

  const nextUsers = [user, ...users];
  await setStoredUsers(nextUsers);
  await setLocalSessionId(user.id);
  return user;
}

export async function signInWithRole({ identifier, password }) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const email = normalizeEmail(identifier);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data.user;
    } catch (error) {
      throw new Error(humanizeAuthError(error));
    }
  }

  const users = await getStoredUsers();
  const cleanIdentifier = identifier.trim().toLowerCase();
  const user = users.find(
    (item) =>
      (item.username === cleanIdentifier || item.email === normalizeEmail(identifier)) &&
      item.password === password.trim()
  );

  if (!user) throw new Error('Invalid username or password.');
  await setLocalSessionId(user.id);
  return user;
}

export async function signOutUser() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return;
  }

  await setLocalSessionId(null);
}
