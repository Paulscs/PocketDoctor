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

export default function IAAnalyticsScreen() {
  const backgroundColor = useThemeColor(
    { light: COLORS.WHITE, dark: "#000000" },
    "background"
  );

  const handleViewDetailedRecommendations = () => {
    router.push("/recommendations");
  };

  const handleDownloadPDF = () => {
    console.log("Download PDF");
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
          {/* IA Title */}
          <View style={styles.iconContainer}>
            <ThemedText style={styles.mainTitle}>Analíticas IA</ThemedText>
          </View>

          {/* Analysis Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIcon}>
                <ThemedText style={styles.overviewIconText}>IA</ThemedText>
              </View>
              <ThemedText style={styles.overviewTitle}>
                Análisis Completo
              </ThemedText>
            </View>
            <ThemedText style={styles.overviewText}>
              La IA ha analizado los resultados de su laboratorio e identificado
              2 áreas que requieren atención. La evaluación general muestra
              marcadores de salud manejables con intervenciones recomendadas.
            </ThemedText>
          </View>

          {/* Medical Details Section */}
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>
              Detalles médicos
            </ThemedText>

            {/* Elevated Cholesterol Card */}
            <View style={styles.medicalCard}>
              <View style={styles.medicalCardHeader}>
                <ThemedText style={styles.medicalCardTitle}>
                  Colesterol elevado
                </ThemedText>
                <View style={styles.priorityPill}>
                  <ThemedText style={styles.priorityText}>
                    Prioridad media
                  </ThemedText>
                </View>
              </View>

              {/* Analysis Section */}
              <View style={styles.analysisSection}>
                <ThemedText style={styles.analysisTitle}>Análisis</ThemedText>
                <ThemedText style={styles.analysisText}>
                  El nivel total de colesterol de 245 mg/dL está por encima del
                  umbral recomendado de &lt;200 mg/dL, lo que indica un mayor
                  riesgo cardiovascular.
                </ThemedText>
              </View>

              {/* Recommendations Section */}
              <View style={styles.recommendationsSection}>
                <ThemedText style={styles.recommendationsTitle}>
                  Recomendaciones
                </ThemedText>
                <ThemedText style={styles.recommendationsText}>
                  Considere modificaciones dietéticas, ejercicio regular y
                  potencialmente terapia con estatinas. Panel lipídico de
                  seguimiento en 6-8 semanas.
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Possible Risks Section */}
          <View style={styles.risksCard}>
            <View style={styles.risksHeader}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={20} color={COLORS.WARNING} />
              </View>
              <ThemedText style={styles.risksTitle}>
                Posibles Riesgos
              </ThemedText>
            </View>
            <ThemedText style={styles.risksText}>
              Según los resultados actuales, el paciente muestra signos
              tempranos de factores de riesgo para el síndrome metabólico.
            </ThemedText>

            <View style={styles.riskItems}>
              <View style={styles.riskItem}>
                <ThemedText style={styles.riskItemLabel}>
                  Cardiovascular
                </ThemedText>
                <ThemedText style={styles.riskItemValue}>
                  Riesgo: Moderado
                </ThemedText>
              </View>
              <View style={styles.riskItem}>
                <ThemedText style={styles.riskItemLabel}>Diabetes</ThemedText>
                <ThemedText
                  style={[styles.riskItemValue, { color: COLORS.SUCCESS }]}
                >
                  Riesgo: Bajo
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewDetailedRecommendations}
            activeOpacity={0.8}
          >
            <IconSymbol name="doc.fill" size={20} color={COLORS.WHITE} />
            <ThemedText style={styles.actionButtonText}>
              Ver recomendaciones detalladas
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Download PDF Button */}
      <View style={styles.downloadSection}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadPDF}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.downloadButtonText}>
            Descargar PDF
          </ThemedText>
        </TouchableOpacity>
      </View>
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
    marginBottom: 24,
    paddingTop: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.GRAY_800,
    textAlign: "center",
  },
  overviewCard: {
    backgroundColor: COLORS.SUCCESS_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.SUCCESS_BORDER,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  overviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  overviewIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.GRAY_800,
  },
  overviewText: {
    fontSize: 16,
    fontWeight: "400",
    color: COLORS.GRAY_700,
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.GRAY_800,
    marginBottom: 16,
  },
  medicalCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
  },
  medicalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  medicalCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.GRAY_800,
  },
  priorityPill: {
    backgroundColor: COLORS.WARNING_BG,
    borderColor: COLORS.WARNING_BORDER,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.WARNING,
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY_800,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.GRAY_700,
    lineHeight: 22,
  },
  recommendationsSection: {
    backgroundColor: COLORS.SUCCESS_BG,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.SUCCESS_BORDER,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY_800,
    marginBottom: 8,
  },
  recommendationsText: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.GRAY_700,
    lineHeight: 22,
  },
  risksCard: {
    backgroundColor: COLORS.WARNING_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.WARNING_BORDER,
  },
  risksHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningIcon: {
    marginRight: 12,
  },
  risksTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.GRAY_800,
  },
  risksText: {
    fontSize: 16,
    fontWeight: "400",
    color: COLORS.GRAY_700,
    lineHeight: 24,
    marginBottom: 16,
  },
  riskItems: {
    gap: 12,
  },
  riskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riskItemLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.GRAY_700,
  },
  riskItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WARNING,
  },
  actionButton: {
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
    marginBottom: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
    marginLeft: 8,
  },
  downloadSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
  },
  downloadButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
  },
});
