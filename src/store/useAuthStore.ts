import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  },
  refreshUser: async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profile) {
          set({ user: profile as User, loading: false });
        } else {
          // If auth user exists but profile doesn't, create a temporary user object
          // to prevent redirection loop and allow the user to see the app.
          set({ 
            user: { 
              id: authUser.id, 
              email: authUser.email || '', 
              nombre: authUser.user_metadata?.nombre || 'Nuevo Usuario',
              role: 'scout' 
            } as User, 
            loading: false 
          });
        }
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      set({ user: null, loading: false });
    }
  }
}));
