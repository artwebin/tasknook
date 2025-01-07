import { demoConfig } from './demo';

// Environment configuration with fallbacks to demo values
const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || demoConfig.supabase.url,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || demoConfig.supabase.anonKey,
    isDemoMode: !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
  }
};

export default env;