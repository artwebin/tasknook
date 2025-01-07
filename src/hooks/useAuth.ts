import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession()
      .then(({ user }) => {
        setUser(user);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Auth error:', error);
        setLoading(false);
      });
  }, []);

  const signIn = async (email: string, otpCode?: string) => {
    try {
      const { error, data } = await authService.signIn(email, otpCode);
      
      if (error) throw error;
      
      if (data?.user) {
        setUser(data.user);
        toast.success(otpCode ? 'Signed in successfully!' : 'Check your email for the verification code!');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Error signing in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  return { user, loading, signIn, signOut };
}