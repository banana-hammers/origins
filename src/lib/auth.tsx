'use client';

import * as React from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  const value = React.useMemo(
    () => ({
      user,
      loading,
      signUp: async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      },
      signIn: async (email: string, password: string) => {
        const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (session?.refresh_token) {
          localStorage.setItem('refresh_token', session.refresh_token);
        }
      },
      signOut: async () => {
        try {
          // Clear local storage first
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('supabase.auth.token');
          
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut({ scope: 'local' });
          if (error) throw error;
          
          // Force clear the user state
          setUser(null);
        } catch (error) {
          console.error('Sign out error:', error);
          throw error;
        }
      },
    }),
    [user, loading]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}