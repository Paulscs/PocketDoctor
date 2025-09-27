import React from "react";
import { View, StyleSheet } from "react-native";
import { AppLayout } from "@/components/layout";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function AnalyticsScreen() {
  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "primary"
  );
  const successColor = useThemeColor(
    { light: "#34C759", dark: "#30D158" },
    "success"
  );
  const warningColor = useThemeColor(
    { light: "#FF9500", dark: "#FF9F0A" },
    "warning"
  );
  const dangerColor = useThemeColor(
    { light: "#FF3B30", dark: "#FF453A" },
    "danger"
  );

  return (
    <AppLayout headerTitle="Analíticas AI">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Analíticas AI
        </ThemedText>

        {/* Complete Analysis */}
        <Card style={[styles.analysisCard, { backgroundColor: successColor }]}>
          <View style={styles.analysisHeader}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={24}
              color="#ffffff"
            />
            <ThemedText style={[styles.analysisTitle, { color: "#ffffff" }]}>
              Análisis Completo
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.analysisDescription, { color: "#ffffff" }]}
          >
            He analizado tus resultados de laboratorio, identificado áreas que
            requieren atención y proporcionado intervenciones manejables.
          </ThemedText>
        </Card>

        {/* Medical Details */}
        <View style={styles.medicalDetails}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Detalles médicos
          </ThemedText>

          <Card>
            <View style={styles.medicalItem}>
              <View style={styles.medicalHeader}>
                <View style={styles.medicalTitleContainer}>
                  <ThemedText style={styles.medicalTitle}>
                    Colesterol elevado
                  </ThemedText>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: warningColor },
                    ]}
                  >
                    <ThemedText style={styles.priorityText}>
                      Prioridad media
                    </ThemedText>
                  </View>
                </View>
              </View>

              <ThemedText style={styles.medicalDescription}>
                Tu nivel de colesterol total de 245 mg/dL está por encima del
                umbral recomendado de &lt;200 mg/dL, indicando un mayor riesgo
                cardiovascular.
              </ThemedText>

              <ThemedText style={styles.recommendationTitle}>
                Recomendaciones:
              </ThemedText>
              <ThemedText style={styles.recommendationText}>
                • Modificaciones dietéticas • Ejercicio regular • Posible
                terapia con estatinas • Panel de lípidos de seguimiento en 6-8
                semanas
              </ThemedText>
            </View>
          </Card>
        </View>

        {/* Possible Risks */}
        <View style={styles.risksSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Posibles Riesgos
          </ThemedText>

          <Card style={[styles.risksCard, { backgroundColor: warningColor }]}>
            <ThemedText style={[styles.risksTitle, { color: "#ffffff" }]}>
              Los resultados actuales muestran signos tempranos de factores de
              riesgo para síndrome metabólico.
            </ThemedText>

            <View style={styles.riskItems}>
              <View style={styles.riskItem}>
                <ThemedText style={[styles.riskLabel, { color: "#ffffff" }]}>
                  Cardiovascular
                </ThemedText>
                <ThemedText style={[styles.riskValue, { color: "#ffffff" }]}>
                  Riesgo: Moderado
                </ThemedText>
              </View>

              <View style={styles.riskItem}>
                <ThemedText style={[styles.riskLabel, { color: "#ffffff" }]}>
                  Diabetes
                </ThemedText>
                <ThemedText style={[styles.riskValue, { color: "#ffffff" }]}>
                  Riesgo: Bajo
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Ver recomendaciones detalladas"
            onPress={() => {}}
            variant="primary"
            style={styles.primaryButton}
          />
          <Button
            title="Descargar PDF"
            onPress={() => {}}
            variant="secondary"
            style={styles.secondaryButton}
          />
        </View>
      </ThemedView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  analysisCard: {
    marginBottom: 24,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  analysisDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  medicalDetails: {
    marginBottom: 24,
  },
  medicalItem: {
    padding: 16,
  },
  medicalHeader: {
    marginBottom: 12,
  },
  medicalTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicalTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  medicalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  risksSection: {
    marginBottom: 24,
  },
  risksCard: {
    padding: 16,
  },
  risksTitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  riskItems: {
    gap: 8,
  },
  riskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  riskValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    marginTop: "auto",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
});
