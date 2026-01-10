import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  useChatStore,
  useActiveSession,
  useActiveSessionMessages,
  FollowUpOption,
  DEFAULT_FOLLOW_UP_OPTIONS,
} from "@/src/store/chatStore";
import { SideMenu } from "@/components/layout/SideMenu";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function ChatScreen() {
  const containerBg = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, "background");
  const headerBg = useThemeColor({ light: Colors.light.white, dark: Colors.dark.surface }, "surface");

  // Store hooks
  const {
    activeSessionId,
    addUserMessage,
    addAIMessage,
    createNewSession,
    setActiveSession,
    deleteSession,
    clearAllSessions,
    setError,
    sessions,
  } = useChatStore();

  const messages = useActiveSessionMessages();
  const activeSession = useActiveSession();

  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);

  // Menu handlers
  const handleMenuPress = () => setIsSideMenuVisible(true);
  const handleCloseSideMenu = () => setIsSideMenuVisible(false);
  const handleProfilePress = () => router.push("/(tabs)/profile");

  const handleSelectSession = (id: string) => {
    setActiveSession(id);
    setIsSideMenuVisible(false);
  };

  const handleCreateNewChat = () => {
    // Disabled generic chat creation. Redirect to upload if needed.
    router.push("/upload");
    setIsSideMenuVisible(false);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    // If we became empty? deleteSession logic in store handles re-selecting or null.
    // However, if we delete the LAST session, store sets activeSessionId to null?
    // Let's check store logic.
  };

  const handleFollowUpOption = useCallback(
    (option: FollowUpOption, messageId: string) => {
      if (!activeSessionId) return;

      addUserMessage(activeSessionId, option.text);


      setTimeout(() => {
        const followUpResponse = generateFollowUpResponse(option.id);
        addAIMessage(
          activeSessionId,
          followUpResponse.text,
          followUpResponse.followUpOptions
        );
      }, 600);
    },
    [activeSessionId, addUserMessage, addAIMessage, activeSession] // Add activeSession dependency
  );

  const generateFollowUpResponse = (
    optionId: string
  ): { text: string; followUpOptions: FollowUpOption[] } => {

    // 1. Try to get answer from the real AI context (Pre-generated Q&A)
    const qaContext = activeSession?.context?.qa;

    if (qaContext) {
      // Map option IDs to QA keys
      type QAKey = keyof typeof qaContext;
      const keyMap: Record<string, QAKey> = {
        simple_explanation: "simple_explanation",
        lifestyle_changes: "lifestyle_changes",
        causes: "causes",
        warning_signs: "warning_signs",
        doctor_questions: "doctor_questions",
      };

      const qaKey = keyMap[optionId];
      if (qaKey && qaContext[qaKey]) {
        return {
          text: qaContext[qaKey],
          followUpOptions: DEFAULT_FOLLOW_UP_OPTIONS, // Use default options for re-engagement
        };
      }
    }

    // 2. Fallback to generic responses (if no analysis context exists)
    switch (optionId) {
      case "simple_explanation":
        return {
          text: "No tengo el contexto específico de un análisis para explicarte. Por favor, sube un documento primero para analizarlo.",
          followUpOptions: DEFAULT_FOLLOW_UP_OPTIONS,
        };
      case "lifestyle_changes":
        return {
          text: "Para recomendaciones precisas, necesito que analicemos tus resultados de laboratorio primero.",
          followUpOptions: DEFAULT_FOLLOW_UP_OPTIONS,
        };
      case "causes":
        return {
          text: "Necesito ver tus resultados para identificar posibles causas. ¿Te gustaría subir un análisis?",
          followUpOptions: DEFAULT_FOLLOW_UP_OPTIONS,
        };
      case "warning_signs":
        return {
          text: "Sin datos recientes es difícil alertarte. En general, dolor torácico o dificultad respiratoria son urgencias.",
          followUpOptions: DEFAULT_FOLLOW_UP_OPTIONS,
        };
      case "doctor_questions":
        return {
          text: "Lo ideal es preguntar basado en tus números. Sube un PDF para generarte las preguntas exactas.",
          followUpOptions: DEFAULT_FOLLOW_UP_OPTIONS,
        };

      default:
        return {
          text: "Entiendo. Estoy procesando esa solicitud.",
          followUpOptions: DEFAULT_FOLLOW_UP_OPTIONS,
        };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            activeOpacity={0.7}
            accessibilityLabel="Abrir menú de conversaciones"
            accessibilityRole="button"
          >
            <IconSymbol
              name="line.3.horizontal"
              size={20}
              color={Colors.light.brandBlue}
            />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logoBlue.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.logoText}>POCKET DOCTOR</ThemedText>
          </View>
        </View>
        <View style={styles.headerRight}>
          <ThemedText style={styles.pageTitle}>Chat</ThemedText>
          <UserAvatar />
        </View>
      </View>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <IconSymbol name="doc.fill" size={64} color={Colors.light.brandBlue} />
            </View>
            <ThemedText style={styles.emptyTitle}>No hay conversaciones</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Para chatear con el asistente médico, primero necesitas analizar un resultado de laboratorio.
            </ThemedText>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push("/upload")}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.uploadButtonText}>Subir Análisis</ThemedText>
              <IconSymbol name="chevron.right" size={20} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
        ) : (
          messages.map(message => (
            <View key={message.id}>
              <View
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.aiMessage,
                ]}
              >
                {!message.isUser && (
                  <View style={styles.aiIcon}>
                    <Image
                      source={require("@/assets/images/logoBlue.png")}
                      style={styles.aiLogo}
                      resizeMode="contain"
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userText : styles.aiText,
                    ]}
                  >
                    {message.text}
                  </ThemedText>
                </View>
              </View>

              {message.followUpOptions && message.followUpOptions.length > 0 && (
                <View style={styles.followUpContainer}>
                  {message.followUpOptions.map(option => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.followUpOption}
                      onPress={() => handleFollowUpOption(option, message.id)}
                      activeOpacity={0.7}
                      accessibilityLabel={option.text}
                      accessibilityRole="button"
                      accessibilityHint="Selecciona esta opción para continuar la conversación"
                    >
                      <Ionicons
                        name={option.icon as keyof typeof Ionicons.glyphMap}
                        size={16}
                        color={Colors.light.brandBlue}
                      />
                      <ThemedText style={styles.followUpText}>
                        {option.text}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}

        {/* Medical Disclaimer Inside Chat */}
        <View style={styles.warningSection}>
          <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={20} color={Colors.light.white} />
            </View>
            <View style={styles.warningContent}>
              <ThemedText style={styles.warningTitle}>Advertencia</ThemedText>
              <ThemedText style={styles.warningText}>
                Esta aplicación es solo para fines informativos y no reemplaza
                el diagnóstico médico profesional. Siempre consulte con un
                médico calificado para obtener asesoramiento médico adecuado.
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Side Menu */}
      <SideMenu
        isVisible={isSideMenuVisible}
        onClose={handleCloseSideMenu}
        chatSessions={sessions.map(session => ({
          id: session.id,
          title: session.title,
          timestamp: session.updatedAt,
          messageCount: session.messages.length,
          isActive: session.id === activeSessionId,
        }))}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },
  profileIcon: {
    width: 32,
    height: 32,
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.white,
  },

  chatContainer: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
  },
  chatContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.sm,
    flexGrow: 1,
  },

  messageContainer: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    alignItems: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  aiIcon: {
    width: 32,
    height: 32,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.brandBlue,
  },
  aiLogo: {
    width: 20,
    height: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.light.brandBlue,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.light.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.light.white,
  },
  aiText: {
    color: Colors.light.textGray,
  },

  followUpContainer: {
    marginTop: Spacing.sm,
    marginLeft: 44,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  followUpOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.brandBlue,
    gap: Spacing.sm,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  followUpText: {
    fontSize: 14,
    color: Colors.light.brandBlue,
    fontWeight: "500",
  },

  warningSection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  warningCard: {
    backgroundColor: Colors.light.warningBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.light.warningBorder,
  },
  warningIcon: {
    width: 32,
    height: 32,
    backgroundColor: Colors.light.warning,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: Colors.light.warningText,
    lineHeight: 16,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.textGray,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: "80%",
    marginBottom: Spacing.xl,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.brandBlue,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.circle,
    gap: Spacing.sm,
    elevation: 4,
    shadowColor: Colors.light.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
});
