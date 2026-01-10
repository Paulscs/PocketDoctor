import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Basic types
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
  readonly customContent?: {
    type: 'clinics_list';
    data: any[];
  };
}

export interface QAContext {
  simple_explanation: string;
  lifestyle_changes: string;
  causes: string;
  warning_signs: string;
  doctor_questions: string;
}

export interface ChatSession {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly Message[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly analysisId?: string; // Link to specific analysis ID
  // Optional context from an analysis
  readonly context?: {
    qa: QAContext;
    summary?: string;
    recommended_specialist?: string;
  };
}

export interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatActions {
  createNewSession: (title?: string) => string;
  createSessionFromAnalysis: (data: any, analysisId: string) => string; // Updated Action
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
    followUpOptions?: readonly FollowUpOption[],
    customContent?: Message['customContent']
  ) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  clearAllSessions: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type ChatStore = ChatState & ChatActions;

export const DEFAULT_FOLLOW_UP_OPTIONS: FollowUpOption[] = [
  {
    id: "simple_explanation",
    text: "Explícame qué significan estos resultados",
    icon: "chatbubble-ellipses-outline",
  },
  {
    id: "lifestyle_changes",
    text: "¿Qué cambios de estilo de vida recomiendas?",
    icon: "nutrition-outline",
  },
  {
    id: "causes",
    text: "¿Cuáles podrían ser las causas?",
    icon: "search-outline",
  },
  {
    id: "warning_signs",
    text: "¿Hay señales de alerta urgentes?",
    icon: "warning-outline",
  },
  {
    id: "doctor_questions",
    text: "¿Qué preguntas hacerle a mi médico?",
    icon: "medical-outline",
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    text: "¡Hola! 👋 Soy tu asistente médico con IA. He revisado tus resultados. ¿Qué te gustaría saber primero?",
    isUser: false,
    timestamp: new Date(),
    followUpOptions: DEFAULT_FOLLOW_UP_OPTIONS,
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
      sessions: [],
      activeSessionId: null,
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

      createSessionFromAnalysis: (data: any, analysisId: string) => {
        // 1. Check if session already exists for this analysisId
        const existingSession = get().sessions.find(
          s => s.analysisId === analysisId
        );

        if (existingSession) {
          // Resume existing session
          set({ activeSessionId: existingSession.id });
          return existingSession.id;
        }

        // 2. Create new session if not found
        const sessionId = Date.now().toString();
        // Parse context if available (assuming data matches backend LLMInterpretation)
        // Handle potential case sensitivity issues from LLM raw JSON
        const qa = data?.qa || data?.QA || data?.Qa;
        const summary = data?.summary || data?.Summary || data?.SUMMARY;
        const recommended_specialist = data?.recommended_specialist;

        // Custom Initial Messages Logic
        // Deep copy converts Date to string, so we must restore it.
        let customMessages = JSON.parse(JSON.stringify(initialMessages)).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));

        if (recommended_specialist) {
          const specialistOption: FollowUpOption = {
            id: "find_specialists_nearby",
            text: `Buscar ${recommended_specialist} cercanos`,
            icon: "map-outline",
          };
          // Add to first message options
          if (customMessages[0] && customMessages[0].followUpOptions) {
            customMessages[0].followUpOptions.push(specialistOption);
          }
        }

        // Start with the standard initial message, but we will use the QA context for answers
        const newSession: ChatSession = {
          id: sessionId,
          title: `Análisis ${new Date().toLocaleDateString()}`,
          messages: customMessages, // Use dynamic messages
          createdAt: new Date(),
          updatedAt: new Date(),
          analysisId: analysisId,    // Store the link
          context: qa ? { qa, summary, recommended_specialist } : undefined,
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
        followUpOptions?: readonly FollowUpOption[],
        customContent?: Message['customContent']
      ) => {
        const newMessage: Message = {
          id: (Date.now() + 1).toString(),
          text,
          isUser: false,
          timestamp: new Date(),
          followUpOptions,
          customContent,
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
      name: "chat-storage-v2",
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
const EMPTY_MESSAGES: readonly Message[] = [];

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
    return activeSession?.messages || EMPTY_MESSAGES;
  });
};
