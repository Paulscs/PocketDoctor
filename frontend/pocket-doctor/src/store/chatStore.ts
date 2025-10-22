import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FollowUpOption {
  readonly id: string;
  readonly text: string;
  readonly icon: string;
}

export interface Message {
  readonly id: string;
  readonly text: string;
  readonly isUser: boolean;
  readonly timestamp: Date;
  readonly followUpOptions?: readonly FollowUpOption[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatActions {
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  addUserMessage: (text: string) => void;
  addAIMessage: (
    text: string,
    followUpOptions?: readonly FollowUpOption[]
  ) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type ChatStore = ChatState & ChatActions;

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hola Ethan! 👋 Soy tu asistente médico con IA. He revisado tu historial médico y veo que tienes algunos valores que requieren atención, especialmente tu colesterol elevado (245 mg/dL). ¿Te gustaría que analicemos estos resultados juntos?",
    isUser: false,
    timestamp: new Date(),
    followUpOptions: [
      {
        id: "analyze-cholesterol",
        text: "Analizar mi colesterol elevado",
        icon: "heart-outline",
      },
      {
        id: "review-all-results",
        text: "Revisar todos mis resultados",
        icon: "document-text-outline",
      },
      {
        id: "get-recommendations",
        text: "Obtener recomendaciones",
        icon: "bulb-outline",
      },
      {
        id: "cholesterol",
        text: "Manejo del Colesterol",
        icon: "heart-outline",
      },
      {
        id: "hypertension",
        text: "Control de Hipertensión",
        icon: "pulse-outline",
      },
      {
        id: "allergies",
        text: "Gestión de Alergias",
        icon: "medical-outline",
      },
      {
        id: "general-health",
        text: "Salud General",
        icon: "fitness-outline",
      },
    ],
  },
];

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: initialMessages,
      isLoading: false,
      error: null,

      // Actions
      addMessage: message => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        };

        set(state => ({
          messages: [...state.messages, newMessage],
        }));
      },

      addUserMessage: (text: string) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          isUser: true,
          timestamp: new Date(),
        };

        set(state => ({
          messages: [...state.messages, newMessage],
        }));
      },

      addAIMessage: (
        text: string,
        followUpOptions?: readonly FollowUpOption[]
      ) => {
        const newMessage: Message = {
          id: (Date.now() + 1).toString(),
          text,
          isUser: false,
          timestamp: new Date(),
          followUpOptions,
        };

        set(state => ({
          messages: [...state.messages, newMessage],
        }));
      },

      clearMessages: () => {
        set({
          messages: initialMessages,
          isLoading: false,
          error: null,
        });
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
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        messages: state.messages,
      }),
    }
  )
);
