// src/store/authStore.ts
import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { getUserProfile, UserProfile } from '../services/user';

export type User = SupabaseUser;
export type AuthState = {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
};
export type AuthActions = {
   clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (p: {
    email: string;
    password: string;
    nombre?: string;
    apellido?: string;
    fecha_nacimiento?: string;
    sexo?: string;
    estatura?: number;
    peso?: number;
    tipo_sangre?: string;
    alergias?: string[];
    condiciones_medicas?: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
};
export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  userProfile: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    console.log('[auth] login:start', { email });
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.warn('[auth] login:error', { code: (error as any).status, message: error.message });
        // Mensajes típicos que devuelve Supabase:
        // - "Invalid login credentials" (credenciales malas o email no verificado si lo exiges)
        set({ error: error.message, isLoading: false });
        throw error;
      }

      console.log('[auth] login:success', {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session,
      });

      // Fetch user profile after successful login
      if (data.session?.access_token) {
        try {
          const profile = await getUserProfile(data.session.access_token);
          set({ user: data.user ?? null, session: data.session ?? null, userProfile: profile, isLoading: false });
        } catch (profileError) {
          console.error('[auth] failed to fetch user profile after login:', profileError);
          set({ user: data.user ?? null, session: data.session ?? null, userProfile: null, isLoading: false });
        }
      } else {
        // Fetch user profile after successful registration
        if (data.session?.access_token) {
          try {
            const profile = await getUserProfile(data.session.access_token);
            set({ user: data.user ?? null, session: data.session ?? null, userProfile: profile, isLoading: false });
          } catch (profileError) {
            console.error('[auth] failed to fetch user profile after register:', profileError);
            set({ user: data.user ?? null, session: data.session ?? null, userProfile: null, isLoading: false });
          }
        } else {
          set({ user: data.user ?? null, session: data.session ?? null, isLoading: false });
        }
      }
    } catch (e: any) {
      // e?.message ya se setea arriba, pero dejamos doble registro
      console.error('[auth] login:exception', e?.message ?? String(e));
      set({ isLoading: false });
      throw e;
    }
  },

  register: async ({ email, password, ...meta }) => {
    console.log('[auth] register:start', { email, meta });
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: meta },
      });

      if (error) {
        console.warn('[auth] register:error', { code: (error as any).status, message: error.message });
        // Ejemplos: "User already registered", "Password should be at least 6 characters"
        set({ error: error.message, isLoading: false });
        throw error;
      }

      console.log('[auth] register:success', {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session, // si tienes verificación por email, suele ser false
      });

      set({ user: data.user ?? null, session: data.session ?? null, isLoading: false });
    } catch (e: any) {
      console.error('[auth] register:exception', e?.message ?? String(e));
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    console.log('[auth] logout:start');
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.signOut();
      console.log('[auth] logout:success');
      set({ user: null, session: null, userProfile: null, isLoading: false });
    } catch (e: any) {
      console.error('[auth] logout:exception', e?.message ?? String(e));
      set({ error: e?.message ?? 'Error al cerrar sesión', isLoading: false });
      throw e;
    }
  },
}));

// Log de cambios de sesión (útil para depurar)
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('[auth] onAuthStateChange', { event, userId: session?.user?.id, hasSession: !!session });

  // Update store when session changes
  if (event === 'SIGNED_IN' && session?.access_token) {
    try {
      const profile = await getUserProfile(session.access_token);
      useAuthStore.setState({ user: session.user, session, userProfile: profile });
    } catch (error) {
      console.error('[auth] failed to fetch profile on auth state change:', error);
      useAuthStore.setState({ user: session.user, session, userProfile: null });
    }
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, session: null, userProfile: null });
  }
});
