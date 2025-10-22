import React, { useCallback, useMemo } from "react";
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
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuthStore } from "@/src/store";

export default function HomeScreen() {
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  const { user } = useAuthStore();

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor }],
    [backgroundColor]
  );

  const headerStyle = useMemo(
    () => [styles.header, { borderBottomColor: Colors.light.borderGray }],
    []
  );

  const greetingText = useMemo(
    () => `Hola, ${user?.firstName || "Usuario"}`,
    [user?.firstName]
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

  return (
    <SafeAreaView style={containerStyle}>
      {/* Custom Header */}
      <View style={headerStyle}>
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
            accessibilityLabel="Ir al perfil"
            accessibilityRole="button"
            accessibilityHint="Navega a la pantalla de perfil"
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
          <ThemedText style={styles.greeting}>{greetingText}</ThemedText>
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
                  Cargar resultados
                </ThemedText>
                <View style={styles.subtitleContainer}>
                  <View style={styles.featureTag}>
                    <Ionicons
                      name="flash"
                      size={12}
                      color={Colors.light.white}
                    />
                    <ThemedText style={styles.featureText}>
                      Instantáneo
                    </ThemedText>
                  </View>
                  <View style={styles.featureTag}>
                    <Ionicons
                      name="bulb"
                      size={12}
                      color={Colors.light.white}
                    />
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
                  Consulta AI
                </ThemedText>
                <View style={styles.subtitleContainer}>
                  <View style={styles.featureTag}>
                    <IconSymbol
                      name="clock.fill"
                      size={12}
                      color={Colors.light.white}
                    />
                    <ThemedText style={styles.featureText}>24/7</ThemedText>
                  </View>
                  <View style={styles.featureTag}>
                    <Ionicons
                      name="medical"
                      size={12}
                      color={Colors.light.white}
                    />
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
              Actividades recientes
            </ThemedText>
            <TouchableOpacity
              onPress={handleViewAllActivities}
              accessibilityLabel="Ver todas las actividades"
              accessibilityRole="button"
              accessibilityHint="Navega a la pantalla de historial completo"
            >
              <ThemedText style={styles.seeAllLink}>Ver todas</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {/* Blood Test Result */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name="water"
                  size={20}
                  color={Colors.light.brandBlue}
                />
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
                style={[
                  styles.statusPill,
                  { backgroundColor: Colors.light.success },
                ]}
              >
                <ThemedText style={styles.statusText}>Normal</ThemedText>
              </View>
            </View>

            {/* Cardiac Analysis */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name="heart"
                  size={20}
                  color={Colors.light.brandBlue}
                />
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
                style={[
                  styles.statusPill,
                  { backgroundColor: Colors.light.warning },
                ]}
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
                  color={Colors.light.brandBlue}
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
                style={[
                  styles.statusPill,
                  { backgroundColor: Colors.light.success },
                ]}
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
                  color={Colors.light.brandBlue}
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
                style={[
                  styles.statusPill,
                  { backgroundColor: Colors.light.warning },
                ]}
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
    paddingHorizontal: Spacing.sm,
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
  },

  activitiesSection: {
    marginBottom: Spacing.xl,
  },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  seeAllLink: {
    fontSize: 14,
    color: Colors.light.brandBlue,
    fontWeight: "600",
    textDecorationLine: "underline",
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
});
