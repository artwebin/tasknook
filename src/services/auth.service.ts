import { User } from '@supabase/supabase-js';
import { supabase, isDemo } from '../lib/supabase';

export const authService = {
  async getSession() {
    if (isDemo) {
      return { user: { id: 'demo-user', email: 'demo@example.com' } as User };
    }
    const { data: { session } } = await supabase.auth.getSession();
    return { user: session?.user ?? null };
  },

  async signIn(email: string, otpCode?: string) {
    if (isDemo) {
      return { user: { id: 'demo-user', email } as User };
    }

    if (otpCode) {
      return supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      });
    }

    return supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  async signOut() {
    if (isDemo) {
      return { error: null };
    }
    return supabase.auth.signOut();
  }
};