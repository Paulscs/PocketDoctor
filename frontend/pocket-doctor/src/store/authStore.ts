// src/store/authStore.ts
import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;
export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
};
export type AuthActions = {
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (p: {
    email: string; password: string;
    nombre?: string; apellido?: string;
    fecha_nacimiento?: string; sexo?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};
export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
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

      set({ user: data.user ?? null, session: data.session ?? null, isLoading: false });
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
        email,
        password,
        options: {
          data: {
            firstName,       // string
            lastName,        // string
            gender,          // "Masculino" | "Femenino" | etc
            dateOfBirth,     // "YYYY-MM-DD"  <- en tu register.tsx haz el formato de la Date
            height,          // number (cm)
            weight,          // number (kg)
            bloodType,       // "A+","O-", etc.
            allergies,       // string[]
            medicalConditions// string[]
          }
        }
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
      set({ user: null, session: null, isLoading: false });
    } catch (e: any) {
      console.error('[auth] logout:exception', e?.message ?? String(e));
      set({ error: e?.message ?? 'Error al cerrar sesión', isLoading: false });
      throw e;
    }
  },
}));

// Log de cambios de sesión (útil para depurar)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[auth] onAuthStateChange', { event, userId: session?.user?.id, hasSession: !!session });
});
