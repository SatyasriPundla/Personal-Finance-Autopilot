/**
 * Supabase Client Initialization and Configuration Handler
 */
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'expense_tracker_supabase_credentials';

/**
 * Retrieve active Supabase credentials
 * Checks localStorage first, then falls back to environment variables
 */
export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          source: 'custom',
        };
      }
    }
  } catch (err) {
    console.error('Failed to read saved Supabase config:', err);
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('your-project.supabase.co') && envKey !== 'your-anon-key') {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      source: 'env',
    };
  }

  return {
    url: '',
    anonKey: '',
    source: 'none',
  };
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey && config.url.startsWith('http'));
}

/**
 * Save user-provided Supabase credentials
 */
export function saveSupabaseConfig(url, anonKey) {
  if (!url || !anonKey) {
    throw new Error('Both Supabase URL and Anon Key are required.');
  }

  const cleanUrl = url.trim().replace(/\/$/, '');
  const cleanKey = anonKey.trim();

  if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
    throw new Error('Supabase URL must start with https://');
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
  );

  // Re-initialize client
  currentClient = null;
  return getSupabaseClient();
}

/**
 * Clear stored credentials
 */
export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
  currentClient = null;
}

/**
 * Test a Supabase connection with provided credentials
 */
export async function testSupabaseConnection(url, anonKey) {
  try {
    const client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Simple test ping to auth
    const { error } = await client.auth.getSession();
    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Connected successfully to Supabase!' };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Failed to connect. Please check URL and Anon Key.',
    };
  }
}

// Client singleton instance
let currentClient = null;

export function getSupabaseClient() {
  if (currentClient) return currentClient;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  currentClient = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return currentClient;
}

export const supabase = getSupabaseClient();
