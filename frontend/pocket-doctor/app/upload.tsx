import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AppLayout } from "@/components/layout";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function UploadScreen() {
  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "primary"
  );
  const borderColor = useThemeColor(
    { light: "#E0E0E0", dark: "#38383A" },
    "border"
  );

  return (
    <AppLayout headerTitle="Cargar">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Subir resultados médicos
        </ThemedText>

        {/* File Upload Area */}
        <Card style={styles.uploadCard}>
          <TouchableOpacity style={[styles.uploadArea, { borderColor }]}>
            <IconSymbol name="doc.badge.plus" size={48} color={primaryColor} />
            <ThemedText style={styles.uploadTitle}>
              Selecciona un archivo
            </ThemedText>

            <View style={styles.formatInfo}>
              <ThemedText style={styles.formatTitle}>
                Formatos aceptados
              </ThemedText>
              <View style={styles.formatList}>
                <View style={styles.formatItem}>
                  <IconSymbol name="doc.fill" size={20} color="#FF3B30" />
                  <ThemedText style={styles.formatText}>PDF</ThemedText>
                </View>
                <View style={styles.formatItem}>
                  <IconSymbol name="photo.fill" size={20} color="#007AFF" />
                  <ThemedText style={styles.formatText}>JPG</ThemedText>
                </View>
                <View style={styles.formatItem}>
                  <IconSymbol name="photo.fill" size={20} color="#34C759" />
                  <ThemedText style={styles.formatText}>PNG</ThemedText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Upload Options */}
        <View style={styles.uploadOptions}>
          <Button
            title="Cámara"
            onPress={() => {}}
            variant="outline"
            style={styles.uploadButton}
          />
          <Button
            title="Archivo"
            onPress={() => {}}
            variant="outline"
            style={styles.uploadButton}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Procesar Documentos"
            onPress={() => {}}
            variant="primary"
            style={styles.primaryButton}
          />
          <Button
            title="Cancelar"
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
    marginBottom: 32,
  },
  uploadCard: {
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
  },
  formatInfo: {
    alignItems: "center",
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    opacity: 0.7,
  },
  formatList: {
    flexDirection: "row",
    gap: 16,
  },
  formatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  formatText: {
    fontSize: 14,
    fontWeight: "500",
  },
  uploadOptions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  uploadButton: {
    flex: 1,
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
