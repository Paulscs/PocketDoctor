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

export interface ChatSession {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly Message[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatActions {
  createNewSession: (title?: string) => string;
  setActiveSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  addMessage: (
    sessionId: string,
    message: Omit<Message, "id" | "timestamp">
  ) => void;
  addUserMessage: (sessionId: string, text: string) => void;
  addAIMessage: (
    sessionId: string,
    text: string,
    followUpOptions?: readonly FollowUpOption[]
  ) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  clearAllSessions: () => void;
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

const initialSession: ChatSession = {
  id: "initial-session",
  title: "Conversación inicial",
  messages: initialMessages,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: [initialSession],
      activeSessionId: "initial-session",
      isLoading: false,
      error: null,

      // Actions
      createNewSession: (title?: string) => {
        const sessionId = Date.now().toString();
        const newSession: ChatSession = {
          id: sessionId,
          title: title || `Conversación ${get().sessions.length + 1}`,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: sessionId,
        }));

        return sessionId;
      },

      setActiveSession: (sessionId: string) => {
        set({ activeSessionId: sessionId });
      },

      deleteSession: (sessionId: string) => {
        set(state => {
          const newSessions = state.sessions.filter(
            session => session.id !== sessionId
          );
          const newActiveSessionId =
            state.activeSessionId === sessionId
              ? newSessions[0]?.id || null
              : state.activeSessionId;

          return {
            sessions: newSessions,
            activeSessionId: newActiveSessionId,
          };
        });
      },

      addMessage: (sessionId: string, message) => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        };

        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  updatedAt: new Date(),
                }
              : session
          ),
        }));
      },

      addUserMessage: (sessionId: string, text: string) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          isUser: true,
          timestamp: new Date(),
        };

        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  updatedAt: new Date(),
                }
              : session
          ),
        }));
      },

      addAIMessage: (
        sessionId: string,
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
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  updatedAt: new Date(),
                }
              : session
          ),
        }));
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title, updatedAt: new Date() }
              : session
          ),
        }));
      },

      clearAllSessions: () => {
        set({
          sessions: [initialSession],
          activeSessionId: "initial-session",
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
        sessions: state.sessions.map(session => ({
          ...session,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          messages: session.messages.map(message => ({
            ...message,
            timestamp: message.timestamp.toISOString(),
          })),
        })),
        activeSessionId: state.activeSessionId,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.sessions = state.sessions.map(session => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map(message => ({
              ...message,
              timestamp: new Date(message.timestamp),
            })),
          }));
        }
      },
    }
  )
);

// Selectors for better performance
export const useActiveSession = () => {
  return useChatStore(state => {
    return state.sessions.find(session => session.id === state.activeSessionId);
  });
};

export const useChatSessions = () => {
  return useChatStore(state => state.sessions);
};

export const useActiveSessionMessages = () => {
  return useChatStore(state => {
    const activeSession = state.sessions.find(
      session => session.id === state.activeSessionId
    );
    return activeSession?.messages || [];
  });
};
