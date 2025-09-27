import React from "react";
import { View, StyleSheet } from "react-native";
import { AppLayout } from "@/components/layout";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ChatScreen() {
  return (
    <AppLayout headerTitle="Chat AI">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Consulta AI
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Consulta médica 24/7 disponible
        </ThemedText>

        <View style={styles.content}>
          <ThemedText>
            Aquí podrás chatear con nuestro asistente médico AI para consultas
            generales.
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
