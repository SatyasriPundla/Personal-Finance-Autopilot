import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  saveSupabaseConfig,
  clearSupabaseConfig,
} from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

const DEMO_USER_STORAGE_KEY = 'expense_tracker_demo_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize auth session
  useEffect(() => {
    let mounted = true;
    const client = getSupabaseClient();

    const checkAuth = async () => {
      const configured = isSupabaseConfigured();
      setIsConfigured(configured);

      if (!configured || !client) {
        // Check if demo user was logged in previously
        const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        if (savedDemo) {
          try {
            const demoData = JSON.parse(savedDemo);
            setUser(demoData.user);
            setProfile(demoData.profile);
            setIsDemoMode(true);
          } catch {
            // ignore
          }
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession }, error } = await client.auth.getSession();
        if (error) {
          console.warn('Auth session error:', error.message);
        }

        if (mounted) {
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchUserProfile(client, currentSession.user);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();

    // Listen for Supabase auth changes
    let authListener = null;
    if (client) {
      const { data } = client.auth.onAuthStateChange(async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          setUser(newSession.user);
          setIsDemoMode(false);
          await fetchUserProfile(client, newSession.user);
        } else if (!isDemoMode) {
          setUser(null);
          setProfile(null);
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      mounted = false;
      authListener?.unsubscribe();
    };
  }, [isConfigured]);

  const fetchUserProfile = async (client, authUser) => {
    if (!client || !authUser) return;
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile:', error.message);
      }

      if (data) {
        setProfile(data);
      } else {
        // Fallback to user metadata
        setProfile({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          created_at: authUser.created_at,
        });
      }
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      setProfile({
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        created_at: authUser.created_at,
      });
    }
  };

  /**
   * Sign up with full name, email, password
   */
  const signUp = async (fullName, email, password) => {
    if (!isConfigured) {
      throw new Error(
        'Supabase is not configured yet. Please configure your Supabase URL & Anon Key first.'
      );
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not initialized.');

    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) throw error;

    // Insert or ensure profile is created
    if (data.user) {
      try {
        await client.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
        });
      } catch (err) {
        console.warn('Auto profile insertion warning:', err);
      }
    }

    return data;
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email, password) => {
    if (!isConfigured) {
      throw new Error(
        'Supabase is not configured yet. Please configure your Supabase URL & Anon Key first.'
      );
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not initialized.');

    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    setIsDemoMode(false);
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    return data;
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      setUser(null);
      setProfile(null);
      setIsDemoMode(false);
      return;
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  /**
   * Reset Password (send recovery email)
   */
  const resetPassword = async (email) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please enter your project keys.');
    }
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not initialized.');

    const { data, error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
    return data;
  };

  /**
   * Update Profile (full name, password)
   */
  const updateProfile = async ({ fullName, newPassword }) => {
    if (isDemoMode) {
      const updatedProfile = { ...profile, full_name: fullName || profile?.full_name };
      setProfile(updatedProfile);
      localStorage.setItem(
        DEMO_USER_STORAGE_KEY,
        JSON.stringify({ user, profile: updatedProfile })
      );
      return { success: true };
    }

    const client = getSupabaseClient();
    if (!client || !user) throw new Error('User not authenticated.');

    if (fullName) {
      const { error: profileError } = await client
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setProfile((prev) => ({ ...prev, full_name: fullName.trim() }));
    }

    if (newPassword) {
      const { error: pwdError } = await client.auth.updateUser({
        password: newPassword,
      });
      if (pwdError) throw pwdError;
    }

    return { success: true };
  };

  /**
   * Start Demo Mode (allows exploring all modules when Supabase keys are pending)
   */
  const startDemoMode = () => {
    const demoUser = {
      id: 'demo-user-college-project',
      email: 'demo@expensetracker.app',
      user_metadata: { full_name: 'Hemasiri Neelisetty' },
      created_at: new Date().toISOString(),
    };
    const demoProfile = {
      id: demoUser.id,
      full_name: 'Hemasiri Neelisetty',
      created_at: demoUser.created_at,
    };

    localStorage.setItem(
      DEMO_USER_STORAGE_KEY,
      JSON.stringify({ user: demoUser, profile: demoProfile })
    );

    setUser(demoUser);
    setProfile(demoProfile);
    setIsDemoMode(true);
  };

  /**
   * Update Supabase configuration live
   */
  const updateSupabaseConfig = (url, anonKey) => {
    saveSupabaseConfig(url, anonKey);
    setIsConfigured(true);
    setIsDemoMode(false);
    window.location.reload();
  };

  const disconnectSupabase = () => {
    clearSupabaseConfig();
    setIsConfigured(false);
    signOut();
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured,
        isDemoMode,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        startDemoMode,
        updateSupabaseConfig,
        disconnectSupabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
