import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AppLayout } from "@/components/layout";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function HomeScreen() {
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

  return (
    <AppLayout headerTitle="Home">
      <ThemedView style={styles.container}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <ThemedText type="title" style={styles.greeting}>
            Hola, Ethan
          </ThemedText>
          <ThemedText style={styles.subGreeting}>
            ¿Cómo puedo ayudarte hoy?
          </ThemedText>
        </View>

        {/* Search Bar */}
        <SearchBar
          placeholder="Buscar síntomas, medicamentos..."
          style={styles.searchBar}
        />

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Acciones rápidas
          </ThemedText>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Card style={styles.quickActionCard}>
                <View style={styles.quickActionContent}>
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={32}
                    color={primaryColor}
                  />
                  <ThemedText style={styles.quickActionTitle}>
                    Cargar resultados
                  </ThemedText>
                  <ThemedText style={styles.quickActionSubtitle}>
                    Análisis instantáneo con AI
                  </ThemedText>
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Card style={styles.quickActionCard}>
                <View style={styles.quickActionContent}>
                  <IconSymbol
                    name="gearshape.fill"
                    size={32}
                    color={primaryColor}
                  />
                  <ThemedText style={styles.quickActionTitle}>
                    Consulta AI
                  </ThemedText>
                  <ThemedText style={styles.quickActionSubtitle}>
                    Consulta médica 24/7
                  </ThemedText>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Actividades recientes
          </ThemedText>

          <Card>
            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <ThemedText style={styles.activityTitle}>
                  Resultado sanguíneo
                </ThemedText>
                <ThemedText
                  style={[styles.activityStatus, { color: successColor }]}
                >
                  Normal
                </ThemedText>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <ThemedText style={styles.activityTitle}>
                  Análisis cardíaco
                </ThemedText>
                <ThemedText
                  style={[styles.activityStatus, { color: warningColor }]}
                >
                  Elevado
                </ThemedText>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <ThemedText style={styles.activityTitle}>
                  Lectura de temperatura
                </ThemedText>
                <ThemedText
                  style={[styles.activityStatus, { color: successColor }]}
                >
                  Normal
                </ThemedText>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <ThemedText style={styles.activityTitle}>
                  Examen de colesterol
                </ThemedText>
                <ThemedText
                  style={[styles.activityStatus, { color: warningColor }]}
                >
                  Elevado
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Card style={styles.disclaimerCard}>
            <ThemedText style={styles.disclaimerText}>
              Esta herramienta no reemplaza el diagnóstico médico profesional.
              Consulta siempre a un médico.
            </ThemedText>
          </Card>
        </View>
      </ThemedView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  greetingSection: {
    marginBottom: 24,
  },
  greeting: {
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchBar: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
  },
  quickActionContent: {
    alignItems: "center",
    padding: 16,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  activitiesSection: {
    marginBottom: 24,
  },
  activityItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  activityInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  activityStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  disclaimerSection: {
    marginTop: "auto",
  },
  disclaimerCard: {
    backgroundColor: "#f8f9fa",
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 16,
  },
});
