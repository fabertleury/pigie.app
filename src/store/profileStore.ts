import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface ProfileState {
  updatePixKey: (key: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>(() => ({
  updatePixKey: async (pixKey: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ pix_key: pixKey })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  }
}));