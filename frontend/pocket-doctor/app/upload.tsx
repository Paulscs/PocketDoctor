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
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function UploadScreen() {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    uri: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCameraPress = () => {
    setSelectedFile({
      name: "foto_laboratorio.jpg",
      type: "JPG",
      uri: "camera://photo.jpg",
    });
  };

  const handleFilePress = () => {
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push("/validate-data");
    } catch {
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
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.light.brandBlue}
          />
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
              color={Colors.light.brandBlue}
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
                  <IconSymbol
                    name="doc.fill"
                    size={20}
                    color={Colors.light.error}
                  />
                  <ThemedText style={styles.formatText}>PDF</ThemedText>
                </View>
                <View style={styles.formatItem}>
                  <IconSymbol
                    name="photo.fill"
                    size={20}
                    color={Colors.light.lightBlue}
                  />
                  <ThemedText style={styles.formatText}>JPG</ThemedText>
                </View>
                <View style={styles.formatItem}>
                  <IconSymbol
                    name="photo.fill"
                    size={20}
                    color={Colors.light.success}
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
                <Ionicons
                  name="camera"
                  size={20}
                  color={Colors.light.brandBlue}
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
                  color={Colors.light.brandBlue}
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
              <IconSymbol
                name="doc.fill"
                size={24}
                color={Colors.light.brandBlue}
              />
              <View style={styles.fileInfo}>
                <ThemedText style={styles.fileName}>
                  {selectedFile.name}
                </ThemedText>
                <ThemedText style={styles.fileType}>
                  {selectedFile.type}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={Colors.light.gray}
                />
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
    backgroundColor: Colors.light.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
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
    color: Colors.light.brandBlue,
    lineHeight: 22,
  },
  profileIcon: {
    width: 32,
    height: 32,
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  uploadIconContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    textAlign: "center",
    marginBottom: 32,
    textDecorationLine: "underline",
  },

  uploadArea: {
    marginBottom: 32,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.light.brandBlue,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    backgroundColor: Colors.light.lightGray,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.brandBlue,
    marginBottom: 24,
  },
  formatSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.gray,
    marginBottom: 12,
  },
  formatList: {
    flexDirection: "row",
    gap: 20,
  },
  formatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    gap: 6,
  },
  formatText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.black,
  },
  uploadOptions: {
    flexDirection: "row",
    gap: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.brandBlue,
  },

  selectedFileContainer: {
    marginBottom: 24,
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.success,
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
    color: Colors.light.black,
    marginBottom: 2,
  },
  fileType: {
    fontSize: 14,
    color: Colors.light.gray,
  },

  actionButtons: {
    marginTop: "auto",
    gap: 12,
  },
  processButton: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  processButtonDisabled: {
    backgroundColor: Colors.light.lightBlue,
    opacity: 0.7,
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
  cancelButton: {
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },
});
