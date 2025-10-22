import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  gender?: string;
  dateOfBirth?: Date;
  allergies?: string[];
  medicalConditions?: string[];
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Mock user data for now
          const mockUser: User = {
            id: "1",
            email,
            firstName: "John",
            lastName: "Doe",
            height: 175,
            weight: 70,
            bloodType: "O+",
            gender: "Masculino",
            dateOfBirth: new Date("1990-01-01"),
            allergies: [],
            medicalConditions: [],
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
        }
      },

      register: async userData => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          const newUser: User = {
            id: Date.now().toString(),
            email: userData.email!,
            firstName: userData.firstName!,
            lastName: userData.lastName!,
            height: userData.height,
            weight: userData.weight,
            bloodType: userData.bloodType,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth,
            allergies: userData.allergies || [],
            medicalConditions: userData.medicalConditions || [],
          };

          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Registration failed",
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: async userData => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));

          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("No user logged in");
          }

          const updatedUser: User = {
            ...currentUser,
            ...userData,
          };

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Profile update failed",
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
