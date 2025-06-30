import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { create } from 'zustand';

// Global Supabase client
let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase client
export const initializeSupabase = (url: string, anonKey: string) => {
  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
};

// Get Supabase client
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  return supabaseClient;
};

// Types
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'candidate' | 'recruiter' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

// Auth store
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
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
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        }

        set({
          user: session.user,
          profile: profile || null,
          session,
          isAuthenticated: true,
          isInitializing: false
        });
      } else {
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isInitializing: false
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        error: error instanceof Error ? error.message : 'Authentication initialization failed',
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
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        }

        set({
          user: data.user,
          profile: profile || null,
          session: data.session,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  signup: async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      set({ isLoading: true, error: null });
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data.user && userData) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            ...userData
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Signup error:', error);
      set({
        error: error instanceof Error ? error.message : 'Signup failed',
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
        session: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
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
      console.error('Password reset error:', error);
      set({
        error: error instanceof Error ? error.message : 'Password reset failed',
        isLoading: false
      });
      throw error;
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { user, profile } = get();
      if (!user) throw new Error('No authenticated user');

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      set({
        profile: { ...profile, ...data },
        isLoading: false
      });
    } catch (error) {
      console.error('Profile update error:', error);
      set({
        error: error instanceof Error ? error.message : 'Profile update failed',
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
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await initialize();
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false
      });
    }
  });
};