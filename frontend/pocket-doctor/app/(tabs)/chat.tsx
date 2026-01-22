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
  useAuthStore
} from "@/src/store";
import {
  useChatStore,
  useActiveSession,
  useActiveSessionMessages,
  FollowUpOption,
  getDefaultFollowUpOptions,
} from "@/src/store/chatStore";
import { useTranslation } from "react-i18next";
import { SideMenu } from "@/components/layout/SideMenu";
import { UserAvatar } from "@/components/ui/UserAvatar";
import * as Location from 'expo-location';
import { getNearestClinics, EspecialistaCentro } from "@/src/services/clinics";
import { Alert } from "react-native";

export default function ChatScreen() {
  const { t } = useTranslation();
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

  const session = useAuthStore((state) => state.session);
  const accessToken = session?.access_token || '';

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

  const handleFindNearbyClinics = useCallback(async (sessionId: string, specialty?: string) => {
    try {
      // 1. Request Permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        addAIMessage(sessionId, t('chat.location_needed'));
        return;
      }

      // 2. Get Location
      // addAIMessage(sessionId, "Buscando especialistas cerca de ti..."); // Optional: "Thinking" state
      let location = await Location.getCurrentPositionAsync({});

      // 3. Call API
      const clinics = await getNearestClinics(
        location.coords.latitude,
        location.coords.longitude,
        3, // limit
        accessToken,
        specialty // Pass specialty filter
      );

      // Access Token is needed.
      console.log("[FindNearby] Token being used:", accessToken ? accessToken.substring(0, 10) + "..." : "NULL/EMPTY");

      const messageText = specialty
        ? t('chat.specialists_found', { count: clinics.length, specialty })
        : t('chat.clinics_found', { count: clinics.length });

      addAIMessage(
        sessionId,
        messageText,
        [],
        { type: 'clinics_list', data: clinics }
      );

    } catch (error) {
      console.error(error);
      addAIMessage(sessionId, t('chat.error_finding_clinics'));
    }
  }, [accessToken, addAIMessage]);

  const handleFollowUpOption = useCallback(
    async (option: FollowUpOption, messageId: string) => {
      if (!activeSessionId) return;

      addUserMessage(activeSessionId, option.text);

      if (option.id === 'find_specialists_nearby') {
        // Use the recommended specialist from context if available
        const specialist = activeSession?.context?.recommended_specialist;
        await handleFindNearbyClinics(activeSessionId, specialist);
        return;
      }


      setTimeout(() => {
        const followUpResponse = generateFollowUpResponse(option.id);
        addAIMessage(
          activeSessionId,
          followUpResponse.text,
          followUpResponse.followUpOptions
        );
      }, 600);
    },
    [activeSessionId, addUserMessage, addAIMessage, activeSession, handleFindNearbyClinics] // Add handleFindNearbyClinics dependency
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
          followUpOptions: getDefaultFollowUpOptions(t), // Use default options for re-engagement
        };
      }
    }

    // 2. Fallback to generic responses (if no analysis context exists)
    switch (optionId) {
      case "simple_explanation":
        return {
          text: t('chat.responses.simple_explanation'),
          followUpOptions: getDefaultFollowUpOptions(t),
        };
      case "lifestyle_changes":
        return {
          text: t('chat.responses.lifestyle_changes'),
          followUpOptions: getDefaultFollowUpOptions(t),
        };
      case "causes":
        return {
          text: t('chat.responses.causes'),
          followUpOptions: getDefaultFollowUpOptions(t),
        };
      case "warning_signs":
        return {
          text: t('chat.responses.warning_signs'),
          followUpOptions: getDefaultFollowUpOptions(t),
        };
      case "doctor_questions":
        return {
          text: t('chat.responses.doctor_questions'),
          followUpOptions: getDefaultFollowUpOptions(t),
        };

      default:
        return {
          text: t('chat.responses.default'),
          followUpOptions: getDefaultFollowUpOptions(t),
        };
    }
  };

  // Inject "Find Nearby" into generic responses or as a default if appropriate
  // For now, let's manually add it to options if it's "doctor_questions" or we can just append it.
  const injectFindNearby = (response: { text: string; followUpOptions: FollowUpOption[] }) => {
    response.followUpOptions = [
      ...response.followUpOptions,
      { id: 'find_specialists_nearby', text: t('chat.find_nearby'), icon: 'map-outline' }
    ];
    return response;
  };

  // Wrap generateFollowUpResponse or use logic inside handleFollowUpOption response generation
  // Since the output of handleFollowUp uses generateFollowUpResponse inside strict timeout,
  // We should modify generateFollowUpResponse to return it.


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>


      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.menuButtonInline}
            onPress={handleMenuPress}
            activeOpacity={0.7}
            accessibilityLabel="Abrir menú de conversaciones"
            accessibilityRole="button"
          >
            <IconSymbol
              name="line.3.horizontal"
              size={24}
              color={Colors.light.brandBlue}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t('chat.title')}</ThemedText>
        </View>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <IconSymbol name="doc.fill" size={64} color={Colors.light.brandBlue} />
            </View>
            <ThemedText style={styles.emptyTitle}>{t('chat.no_conversations')}</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              {t('chat.no_conversations_desc')}
            </ThemedText>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push("/upload")}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.uploadButtonText}>{t('chat.upload_analysis')}</ThemedText>
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
                  
                      <ThemedText style={styles.followUpText}>
                        {option.text}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Render Custom Content (Clinics List) */}
              {message.customContent?.type === 'clinics_list' && (
                <View style={{ marginLeft: 44, marginTop: 8, marginBottom: 16 }}>
                  {message.customContent.data.map((clinic: any, index: number) => (
                    <TouchableOpacity
                      key={clinic.id || index}
                      style={styles.clinicCard}
                      onPress={() => router.push(`/clinic/${clinic.id}`)}
                    >
                      <View style={styles.clinicCardIcon}>
                        <Ionicons name="medical" size={20} color={Colors.light.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.clinicCardTitle}>{clinic.nombre}</ThemedText>

                        {/* Show specialists if available */}
                        {clinic.especialistas && clinic.especialistas.length > 0 && (
                          <ThemedText style={{ fontSize: 12, color: Colors.light.brandBlue, marginTop: 2 }}>
                            {clinic.especialistas.length} {clinic.especialistas.length === 1 ? t('chat.specialist') : t('chat.specialists')}: {clinic.especialistas.map((e: any) => e.apellido || e.nombre).slice(0, 2).join(", ")}
                            {clinic.especialistas.length > 2 ? "..." : ""}
                          </ThemedText>
                        )}

                        <ThemedText style={styles.clinicCardAddress} numberOfLines={1}>{clinic.direccion}</ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.light.gray} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}

      </ScrollView>

      {/* Medical Disclaimer Inside Chat */}
      < View style={styles.warningSection} >
        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning" size={20} color={Colors.light.white} />
          </View>
          <View style={styles.warningContent}>
            <ThemedText style={styles.warningTitle}>{t('chat.warning_title')}</ThemedText>
            <ThemedText style={styles.warningText}>
              {t('chat.warning_text')}
            </ThemedText>
          </View>
        </View>
      </View>
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
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },




  chatContainer: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
  },
  chatContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    flexGrow: 1,
  },

  // New Header Styles
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  menuButtonInline: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.brandBlue,
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
    fontSize: 14,
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
    marginBottom: 6,
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
    marginBottom: Spacing.md,
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


  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  clinicCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.brandBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textGray,
  },
  clinicCardAddress: {
    fontSize: 12,
    color: Colors.light.gray,
  },
});
