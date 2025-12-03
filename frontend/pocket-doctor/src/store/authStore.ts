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

export type RegisterPayload = {
  email: string;
  password: string;

  // camelCase desde el frontend (register.tsx)
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;        // "YYYY-MM-DD"
  gender?: string;             // "Masculino" | "Femenino" | ...
  height?: number;             // cm
  weight?: number;             // kg
  bloodType?: string;          // "A+","O-",...
  allergies?: string[];        // array opcional
  medicalConditions?: string[];// array opcional
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
    altura_cm?: number;
    peso_kg?: number;
    tipo_sangre?: string;
    alergias?: string[];
    condiciones_medicas?: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

// Helpers para normalizar
const nz = (v?: string) => (v && v.trim().length ? v : null);
const nn = (v?: number) => (typeof v === 'number' && !Number.isNaN(v) ? v : null);
const na = (v?: string[]) => (Array.isArray(v) ? v : []);

export const useAuthStore = create<AuthStore>((set) => ({
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
        console.warn('[auth] login:error', { code: (error as any)?.status, message: error.message });
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
      console.error('[auth] login:exception', e?.message ?? String(e));
      set({ isLoading: false });
      throw e;
    }
  },

  register: async ({
    email,
    password,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    height,
    weight,
    bloodType,
    allergies,
    medicalConditions,
  }) => {
    console.log('[auth] register:start', {
      email,
      meta: { firstName, lastName, dateOfBirth, gender, height, weight, bloodType, allergies, medicalConditions },
    });

    set({ isLoading: true, error: null });

    // 1) Guardar metadata en Auth (snake_case)
    const userMetadataSnake = {
      nombre: nz(firstName),
      apellido: nz(lastName),
      fecha_nacimiento: nz(dateOfBirth),   // "YYYY-MM-DD"
      sexo: nz(gender),
      altura_cm: nn(height),
      peso_kg: nn(weight),
      tipo_sangre: nz(bloodType),
      alergias: na(allergies),
      condiciones_medicas: na(medicalConditions),
    };

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadataSnake,
          // emailRedirectTo: 'pocketdoctor://auth-callback', // opcional si usas deep link
        },
      });

      if (error) {
        console.warn('[auth] register:error', { code: (error as any)?.status, message: error.message });
        set({ error: error.message, isLoading: false });
        throw error;
      }

      console.log('[auth] register:success', {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session, // con verificación por email suele ser false
      });

      // 2) Upsert inmediato a public.usuarios (sin depender del trigger)
      if (data.user) {
        const upsertPayload = {
          user_auth_id: data.user.id,
          email: data.user.email,
          nombre: userMetadataSnake.nombre,
          apellido: userMetadataSnake.apellido,
          fecha_nacimiento: userMetadataSnake.fecha_nacimiento, // "YYYY-MM-DD"
          sexo: userMetadataSnake.sexo,
          altura_cm: userMetadataSnake.altura_cm,
          peso_kg: userMetadataSnake.peso_kg,
          tipo_sangre: userMetadataSnake.tipo_sangre,
          alergias: userMetadataSnake.alergias?.length ? userMetadataSnake.alergias : null,
          condiciones_medicas: userMetadataSnake.condiciones_medicas?.length ? userMetadataSnake.condiciones_medicas : null,
        };

        const { error: upsertErr } = await supabase
          .from('usuarios')
          .upsert(upsertPayload, { onConflict: 'user_auth_id' });

        if (upsertErr) {
          console.error('[auth] usuarios.upsert:error', upsertErr.message);
          // No tiramos el registro si falla el upsert, pero lo dejamos en consola:
          // throw upsertErr;
        } else {
          console.log('[auth] usuarios.upsert:success', { user_auth_id: data.user.id });
        }
      }

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
