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
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useTranslation } from "react-i18next";

type SelectedFile = {
  id: string;
  name: string;
  type: string;
  uri: string;
};

// API_BASE_URL removed (using centralized apiClient)

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function UploadScreen() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { t } = useTranslation();

  const session = useAuthStore((state) => state.session);
  const accessToken = session?.access_token;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFilePress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (asset.size && asset.size > MAX_FILE_SIZE) {
        Alert.alert(t('upload.error_size_title'), t('upload.error_size_message'));
        return;
      }

      const newFile = {
        id: Date.now().toString(),
        name: asset.name || "documento.pdf",
        type: asset.mimeType || "application/pdf",
        uri: asset.uri,
      };

      const isPdf = newFile.type.includes("pdf");
      const currentIsPdf = selectedFiles.some(f => f.type.includes("pdf"));

      // Logic: 
      // 1. If incoming is PDF -> Replace all (Single PDF rule)
      // 2. If current is PDF -> Replace all (Single PDF rule)
      // 3. If incoming is Image AND current is Image(s) -> Append

      if (isPdf || currentIsPdf) {
        if (selectedFiles.length > 0) {
          showToast("Archivo reemplazado. Solo se permite 1 PDF o múltiples imágenes.");
        }
        setSelectedFiles([newFile]);
      } else {
        // Appending image
        setSelectedFiles(prev => [...prev, newFile]);
      }

    } catch (error) {
      console.error("Error selecting file:", error);
      Alert.alert(t('upload.error_select_title'), t('upload.error_select_message'));
    }
  };

  // 2. LÓGICA DE CÁMARA IMPLEMENTADA
  const handleCameraPress = async () => {
    try {
      // Pedir permisos
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(t('upload.permission_title'), t('upload.permission_message'));
        return;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
          Alert.alert(t('upload.error_size_title'), t('upload.error_size_message'));
          return;
        }

        // Determinar nombre y tipo
        const fileName = asset.fileName || `foto_${Date.now()}.jpg`;
        const fileType = asset.mimeType || "image/jpeg";

        const newFile: SelectedFile = {
          id: Date.now().toString(),
          name: fileName,
          type: fileType,
          uri: asset.uri,
        };

        const currentIsPdf = selectedFiles.some(f => f.type.includes("pdf"));

        if (currentIsPdf) {
          showToast("PDF reemplazado por imagen. Puedes agregar más imágenes.");
          setSelectedFiles([newFile]);
        } else {
          // Append image
          setSelectedFiles(prev => [...prev, newFile]);
        }
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert(t('upload.error_camera_title'), t('upload.error_camera_message'));
    }
  };

  // Helper to trigger ActionSheet for the "+" button
  const handleAddMore = () => {
    Alert.alert(
      t('upload.add_more_title'),
      t('upload.add_more_message'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: t('upload.gallery'), onPress: handleFilePress },
        { text: t('upload.camera'), onPress: handleCameraPress },
      ]
    );
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };


  // Helper functions removed

  const handleProcessDocuments = async () => {
    // console.log("handleProcessDocuments started...");
    // Alert.alert("Debug", `Iniciando subida de ${selectedFiles.length} archivos`); // Removed debug alert

    if (selectedFiles.length === 0) {
      Alert.alert(t('common.error'), t('upload.error_empty'));
      return;
    }

    if (!isAccepted) {
      Alert.alert(t('common.error'), t('upload.error_terms'));
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
    <View style={styles.fileItemContainer}>
      <View style={styles.fileCard}>
        {item.type.includes("image") ? (
          <Image source={{ uri: item.uri }} style={styles.fileImage} resizeMode="cover" />
        ) : (
          <View style={styles.pdfCardPlaceholder}>
            <View style={styles.pdfIconCircle}>
              <IconSymbol name="doc.fill" size={20} color={Colors.light.brandBlue} />
            </View>
            <ThemedText style={styles.fileTypeLabel}>PDF</ThemedText>
          </View>
        )}
      </View>

      {/* Accessorized Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFile(item.id)}
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={16} color={Colors.light.white} />
      </TouchableOpacity>

      {/* Filename below card */}
      <ThemedText style={styles.fileName} numberOfLines={1}>
        {item.name}
      </ThemedText>
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
        <UserAvatar />
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

        <ThemedText style={styles.title}>{t('upload.title')}</ThemedText>

        <View style={styles.uploadArea}>
          <View style={styles.uploadControls}>
            <ThemedText style={styles.uploadText}>
              {selectedFiles.length > 0
                ? t('upload.files_selected', { count: selectedFiles.length })
                : t('upload.select_file')}
            </ThemedText>

            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleAddMore} // Now opens the menu
                activeOpacity={0.7}
              >
                <Ionicons
                  name="camera"
                  size={20}
                  color={Colors.light.brandBlue}
                />
                <ThemedText style={styles.optionText}>{t('upload.camera')}</ThemedText>
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
                <ThemedText style={styles.optionText}>{t('upload.file')}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {selectedFiles.length > 0 && (
          <View style={styles.filesListContainer}>
            <ThemedText style={styles.filesListTitle}>{t('upload.files_ready')}</ThemedText>
            <FlatList
              data={selectedFiles}
              renderItem={renderFileItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.filesListContent}
              ListFooterComponent={
                !selectedFiles.some(f => f.type.includes("pdf")) ? (
                  <TouchableOpacity
                    style={[styles.fileCard, styles.addMoreButton]}
                    onPress={handleAddMore}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={32} color={Colors.light.brandBlue} />
                    <ThemedText style={styles.addMoreText}>{t('upload.add')}</ThemedText>
                  </TouchableOpacity>
                ) : null
              }
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
              {t('upload.accept_prefix')} <ThemedText style={styles.termsLink}>{t('upload.accept_terms')}</ThemedText>
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
                {t('upload.process')}
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isProcessing}
          >
            <ThemedText style={styles.cancelButtonText}>{t('common.cancel')}</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Ionicons name="information-circle" size={20} color={Colors.light.white} />
            <ThemedText style={styles.toastText}>{toastMessage}</ThemedText>
          </View>
        </View>
      )}

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

  // Premium File List Styles
  filesListContainer: {
    marginBottom: 24,
    height: 160, // Safe height
  },
  filesListTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    color: Colors.light.textGray,
    marginLeft: 4,
  },
  filesListContent: {
    paddingLeft: 4,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 30, // Huge padding to prevent shadow clip
    gap: 16,
  },
  fileItemContainer: {
    width: 80, // Micro size
    alignItems: 'center',
  },
  fileCard: {
    width: 80,
    height: 100, // Micro size
    borderRadius: 12,
    backgroundColor: Colors.light.white,
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  fileImage: {
    width: '100%',
    height: '100%',
  },
  pdfCardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.friendlyBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pdfIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.brandBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addMoreButton: {
    backgroundColor: Colors.light.lightGray,
    borderWidth: 2,
    borderColor: Colors.light.brandBlue,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.brandBlue,
  },
  fileTypeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    letterSpacing: 0.5,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  fileName: {
    marginTop: 6,
    fontSize: 10,
    color: Colors.light.textGray,
    textAlign: 'center',
    width: '100%',
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
  // Toast Styles
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
