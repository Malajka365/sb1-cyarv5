import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: 'sb-auth-token',
    debug: import.meta.env.DEV,
    cookieOptions: {
      name: 'sb-auth-token',
      lifetime: 60 * 60 * 24 * 7, // 7 days
      domain: window.location.hostname,
      path: '/',
      sameSite: 'lax'
    }
  },
  global: {
    headers: {
      'X-Client-Info': `@supabase/auth-ui-react@0.4.7`
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});