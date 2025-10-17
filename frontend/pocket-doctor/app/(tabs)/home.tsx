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
import { ThemedView } from "@/components/themed-view";
import { SearchBar } from "@/components/ui/SearchBar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";

// 🎨 Theme Colors
const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  SUCCESS: "#34C759",
  WARNING: "#FF9500",
  WARNING_BG: "#FFF3CD",
  WARNING_BORDER: "#FFEAA7",
  MUTED: "#6B7280",
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
    // TODO: Navigate to upload screen
    console.log("Navigate to upload results");
  };

  const handleAIConsultation = () => {
    // TODO: Navigate to AI consultation
    console.log("Navigate to AI consultation");
  };

  const handleViewAllActivities = () => {
    // TODO: Navigate to history screen
    console.log("Navigate to all activities");
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
          <ThemedText style={styles.pageTitle}>Home</ThemedText>
          <View style={styles.profileIcon}>
            <ThemedText style={styles.profileIconText}>A</ThemedText>
          </View>
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
              style={styles.quickActionCard}
              onPress={handleUploadResults}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIcon}>
                <IconSymbol
                  name="square.and.arrow.up"
                  size={24}
                  color={COLORS.BRAND_BLUE}
                />
              </View>
              <ThemedText style={styles.quickActionTitle}>
                Cargar resultados
              </ThemedText>
              <ThemedText style={styles.quickActionSubtitle}>
                Análisis instantáneo con AI
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleAIConsultation}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIcon}>
                <IconSymbol
                  name="gearshape.fill"
                  size={24}
                  color={COLORS.BRAND_BLUE}
                />
              </View>
              <ThemedText style={styles.quickActionTitle}>
                Consulta AI
              </ThemedText>
              <ThemedText style={styles.quickActionSubtitle}>
                Consulta médica 24/7
              </ThemedText>
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

  // Greeting Section
  greetingSection: {
    paddingTop: 24,
    paddingBottom: 20,
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

  // Search Section
  searchSection: {
    marginBottom: 24,
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

  // Quick Actions
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
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_BLUE,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
    textAlign: "center",
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: COLORS.WHITE,
    textAlign: "center",
    opacity: 0.9,
  },

  // Activities Section
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
    fontWeight: "500",
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

  // Warning Section
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
