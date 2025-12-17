import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
// 1. IMPORTANTE: Importar ImagePicker
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "@/src/utils/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { TermsModal } from "@/components/TermsModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/src/store";

type SelectedFile = {
  id: string;
  name: string;
  type: string;
  uri: string;
};

// API_BASE_URL removed (using centralized apiClient)

export default function UploadScreen() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const session = useAuthStore((state) => state.session);
  const accessToken = session?.access_token;

  const handleFilePress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"], // Permitir imágenes también si se seleccionan como archivo
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const newFile = {
        id: Date.now().toString(),
        name: asset.name || "documento.pdf",
        type: asset.mimeType || "application/pdf",
        uri: asset.uri,
      };

      if (newFile.type?.includes("pdf")) {
        setSelectedFiles([newFile]);
      } else {
        setSelectedFiles([newFile]);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  // 2. LÓGICA DE CÁMARA IMPLEMENTADA
  const handleCameraPress = async () => {
    try {
      // Pedir permisos
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permiso requerido", "Es necesario acceder a la cámara para tomar fotos de los documentos.");
        return;
      }

      // Si ya hay un PDF, limpiar porque no mezclamos
      const hasPdf = selectedFiles.some(f => f.type.includes("pdf"));
      if (hasPdf) {
        setSelectedFiles([]);
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8, // Calidad alta pero optimizada para subida
        allowsEditing: true, // Permitir recortar la imagen (útil para documentos)
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        // Determinar nombre y tipo
        const fileName = asset.fileName || `foto_${Date.now()}.jpg`;
        const fileType = asset.mimeType || "image/jpeg";

        const newFile: SelectedFile = {
          id: Date.now().toString(),
          name: fileName,
          type: fileType,
          uri: asset.uri,
        };

        setSelectedFiles((prev) => {
          if (prev.some(f => f.type.includes('pdf'))) return [newFile];
          return [...prev, newFile];
        });
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Error", "No se pudo abrir la cámara");
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };


  // Helper functions removed

  const handleProcessDocuments = async () => {
    // console.log("handleProcessDocuments started...");
    Alert.alert("Debug", `Iniciando subida de ${selectedFiles.length} archivos`);

    if (selectedFiles.length === 0) {
      Alert.alert("Error", "Por favor selecciona al menos un archivo");
      return;
    }

    if (!isAccepted) {
      Alert.alert("Error", "Debe aceptar el aviso legal para continuar.");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        console.log(`Appending file ${index}:`, file.name, file.type, file.uri);
        // @ts-ignore
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      console.log("Sending files via apiClient...");

      const response = await apiClient("ocr-local/pdf", {
        method: "POST",
        token: accessToken || "",
        body: formData,
        timeout: 120000,
      });

      console.log("Fetch returned with status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response text:", errorText);
        throw new Error(`Server Error: ${response.status} ${errorText}`);
      }

      const ocrResult = await response.json();
      console.log("OCR Success:", ocrResult.items?.length, "items found");

      router.push({
        pathname: "/ai-analytics",
        params: { ocrData: JSON.stringify(ocrResult) },
      });

    } catch (error: any) {
      console.error("Upload Error caught:", error);
      let errorMessage = error.message || "No se pudo procesar el documento.";
      // Specific error handling if needed
      Alert.alert("Error", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const renderFileItem = ({ item }: { item: SelectedFile }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileIcon}>
        <IconSymbol
          name={item.type.includes('pdf') ? "doc.fill" : "photo.fill"}
          size={24}
          color={Colors.light.brandBlue}
        />
      </View>

      {item.type.includes("image") ? (
        <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={styles.pdfThumbnailPlaceholder}>
          <ThemedText style={{ fontSize: 10, color: '#666' }}>PDF</ThemedText>
        </View>
      )}

      <TouchableOpacity style={styles.removeButton} onPress={() => removeFile(item.id)}>
        <Ionicons name="close-circle" size={20} color={Colors.light.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.uploadIconContainer}>
          <View style={styles.uploadIcon}>
            <IconSymbol
              name="square.and.arrow.up"
              size={48}
              color={Colors.light.brandBlue}
            />
          </View>
        </View>

        <ThemedText style={styles.title}>Subir resultados médicos</ThemedText>

        <View style={styles.uploadArea}>
          <View style={styles.uploadControls}>
            <ThemedText style={styles.uploadText}>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} archivo(s) seleccionado(s)`
                : "Selecciona un archivo"}
            </ThemedText>

            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleCameraPress} // Ahora llama a la función real
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
          </View>
        </View>

        {selectedFiles.length > 0 && (
          <View style={styles.filesListContainer}>
            <ThemedText style={styles.filesListTitle}>Archivos listos para enviar:</ThemedText>
            <FlatList
              data={selectedFiles}
              renderItem={renderFileItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filesListContent}
            />
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setShowTerms(true)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkboxLike,
                isAccepted && styles.checkboxLikeChecked,
              ]}
            >
              {isAccepted && (
                <Ionicons name="checkmark" size={14} color={Colors.light.white} />
              )}
            </View>
            <ThemedText style={styles.termsText}>
              He leído y acepto los <ThemedText style={styles.termsLink}>Aviso Legal</ThemedText>
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.processButton,
              (selectedFiles.length === 0 || isProcessing || !isAccepted) &&
              styles.processButtonDisabled,
            ]}
            onPress={handleProcessDocuments}
            disabled={selectedFiles.length === 0 || isProcessing || !isAccepted}
          >
            {isProcessing ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <ThemedText style={styles.processButtonText}>
                Procesar Documentos
              </ThemedText>
            )}
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

      <TermsModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setIsAccepted(true);
          setShowTerms(false);
        }}
      />
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
  // Modified styles for new layout
  uploadControls: {
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.light.brandBlue,
    borderRadius: 16,
    padding: 24,
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

  // File List Styles
  filesListContainer: {
    marginBottom: 24,
    height: 140,
  },
  filesListTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: Colors.light.gray,
  },
  filesListContent: {
    gap: 12,
    paddingRight: 20,
  },
  fileItem: {
    width: 100,
    height: 120,
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center'
  },
  fileIcon: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 80,
    borderRadius: 4,
    marginTop: 14
  },
  pdfThumbnailPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#eee',
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  checkboxLike: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.gray,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLikeChecked: {
    backgroundColor: Colors.light.brandBlue,
    borderColor: Colors.light.brandBlue,
  },
  termsText: {
    fontSize: 14,
    color: Colors.light.textGray,
    flex: 1,
  },
  termsLink: {
    color: Colors.light.brandBlue,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
