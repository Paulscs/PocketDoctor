import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { SearchBar } from "@/components/ui/SearchBar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  SUCCESS: "#34C759",
  WARNING: "#FF9500",
  WARNING_BG: "#FFF3CD",
  WARNING_BORDER: "#FFEAA7",
  MUTED: "#6B7280",
  MEDICAL_BLUE: "#2563EB",
  HEALTH_GREEN: "#059669",
  PURPLE: "#8B5CF6",
  TEAL: "#14B8A6",
  WHITE: "#FFFFFF",
  BLACK: "#111827",
  LIGHT_GRAY: "#F8F9FA",
  BORDER: "#E5E7EB",
} as const;

export default function HomeScreen() {
  const backgroundColor = useThemeColor(
    { light: COLORS.WHITE, dark: "#000000" },
    "background"
  );

  const handleUploadResults = () => {
    router.push("/upload");
  };

  const handleAIConsultation = () => {
    router.push("/(tabs)/chat");
  };

  const handleViewAllActivities = () => {
    console.log("Navigate to all activities");
  };

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
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
          <ThemedText style={styles.pageTitle}>Inicio</ThemedText>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.profileIconText}>A</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <ThemedText style={styles.greeting}>Hola, Ethan</ThemedText>
          <ThemedText style={styles.subGreeting}>
            ¿Cómo puedo ayudarte hoy?
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            placeholder="Buscar síntomas, medicamentos..."
            style={styles.searchBar}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <ThemedText style={styles.sectionTitle}>Acciones rápidas</ThemedText>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, styles.uploadCard]}
              onPress={handleUploadResults}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: COLORS.WHITE },
                  ]}
                >
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={28}
                    color={COLORS.MEDICAL_BLUE}
                  />
                </View>
                <View style={styles.cardBadge}>
                  <ThemedText style={styles.badgeText}>IA</ThemedText>
                </View>
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.quickActionTitle}>
                  Cargar resultados
                </ThemedText>
                <View style={styles.subtitleContainer}>
                  <View style={styles.featureTag}>
                    <Ionicons name="flash" size={12} color={COLORS.WHITE} />
                    <ThemedText style={styles.featureText}>
                      Instantáneo
                    </ThemedText>
                  </View>
                  <View style={styles.featureTag}>
                    <Ionicons name="bulb" size={12} color={COLORS.WHITE} />
                    <ThemedText style={styles.featureText}>
                      IA Powered
                    </ThemedText>
                  </View>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <ThemedText style={styles.cardFooterText}>
                  Toca para comenzar
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={COLORS.WHITE}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, styles.consultationCard]}
              onPress={handleAIConsultation}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: COLORS.WHITE },
                  ]}
                >
                  <IconSymbol
                    name="message.fill"
                    size={28}
                    color={COLORS.TEAL}
                  />
                </View>
                <View style={styles.cardBadge}>
                  <ThemedText style={styles.badgeText}>24/7</ThemedText>
                </View>
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.quickActionTitle}>
                  Consulta AI
                </ThemedText>
                <View style={styles.subtitleContainer}>
                  <View style={styles.featureTag}>
                    <IconSymbol
                      name="clock.fill"
                      size={12}
                      color={COLORS.WHITE}
                    />
                    <ThemedText style={styles.featureText}>24/7</ThemedText>
                  </View>
                  <View style={styles.featureTag}>
                    <Ionicons name="medical" size={12} color={COLORS.WHITE} />
                    <ThemedText style={styles.featureText}>Médico</ThemedText>
                  </View>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <ThemedText style={styles.cardFooterText}>
                  Toca para comenzar
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={COLORS.WHITE}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <View style={styles.activitiesHeader}>
            <ThemedText style={styles.sectionTitle}>
              Actividades recientes
            </ThemedText>
            <TouchableOpacity onPress={handleViewAllActivities}>
              <ThemedText style={styles.seeAllLink}>Ver todas</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {/* Blood Test Result */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="water" size={20} color={COLORS.BRAND_BLUE} />
              </View>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>
                  Resultado sanguíneo
                </ThemedText>
                <ThemedText style={styles.activityTime}>
                  Hace 2 horas
                </ThemedText>
              </View>
              <View
                style={[styles.statusPill, { backgroundColor: COLORS.SUCCESS }]}
              >
                <ThemedText style={styles.statusText}>Normal</ThemedText>
              </View>
            </View>

            {/* Cardiac Analysis */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="heart" size={20} color={COLORS.BRAND_BLUE} />
              </View>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>
                  Análisis cardíaco
                </ThemedText>
                <ThemedText style={styles.activityTime}>
                  Hace 2 horas
                </ThemedText>
              </View>
              <View
                style={[styles.statusPill, { backgroundColor: COLORS.WARNING }]}
              >
                <ThemedText style={styles.statusText}>Elevado</ThemedText>
              </View>
            </View>

            {/* Temperature Reading */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name="thermometer"
                  size={20}
                  color={COLORS.BRAND_BLUE}
                />
              </View>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>
                  Lectura de temperatura
                </ThemedText>
                <ThemedText style={styles.activityTime}>
                  Hace 2 horas
                </ThemedText>
              </View>
              <View
                style={[styles.statusPill, { backgroundColor: COLORS.SUCCESS }]}
              >
                <ThemedText style={styles.statusText}>Normal</ThemedText>
              </View>
            </View>

            {/* Cholesterol Exam */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name="add-circle"
                  size={20}
                  color={COLORS.BRAND_BLUE}
                />
              </View>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>
                  Examen de colesterol
                </ThemedText>
                <ThemedText style={styles.activityTime}>
                  Hace 2 horas
                </ThemedText>
              </View>
              <View
                style={[styles.statusPill, { backgroundColor: COLORS.WARNING }]}
              >
                <ThemedText style={styles.statusText}>Elevado</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningSection}>
          <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={20} color={COLORS.WHITE} />
            </View>
            <View style={styles.warningContent}>
              <ThemedText style={styles.warningTitle}>Advertencia</ThemedText>
              <ThemedText style={styles.warningText}>
                Esta herramienta no reemplaza el diagnóstico médico profesional.
                Consulta siempre a un médico
              </ThemedText>
            </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
  },
  profileIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  greetingSection: {
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: COLORS.MUTED,
    fontWeight: "400",
  },

  searchSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  searchBar: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  quickActionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 180,
  },
  uploadCard: {
    backgroundColor: COLORS.MEDICAL_BLUE,
  },
  consultationCard: {
    backgroundColor: COLORS.HEALTH_GREEN,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.WHITE,
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.WHITE,
    marginBottom: 12,
    lineHeight: 22,
  },
  subtitleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.WHITE,
    letterSpacing: 0.3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  cardFooterText: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },

  activitiesSection: {
    marginBottom: 24,
  },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    color: COLORS.BRAND_BLUE,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  activitiesList: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  activityIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: COLORS.MUTED,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.WHITE,
  },

  warningSection: {
    marginTop: "auto",
    paddingTop: 20,
  },
  warningCard: {
    backgroundColor: COLORS.WARNING_BG,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.WARNING_BORDER,
  },
  warningIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.WARNING,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WARNING,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: "#856404",
    lineHeight: 16,
  },
});
