import React from "react";
import { View, StyleSheet } from "react-native";
import { AppLayout } from "@/components/layout";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function RecommendationsScreen() {
  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "primary"
  );

  return (
    <AppLayout headerTitle="Recomendaciones">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Recomendaciones
        </ThemedText>

        {/* Recommendations List */}
        <View style={styles.recommendationsSection}>
          <Card>
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationHeader}>
                <IconSymbol name="heart.fill" size={20} color={primaryColor} />
                <ThemedText style={styles.recommendationTitle}>
                  Presión Sanguínea
                </ThemedText>
              </View>
              <ThemedText style={styles.recommendationDescription}>
                Mantén tu estilo de vida saludable actual, incluyendo ejercicio
                y una dieta equilibrada.
              </ThemedText>
            </View>

            <View style={styles.recommendationItem}>
              <View style={styles.recommendationHeader}>
                <IconSymbol name="heart.fill" size={20} color={primaryColor} />
                <ThemedText style={styles.recommendationTitle}>
                  Ritmo Cardíaco
                </ThemedText>
              </View>
              <ThemedText style={styles.recommendationDescription}>
                Realiza 30 minutos de ejercicio moderado diario y practica
                técnicas de manejo del estrés.
              </ThemedText>
            </View>

            <View style={styles.recommendationItem}>
              <View style={styles.recommendationHeader}>
                <IconSymbol name="lungs.fill" size={20} color={primaryColor} />
                <ThemedText style={styles.recommendationTitle}>
                  Saturación de Oxígeno
                </ThemedText>
              </View>
              <ThemedText style={styles.recommendationDescription}>
                Continúa con las prácticas saludables y evita el tabaquismo.
              </ThemedText>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Discutir con Doctor AI"
            onPress={() => {}}
            variant="primary"
            style={styles.primaryButton}
          />
          <Button
            title="Volver al Dashboard"
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
  recommendationsSection: {
    flex: 1,
  },
  recommendationItem: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  recommendationDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
});
