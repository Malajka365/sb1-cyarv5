import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile } from './supabase-types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (mounted && initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setIsAuthenticated(true);

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();

          if (!profileError && profileData) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        const authError = err as SupabaseAuthError;
        setError(authError.message || 'Failed to initialize authentication');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);

        if (currentSession?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (!profileError && profileData) {
            setProfile(profileData);
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    });

    initialize();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      const authError = err as SupabaseAuthError;
      return { 
        success: false, 
        error: authError.message || 'Failed to sign in'
      };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      const authError = err as SupabaseAuthError;
      return { 
        success: false, 
        error: authError.message || 'Failed to sign up'
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      if (error) throw error;

      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (err) {
      const authError = err as SupabaseAuthError;
      return { 
        success: false, 
        error: authError.message || 'Failed to sign out'
      };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
      return { success: true };
    } catch (err) {
      const authError = err as SupabaseAuthError;
      return { 
        success: false, 
        error: authError.message || 'Failed to update profile'
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      error,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}