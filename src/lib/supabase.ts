import { createClient } from '@supabase/supabase-js';
import env from '../config/env';

export const supabase = createClient(env.supabase.url, env.supabase.anonKey);
export const isDemo = env.supabase.isDemoMode;

// Log mode for debugging
if (isDemo) {
  console.log('Running in demo mode');
}