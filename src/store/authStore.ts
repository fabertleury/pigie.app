import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<User>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialize: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Sessão inicial:', session);

      if (session?.user) {
        // Fetch user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('Perfil do usuário:', { profile, profileError });

        if (profileError) {
          console.warn('Erro ao buscar perfil:', profileError);
        }

        set({ 
          user: {
            ...session.user,
            ...profile
          } as User,
          loading: false
        });
      } else {
        set({ 
          user: null, 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Erro na inicialização de autenticação:', error);
      set({ 
        user: null, 
        loading: false 
      });
    }
  },
  signIn: async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Fetch user profile data after successful sign in
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      set({ 
        user: {
          ...data.user,
          ...profile
        } as User 
      });
    }
  },
  signUp: async (email, password) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          email, // Include email in user metadata
        }
      }
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch the newly created profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      set({ 
        user: {
          ...data.user,
          ...profile
        } as User 
      });
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  updateUserProfile: async (updates: Partial<User>) => {
    try {
      const state = get();
      if (!state.user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Atualizando perfil do usuário', {
        userId: state.user.id,
        updates
      });

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }

      console.log('Perfil atualizado com sucesso', { updatedProfile: data });

      // Atualizar estado local
      set(state => ({
        user: {
          ...state.user,
          ...data
        }
      }));

      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      throw error;
    }
  },
}));