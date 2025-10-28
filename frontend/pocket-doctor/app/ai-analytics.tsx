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
import { Colors } from "@/constants/theme";

export default function IAAnalyticsScreen() {
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
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
          <Ionicons name="arrow-back" size={24} color={Colors.light.textGray} />
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
                <Ionicons
                  name="warning"
                  size={20}
                  color={Colors.light.warning}
                />
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
                  style={[
                    styles.riskItemValue,
                    { color: Colors.light.success },
                  ]}
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
            <IconSymbol name="doc.fill" size={20} color={Colors.light.white} />
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
    backgroundColor: Colors.light.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
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
    color: Colors.light.brandBlue,
    lineHeight: 22,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.brandBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  profileIconText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
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
    color: Colors.light.textGray,
    textAlign: "center",
  },
  overviewCard: {
    backgroundColor: Colors.light.friendlyGreenBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.friendlyGreenBorder,
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
    backgroundColor: Colors.light.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  overviewIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.white,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.textGray,
  },
  overviewText: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.light.textGray,
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.textGray,
    marginBottom: 16,
  },
  medicalCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.lightGray,
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
    color: Colors.light.textGray,
  },
  priorityPill: {
    backgroundColor: Colors.light.warningBg,
    borderColor: Colors.light.warningBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.warning,
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.light.textGray,
    lineHeight: 22,
  },
  recommendationsSection: {
    backgroundColor: Colors.light.friendlyGreenBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.friendlyGreenBorder,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 8,
  },
  recommendationsText: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.light.textGray,
    lineHeight: 22,
  },
  risksCard: {
    backgroundColor: Colors.light.warningBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.warningBorder,
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
    color: Colors.light.textGray,
  },
  risksText: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.light.textGray,
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
    color: Colors.light.textGray,
  },
  riskItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.warning,
  },
  actionButton: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
    marginLeft: 8,
  },
  downloadSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderGray,
  },
  downloadButton: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },
});
