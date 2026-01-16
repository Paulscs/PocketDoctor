import React, { useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n";

interface ChatSession {
  readonly id: string;
  readonly title: string;
  readonly timestamp: Date;
  readonly messageCount: number;
  readonly isActive: boolean;
}

interface SideMenuProps {
  readonly isVisible: boolean;
  readonly onClose: () => void;
  readonly chatSessions: readonly ChatSession[];
  readonly onSelectSession: (sessionId: string) => void;
  // readonly onCreateNewChat: () => void; // Removed per requirements
  readonly onDeleteSession: (sessionId: string) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const MENU_WIDTH = screenWidth * 0.8;

export function SideMenu({
  isVisible,
  onClose,
  chatSessions,
  onSelectSession,
  // onCreateNewChat,
  onDeleteSession,
}: SideMenuProps) {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.surface },
    "background"
  );
  const borderColor = useThemeColor(
    { light: Colors.light.borderGray, dark: Colors.dark.border },
    "border"
  );

  const slideAnimation = React.useRef(new Animated.Value(-MENU_WIDTH)).current;

  const menuContainerStyle = useMemo(
    () => [
      styles.menuContainer,
      { backgroundColor, borderRightColor: borderColor },
    ],
    [backgroundColor, borderColor]
  );

  const formatDate = useCallback((date: Date) => {
    // Ensure we have a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t('common.today');
    if (diffDays === 2) return t('common.yesterday');
    if (diffDays <= 7) return t('common.days_ago', { count: diffDays });

    return dateObj.toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "short",
    });
  }, [t]);

  const handleSessionSelect = useCallback(
    (sessionId: string) => {
      onSelectSession(sessionId);
      onClose();
    },
    [onSelectSession, onClose]
  );

  // const handleNewChat = useCallback(() => {
  //   onCreateNewChat();
  //   onClose();
  // }, [onCreateNewChat, onClose]);

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: -MENU_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnimation]);

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
      )}

      {/* Side Menu */}
      <Animated.View
        style={[
          menuContainerStyle,
          { transform: [{ translateX: slideAnimation }] },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <IconSymbol
                name="message.fill"
                size={24}
                color={Colors.light.brandBlue}
              />
              <ThemedText style={styles.headerTitle}>{t('chat.sidemenu.chats')}</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <IconSymbol name="xmark" size={20} color={Colors.light.muted} />
            </TouchableOpacity>
          </View>

          {/* New Chat Button */}
          {/* New Chat Button Removed */}
          {/* <TouchableOpacity
            style={styles.newChatButton}
            onPress={handleNewChat}
            activeOpacity={0.7}
          >
            <IconSymbol name="plus" size={20} color={Colors.light.white} />
            <ThemedText style={styles.newChatText}>
              Nueva conversación
            </ThemedText>
          </TouchableOpacity> */}

          {/* Chat Sessions */}
          <ScrollView
            style={styles.sessionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {chatSessions.map(session => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.sessionItem,
                  session.isActive && styles.activeSessionItem,
                ]}
                onPress={() => handleSessionSelect(session.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sessionContent}>
                  <View style={styles.sessionInfo}>
                    <ThemedText
                      style={[
                        styles.sessionTitle,
                        session.isActive && styles.activeSessionTitle,
                      ]}
                      numberOfLines={2}
                    >
                      {session.title}
                    </ThemedText>
                    <View style={styles.sessionMeta}>
                      <ThemedText style={styles.sessionDate}>
                        {formatDate(session.timestamp)}
                      </ThemedText>
                      <ThemedText style={styles.sessionCount}>
                        {session.messageCount} {t('common.messages')}
                      </ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeleteSession(session.id)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name="trash"
                      size={16}
                      color={Colors.light.muted}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {chatSessions.length === 0 && (
              <View style={styles.emptyState}>
                <IconSymbol
                  name="message"
                  size={48}
                  color={Colors.light.muted}
                />
                <ThemedText style={styles.emptyStateText}>
                  {t('chat.sidemenu.empty')}
                </ThemedText>
                <ThemedText style={styles.emptyStateSubtext}>
                  {t('chat.sidemenu.empty_desc')}
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 998,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    borderRightWidth: 1,
    zIndex: 999,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  safeArea: {
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.brandBlue,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.brandBlue,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  newChatText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
  sessionsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  sessionItem: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  activeSessionItem: {
    backgroundColor: Colors.light.friendlyBlueBg,
    borderWidth: 1,
    borderColor: Colors.light.friendlyBlueBorder,
  },
  sessionContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  sessionInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.textGray,
    marginBottom: Spacing.xs,
  },
  activeSessionTitle: {
    color: Colors.light.brandBlue,
    fontWeight: "600",
  },
  sessionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDate: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  sessionCount: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.muted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
