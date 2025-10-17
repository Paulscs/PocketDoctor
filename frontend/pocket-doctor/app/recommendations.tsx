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
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";

const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  MEDICAL_BLUE: "#1E40AF",
  HEALTH_GREEN: "#059669",
  WARNING: "#F59E0B",
  WARNING_BG: "#FEF3C7",
  WARNING_BORDER: "#FCD34D",
  SUCCESS: "#10B981",
  SUCCESS_BG: "#D1FAE5",
  SUCCESS_BORDER: "#6EE7B7",
  DANGER: "#EF4444",
  DANGER_BG: "#FEE2E2",
  DANGER_BORDER: "#FCA5A5",
  WHITE: "#FFFFFF",
  GRAY_50: "#F9FAFB",
  GRAY_100: "#F3F4F6",
  GRAY_200: "#E5E7EB",
  GRAY_300: "#D1D5DB",
  GRAY_400: "#9CA3AF",
  GRAY_500: "#6B7280",
  GRAY_600: "#4B5563",
  GRAY_700: "#374151",
  GRAY_800: "#1F2937",
  GRAY_900: "#111827",
};

export default function RecommendationsScreen() {
  const backgroundColor = useThemeColor(
    { light: COLORS.WHITE, dark: "#000000" },
    "background"
  );

  const handleDiscussWithIA = () => {
    console.log("Discuss with Doctor IA");
  };

  const handleBackToDashboard = () => {
    router.push("/(tabs)/home");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.GRAY_700} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logoBlue.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.brandTitle}>POCKET DOCTOR</ThemedText>
          </View>
        </View>

        <View style={styles.profileIcon}>
          <ThemedText style={styles.profileIconText}>A</ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Icon and Title */}
          <View style={styles.iconContainer}>
            <View style={styles.mainIcon}>
              <Ionicons
                name="information-circle"
                size={40}
                color={COLORS.WHITE}
              />
            </View>
            <ThemedText style={styles.mainTitle}>Recomendaciones</ThemedText>
          </View>

          {/* Recommendation Cards */}
          <View style={styles.recommendationsList}>
            {/* Blood Pressure Card */}
            <View style={styles.recommendationCard}>
              <View style={styles.cardIcon}>
                <Ionicons name="pulse" size={20} color={COLORS.WHITE} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.cardTitle}>
                  Presión Sanguínea
                </ThemedText>
                <ThemedText style={styles.cardDescription}>
                  Mantén los hábitos de vida actuales, incluyendo ejercicio
                  regular y una dieta equilibrada.
                </ThemedText>
              </View>
            </View>

            {/* Heart Rate Card */}
            <View style={styles.recommendationCard}>
              <View style={styles.cardIcon}>
                <IconSymbol name="heart.fill" size={20} color={COLORS.WHITE} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.cardTitle}>Ritmo Cardíaco</ThemedText>
                <ThemedText style={styles.cardDescription}>
                  Realiza 30 minutos de ejercicio moderado diariamente y
                  practica la gestión del estrés.
                </ThemedText>
              </View>
            </View>

            {/* Oxygen Saturation Card */}
            <View style={styles.recommendationCard}>
              <View style={styles.cardIcon}>
                <IconSymbol name="lungs.fill" size={20} color={COLORS.WHITE} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.cardTitle}>
                  Saturación de Oxígeno
                </ThemedText>
                <ThemedText style={styles.cardDescription}>
                  Continúa con las prácticas saludables actuales y evita fumar.
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleDiscussWithIA}
              activeOpacity={0.8}
            >
              <IconSymbol name="message.fill" size={20} color={COLORS.WHITE} />
              <ThemedText style={styles.primaryButtonText}>
                Discutir con Pocket Doctor
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToDashboard}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Volver al Dashboard
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.GRAY_50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    lineHeight: 22,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  profileIconText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  scrollContent: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  mainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: COLORS.BRAND_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.GRAY_800,
    textAlign: "center",
  },
  recommendationsList: {
    gap: 16,
    marginBottom: 32,
  },
  recommendationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.GRAY_800,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.GRAY_700,
    lineHeight: 22,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.BRAND_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
  },
});
