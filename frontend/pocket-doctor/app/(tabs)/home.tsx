import React, { useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { CustomLoader } from "@/components/ui/CustomLoader";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { SearchBar } from "@/components/ui/SearchBar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuthStore } from "@/src/store";
import { useTranslation } from "react-i18next";
import { getUserProfile, getRootMessage, UserProfile } from "@/src/services/user";
import { apiClient } from "@/src/utils/apiClient";
import { useState } from "react";

export default function HomeScreen() {
  const { t } = useTranslation();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [rootMessage, setRootMessage] = useState<string>("");
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  const { user, session, userProfile } = useAuthStore();

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor }],
    [backgroundColor]
  );

  const headerStyle = useMemo(
    () => [styles.header, { borderBottomColor: Colors.light.borderGray }],
    []
  );

  const greetingText = useMemo(
    () => {
      if (userProfile?.nombre) {
        return `${t('home.hello')}, ${userProfile.nombre}`;
      }
      return `${t('home.hello')}, ${user?.email?.split('@')[0] || "Usuario"}`;
    },
    [user?.email, userProfile]
  );

  const handleUploadResults = useCallback(() => {
    router.push("/upload");
  }, []);

  const handleAIConsultation = useCallback(() => {
    router.push("/(tabs)/chat");
  }, []);

  const handleViewAllActivities = useCallback(() => {
    router.push("/(tabs)/history");
  }, []);

  const handleProfilePress = useCallback(() => {
    router.push("/(tabs)/profile");
  }, []);

  // State for Recent Activities
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;

    let mounted = true;

    const loadAllData = async () => {
      try {
        setIsPageLoading(true);
        const promises = [];

        // 1. Profile (only if needed)
        if (!userProfile) {
          promises.push(
            getUserProfile(token).catch((e) =>
              console.error("[home] user profile fetch error:", e)
            )
          );
        }

        // 2. Root Message
        promises.push(
          getRootMessage()
            .then((res) => {
              if (mounted && res?.message) setRootMessage(res.message);
            })
            .catch((e) => console.error("[home] root message fetch error:", e))
        );

        // 3. Recent Activities
        promises.push(
          apiClient("ocr-local/history", { token })
            .then(async (response) => {
              if (response.ok) {
                const data = await response.json();
                const topActivities = data.slice(0, 3).map((item: any) => ({
                  id: item.id.toString(),
                  title: item.titulo, // Fallback handled in render
                  date: item.created_at,
                  type: item.tipo || "other",
                  status: item.estado === "alert" ? "elevated" : "normal",
                  description: item.resumen,
                }));
                if (mounted) setRecentActivities(topActivities);
              }
            })
            .catch((e) => console.error("[home] activities fetch error:", e))
        );

        await Promise.allSettled(promises);
      } catch (e) {
        console.error("Error loading home data:", e);
      } finally {
        if (mounted) {
          setIsPageLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      mounted = false;
    };
  }, [session?.access_token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return Colors.light.healthGreen;
      case "elevated": return Colors.light.warning;
      case "critical": return Colors.light.error;
      default: return Colors.light.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal": return t('home.status.normal');
      case "elevated": return t('home.status.elevated');
      case "critical": return t('home.status.critical');
      default: return t('home.status.info');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t('home.time_ago.moment');
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return t('home.time_ago.minutes', { count: diffInMinutes });
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('home.time_ago.hours', { count: diffInHours });
    const diffInDays = Math.floor(diffInHours / 24);
    return t('home.time_ago.days', { count: diffInDays });
  };

  if (isPageLoading) {
    return (
      <View style={[containerStyle, { justifyContent: "center", alignItems: "center" }]}>
        <CustomLoader />
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      {/* Custom Header */}
     
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <ThemedText style={styles.greeting}>{greetingText}</ThemedText>
          <ThemedText style={styles.subGreeting}>
            {t('home.help_question')}
          </ThemedText>
          {rootMessage && (
            <ThemedText style={styles.rootMessage}>
              {rootMessage}
            </ThemedText>
          )}
        </View>



        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <ThemedText style={styles.sectionTitle}>{t('home.quick_actions')}</ThemedText>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, styles.uploadCard]}
              onPress={handleUploadResults}
              activeOpacity={0.7}
              accessibilityLabel="Cargar resultados médicos"
              accessibilityRole="button"
              accessibilityHint="Sube tus resultados de laboratorio para análisis con IA"
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: Colors.light.white },
                  ]}
                >
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={28}
                    color={Colors.light.medicalBlue}
                  />
                </View>
                <View style={styles.cardBadge}>
                  <ThemedText style={styles.badgeText}>IA</ThemedText>
                </View>
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.quickActionTitle}>
                  {t('home.upload_results')}
                </ThemedText>
                <View style={styles.subtitleContainer}>
                  <View style={styles.featureTag}>
                    <Ionicons
                      name="flash"
                      size={12}
                      color={Colors.light.white}
                    />
                    <ThemedText style={styles.featureText}>
                      {t('home.instant')}
                    </ThemedText>
                  </View>
                  <View style={styles.featureTag}>
                    <Ionicons
                      name="bulb"
                      size={12}
                      color={Colors.light.white}
                    />
                    <ThemedText style={styles.featureText}>
                      {t('home.ia_powered')}
                    </ThemedText>
                  </View>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <ThemedText style={styles.cardFooterText}>
                  {t('home.tap_to_start')}
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={Colors.light.white}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, styles.consultationCard]}
              onPress={handleAIConsultation}
              activeOpacity={0.7}
              accessibilityLabel="Consulta con IA médica"
              accessibilityRole="button"
              accessibilityHint="Inicia una consulta médica con inteligencia artificial"
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: Colors.light.white },
                  ]}
                >
                  <IconSymbol
                    name="message.fill"
                    size={28}
                    color={Colors.light.teal}
                  />
                </View>
                <View style={styles.cardBadge}>
                  <ThemedText style={styles.badgeText}>24/7</ThemedText>
                </View>
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.quickActionTitle}>
                  {t('home.ai_consultation')}
                </ThemedText>
                <View style={styles.subtitleContainer}>
                  <View style={styles.featureTag}>
                    <IconSymbol
                      name="clock.fill"
                      size={12}
                      color={Colors.light.white}
                    />
                    <ThemedText style={styles.featureText}>{t('home.24_7')}</ThemedText>
                  </View>
                  <View style={styles.featureTag}>
                    <Ionicons
                      name="medical"
                      size={12}
                      color={Colors.light.white}
                    />
                    <ThemedText style={styles.featureText}>{t('home.medical')}</ThemedText>
                  </View>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <ThemedText style={styles.cardFooterText}>
                  {t('home.tap_to_start')}
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={Colors.light.white}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <View style={styles.activitiesHeader}>
            <ThemedText style={styles.sectionTitle}>
              {t('home.recent_activities')}
            </ThemedText>
            {recentActivities.length > 0 && (
              <TouchableOpacity
                onPress={handleViewAllActivities}
                accessibilityLabel="Ver todas las actividades"
                accessibilityRole="button"
                accessibilityHint="Navega a la pantalla de historial completo"
              >
                <ThemedText style={styles.seeAllLink}>{t('home.view_all')}</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.activitiesList}>
            {recentActivities.length > 0 ? (
              // 1. Agregamos el segundo parámetro 'index' aquí
              recentActivities.map((activity, index) => (
                <View 
                  key={activity.id} 
                  style={[
                    styles.activityItem,
                    // 2. Si es el último elemento, anulamos el borde inferior
                    index === recentActivities.length - 1 && { borderBottomWidth: 0, borderBottomColor: 'transparent' }
                  ]}
                >
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={Colors.light.healthGreen}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <ThemedText style={styles.activityTitle}>
                      {activity.title || t('home.analysis')}
                    </ThemedText>
                    <ThemedText style={styles.activityTime}>
                      {formatTimeAgo(activity.date)}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: getStatusColor(activity.status) },
                    ]}
                  >
                    <ThemedText style={styles.statusText}>{getStatusText(activity.status)}</ThemedText>
                  </View>
                </View>
              ))
            ) : (
              // Empty State
              <View style={styles.emptyActivityContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="clipboard-outline" size={40} color={Colors.light.placeholderGray} />
                </View>
                <ThemedText style={styles.emptyTitle}>{t('home.no_activities')}</ThemedText>
                <ThemedText style={styles.emptyDescription}>
                  {t('home.no_activities_desc')}
                </ThemedText>
                <TouchableOpacity style={styles.emptyButton} onPress={handleUploadResults}>
                  <ThemedText style={styles.emptyButtonText}>{t('home.analyze_first_doc')}</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  headerLeft: {
    flex: 1,
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
    fontSize: 18,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  greetingSection: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: Colors.light.muted,
    fontWeight: "400",
  },

  searchSection: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  searchBar: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  quickActionsSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.brandBlue,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 180,
  },
  uploadCard: {
    backgroundColor: Colors.light.medicalBlue,
  },
  consultationCard: {
    backgroundColor: Colors.light.healthGreen,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.white,
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.white,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  subtitleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: "auto",
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  featureText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.white,
    letterSpacing: 0.3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xs,
    
  },
  cardFooterText: {
    fontSize: 12,
    color: Colors.light.white,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
    lineHeight: 14,    
  },

  activitiesSection: {
    marginBottom: Spacing.xxl,
  },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllLink: {
    fontSize: 14,
    color: Colors.light.brandBlue,
    fontWeight: "600",
    textDecorationLine: "underline",
    marginBottom: Spacing.md,

  },
  activitiesList: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  activityIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.lightGray,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.black,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  statusPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.white,
  },

  warningSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
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
  rootMessage: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 8,
    textAlign: 'center',
  },

  // Empty State Styles
  emptyActivityContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textGray,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.gray,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: Colors.light.brandBlue,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyButtonText: {
    color: Colors.light.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
