import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { create } from 'zustand';

// Types
export interface User {
  id: string;
  email: string;
  [key: string]: any;
}

export interface Profile {
  id: string;
  user_id: string;
  role: 'recruiter' | 'candidate' | 'admin';
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

export interface AuthError {
  message: string;
  status?: number;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: AuthError | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  clearError: () => void;
}

// Global Supabase client
let supabaseClient: SupabaseClient | null = null;

export const initializeSupabase = (url: string, anonKey: string) => {
  supabaseClient = createClient(url, anonKey);
};

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  return supabaseClient;
};

// Auth store
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  initialize: async () => {
    try {
      set({ isInitializing: true, error: null });
      
      const supabase = getSupabaseClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Profile fetch error:', profileError);
        }
        
        set({
          user: session.user as User,
          profile: profile as Profile,
          isAuthenticated: true,
          isInitializing: false
        });
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isInitializing: false
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        error: { message: error instanceof Error ? error.message : 'Authentication initialization failed' },
        isInitializing: false
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Profile fetch error:', profileError);
        }
        
        set({
          user: data.user as User,
          profile: profile as Profile,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: { message: error instanceof Error ? error.message : 'Login failed' },
        isLoading: false
      });
      throw error;
    }
  },

  signup: async (email: string, password: string, userData?: any) => {
    try {
      set({ isLoading: true, error: null });
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      set({ isLoading: false });
    } catch (error) {
      set({
        error: { message: error instanceof Error ? error.message : 'Signup failed' },
        isLoading: false
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      set({
        error: { message: error instanceof Error ? error.message : 'Logout failed' },
        isLoading: false
      });
    }
  },

  sendPasswordResetEmail: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      set({ isLoading: false });
    } catch (error) {
      set({
        error: { message: error instanceof Error ? error.message : 'Password reset failed' },
        isLoading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

// Auth listener
export const initializeAuthListener = () => {
  const supabase = getSupabaseClient();
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { initialize } = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      await initialize();
    }
  });
};