import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// 🎨 Theme Colors
const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  SUCCESS: "#34C759",
  WARNING: "#FF9500",
  MUTED: "#6B7280",
  WHITE: "#FFFFFF",
  BLACK: "#111827",
  LIGHT_GRAY: "#F8F9FA",
  BORDER: "#E5E7EB",
  RED: "#FF3B30",
} as const;

export default function UploadScreen() {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    uri: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCameraPress = () => {
    // Simulate camera file selection for testing
    setSelectedFile({
      name: "foto_laboratorio.jpg",
      type: "JPG",
      uri: "camera://photo.jpg",
    });
  };

  const handleFilePress = () => {
    // Simulate file picker for testing
    setSelectedFile({
      name: "resultados_laboratorio.pdf",
      type: "PDF",
      uri: "file://document.pdf",
    });
  };

  const handleProcessDocuments = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Por favor selecciona un archivo primero");
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement document processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Navigate to validate data screen
      router.push("/validate-data");
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el documento");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BRAND_BLUE} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logoBlue.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.logoText}>POCKET DOCTOR</ThemedText>
          </View>
        </View>
        <View style={styles.profileIcon}>
          <ThemedText style={styles.profileIconText}>A</ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Icon */}
        <View style={styles.uploadIconContainer}>
          <View style={styles.uploadIcon}>
            <IconSymbol
              name="square.and.arrow.up"
              size={48}
              color={COLORS.BRAND_BLUE}
            />
          </View>
        </View>

        {/* Title */}
        <ThemedText style={styles.title}>Subir resultados médicos</ThemedText>

        {/* File Upload Area */}
        <View style={styles.uploadArea}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleFilePress}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.uploadText}>
              {selectedFile
                ? "Archivo seleccionado ✓"
                : "Selecciona un archivo"}
            </ThemedText>

            <View style={styles.formatSection}>
              <ThemedText style={styles.formatTitle}>
                Formatos aceptados
              </ThemedText>
              <View style={styles.formatList}>
                <View style={styles.formatItem}>
                  <IconSymbol name="doc.fill" size={20} color={COLORS.RED} />
                  <ThemedText style={styles.formatText}>PDF</ThemedText>
                </View>
                <View style={styles.formatItem}>
                  <IconSymbol
                    name="photo.fill"
                    size={20}
                    color={COLORS.LIGHT_BLUE}
                  />
                  <ThemedText style={styles.formatText}>JPG</ThemedText>
                </View>
                <View style={styles.formatItem}>
                  <IconSymbol
                    name="photo.fill"
                    size={20}
                    color={COLORS.SUCCESS}
                  />
                  <ThemedText style={styles.formatText}>PNG</ThemedText>
                </View>
              </View>
            </View>

            {/* Upload Options */}
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleCameraPress}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="camera.fill"
                  size={20}
                  color={COLORS.BRAND_BLUE}
                />
                <ThemedText style={styles.optionText}>Cámara</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleFilePress}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="doc.fill"
                  size={20}
                  color={COLORS.BRAND_BLUE}
                />
                <ThemedText style={styles.optionText}>Archivo</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Selected File Display */}
        {selectedFile && (
          <View style={styles.selectedFileContainer}>
            <View style={styles.selectedFile}>
              <IconSymbol name="doc.fill" size={24} color={COLORS.BRAND_BLUE} />
              <View style={styles.fileInfo}>
                <ThemedText style={styles.fileName}>
                  {selectedFile.name}
                </ThemedText>
                <ThemedText style={styles.fileType}>
                  {selectedFile.type}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <Ionicons name="close-circle" size={24} color={COLORS.MUTED} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.processButton,
              (!selectedFile || isProcessing) && styles.processButtonDisabled,
            ]}
            onPress={handleProcessDocuments}
            disabled={!selectedFile || isProcessing}
          >
            <ThemedText style={styles.processButtonText}>
              {isProcessing ? "Procesando..." : "Procesar Documentos"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isProcessing}
          >
            <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
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
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    lineHeight: 22,
  },
  profileIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Upload Icon
  uploadIconContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // Title
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    textAlign: "center",
    marginBottom: 32,
    textDecorationLine: "underline",
  },

  // Upload Area
  uploadArea: {
    marginBottom: 32,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.BRAND_BLUE,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
    marginBottom: 24,
  },
  formatSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.MUTED,
    marginBottom: 12,
  },
  formatList: {
    flexDirection: "row",
    gap: 20,
  },
  formatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  formatText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.BLACK,
  },
  uploadOptions: {
    flexDirection: "row",
    gap: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.BRAND_BLUE,
  },

  // Selected File
  selectedFileContainer: {
    marginBottom: 24,
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.SUCCESS,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  fileType: {
    fontSize: 14,
    color: COLORS.MUTED,
  },

  // Action Buttons
  actionButtons: {
    marginTop: "auto",
    gap: 12,
  },
  processButton: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  processButtonDisabled: {
    backgroundColor: COLORS.LIGHT_BLUE,
    opacity: 0.7,
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  cancelButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BRAND_BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
  },
});
