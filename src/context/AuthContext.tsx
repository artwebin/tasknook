import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, otpCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, otpCode?: string) => {
    try {
      let error;

      if (otpCode) {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'email'
        });
        error = verifyError;
        
        if (!error && data?.user) {
          // Ensure user exists in auth.users by checking session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            // Create profile in public.profiles if it doesn't exist
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({ 
                id: session.user.id,
                email: session.user.email,
                updated_at: new Date().toISOString()
              });
            if (profileError) console.error('Error creating profile:', profileError);
          }
        }
      } else {
        // Check if we've recently sent an email to this address
        const recentEmailKey = `recent_email_${email}`;
        const lastEmailTime = localStorage.getItem(recentEmailKey);
        if (lastEmailTime && Date.now() - parseInt(lastEmailTime) < 60000) {
          throw new Error('Please wait a minute before requesting another code');
        }
        const { error: signInError } = await supabase.auth.signInWithOtp({ 
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        error = signInError;
      }

      if (error) throw error;
      
      if (!otpCode) { 
        // Store the timestamp of the email send
        localStorage.setItem(`recent_email_${email}`, Date.now().toString());
        toast.success('Check your email for the verification code!');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if ((error as any)?.status === 429) {
        toast.error('Too many attempts. Please wait a few minutes and try again.');
      } else {
        toast.error(otpCode ? 'Invalid verification code' : 'Error sending verification code');
      }
      console.error('Error:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};