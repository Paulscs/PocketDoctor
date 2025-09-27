import React from "react";
import { View, StyleSheet } from "react-native";
import { AppLayout } from "@/components/layout";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function HistoryScreen() {
  return (
    <AppLayout headerTitle="Historial">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Historial Médico
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Revisa tus análisis y resultados anteriores
        </ThemedText>

        <View style={styles.content}>
          <ThemedText>
            Aquí encontrarás tu historial completo de análisis médicos y
            resultados.
          </ThemedText>
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
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
