import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  referral_code: string | null;
  is_admin: boolean;
  created_at: string;
}

interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phoneNumber: string, referralCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      set({ loading: true });

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ user: session.user, profile });
      }
    } finally {
      set({ loading: false });
    }

    // Set up auth state listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ user: session.user, profile });
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  signUp: async (email, password, fullName, phoneNumber, referralCode) => {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error('No user returned after signup');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email,
        full_name: fullName,
        phone_number: phoneNumber,
        referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referred_by: referralCode ? await getReferrerId(referralCode) : null
      });

    if (profileError) throw profileError;
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (error) throw error;

    // Refresh profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    set({ profile });
  }
}));

async function getReferrerId(referralCode: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .single();

  return data?.id || null;
}