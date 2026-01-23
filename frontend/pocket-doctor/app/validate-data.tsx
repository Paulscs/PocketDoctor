import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router, useLocalSearchParams } from "expo-router"; // 👈 IMPORTANT: Receives the data
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";

// --- Types matching Backend Response ---

interface RefRange {
  min: number | null;
  max: number | null;
}

// Corresponds to 'LabItem' in ocr_local.py
interface BackendLabItem {
  name_raw: string;
  name: string;
  value: number | null;
  unit: string | null;
  ref_range: RefRange | null;
  flag: string | null;
  status: string | null;
  line: string;
}

// --- Frontend UI Types ---

interface MedicalData {
  id: string;
  name: string;
  value: string;
  normalRange: string;
  status: "normal" | "elevated" | "low" | "unknown";
}

// Helper to map Python status to UI status
const mapBackendStatus = (status: string | null): MedicalData["status"] => {
  if (!status) return "unknown";
  const s = status.toLowerCase();
  if (s === "alto") return "elevated";
  if (s === "bajo") return "low";
  if (s === "normal") return "normal";
  return "unknown";
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "normal":
      return {
        backgroundColor: Colors.light.friendlyGreenBg,
        borderColor: Colors.light.friendlyGreenBorder,
        textColor: Colors.light.success,
        text: "Normal",
      };
    case "elevated":
      return {
        backgroundColor: Colors.light.warningBg,
        borderColor: Colors.light.warningBorder,
        textColor: Colors.light.warning,
        text: "Elevado",
      };
    case "low":
      return {
        backgroundColor: Colors.light.error,
        borderColor: Colors.light.error,
        textColor: Colors.light.error,
        text: "Bajo",
      };
    default:
      return {
        backgroundColor: Colors.light.lightGray,
        borderColor: Colors.light.borderGray,
        textColor: Colors.light.gray,
        text: "Revisar",
      };
  }
};

export default function ValidateDataScreen() {
  // 👇 1. Receive data passed from previous screen
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const [medicalData, setMedicalData] = useState<MedicalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingData, setEditingData] = useState<MedicalData | null>(null);
  const [editValue, setEditValue] = useState("");

  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  // 👇 2. Effect: Load and Parse Data
  useEffect(() => {
    if (params.ocrData) {
      try {
        // Parse the JSON string coming from upload.tsx
        const parsedResponse = typeof params.ocrData === 'string'
          ? JSON.parse(params.ocrData)
          : params.ocrData;

        const items: BackendLabItem[] = parsedResponse.items || [];

        // Map Backend Items to Frontend UI Model
        const mappedData: MedicalData[] = items.map((item, index) => {
          // Format Range: e.g., "12.0 - 15.0"
          let rangeStr = "N/A";
          if (item.ref_range) {
            const min = item.ref_range.min ?? "?";
            const max = item.ref_range.max ?? "?";
            rangeStr = `${min} - ${max}`;
          }

          // Format Value: e.g. "12.5 g/dL"
          const valStr = item.value !== null ? item.value.toString() : "-";
          const unitStr = item.unit ? ` ${item.unit}` : "";

          return {
            id: index.toString(),
            name: item.name,
            value: `${valStr}${unitStr}`,
            normalRange: `${rangeStr}${unitStr}`,
            status: mapBackendStatus(item.status),
          };
        });

        setMedicalData(mappedData);
      } catch (e) {
        Alert.alert("Error", "No se pudieron procesar los datos del servidor.");
        console.error("Error parsing OCR data:", e);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [params.ocrData]);

  const handleProceedWithAI = () => {
    // Send valid data to the next step
    router.push({
      pathname: "/ai-analytics",
      params: { validatedData: JSON.stringify(medicalData) }
    });
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDownloadPDF = () => {
    console.log("Download PDF");
  };

  const handleEditValue = (dataId: string) => {
    const data = medicalData.find((d) => d.id === dataId);
    if (data) {
      setEditingData(data);
      setEditValue(data.value);
      setIsEditModalVisible(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingData && editValue.trim()) {
      setMedicalData((prevData) =>
        prevData.map((data) =>
          data.id === editingData.id
            ? { ...data, value: editValue.trim() }
            : data
        )
      );
      setIsEditModalVisible(false);
      setEditingData(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingData(null);
    setEditValue("");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.brandBlue} />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}></ThemedText>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Icon and Title */}
          <View style={styles.iconContainer}>
            <View style={styles.mainIcon}>
              <Ionicons name="sync" size={40} color={Colors.light.white} />
            </View>
            <ThemedText style={styles.mainTitle}>
              {t('validate.subtitle')}
            </ThemedText>
          </View>

          {/* Loading State or Empty State */}
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.brandBlue} />
          ) : medicalData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={{ textAlign: 'center', color: Colors.light.gray }}>
                No se encontraron resultados legibles.
              </ThemedText>
            </View>
          ) : (
            /* Data List */
            <View style={styles.dataList}>
              {medicalData.map((data) => {
                const statusConfig = getStatusConfig(data.status);
                return (
                  <View key={data.id} style={styles.dataCard}>
                    <View style={styles.dataHeader}>
                      <View style={styles.dataIcon}>
                        <Ionicons
                          name="medical"
                          size={16}
                          color={Colors.light.white}
                        />
                      </View>
                      <ThemedText style={styles.dataName}>{data.name}</ThemedText>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: statusConfig.backgroundColor,
                            borderColor: statusConfig.borderColor,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.statusText,
                            { color: statusConfig.textColor },
                          ]}
                        >
                          {statusConfig.text}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.dataContent}>
                      <View style={styles.valueContainer}>
                        <ThemedText style={styles.valueLabel}>Valor</ThemedText>
                        <View style={styles.valueRow}>
                          <ThemedText style={styles.valueText}>
                            {data.value}
                          </ThemedText>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditValue(data.id)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="pencil"
                              size={14}
                              color={Colors.light.medicalBlue}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.rangeContainer}>
                        <ThemedText style={styles.rangeLabel}>
                          Rango normal
                        </ThemedText>
                        <ThemedText style={styles.rangeText}>
                          {data.normalRange}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleProceedWithAI}
          activeOpacity={0.8}
        >
          <Ionicons name="bulb" size={20} color={Colors.light.white} />
          <ThemedText style={styles.primaryButtonText}>
            Proceder con Analíticas IA
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.secondaryButtonText}>Cancelar</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleDownloadPDF}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.secondaryButtonText}>
            Descargar PDF
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Editar {editingData?.name}
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancelEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={Colors.light.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.modalLabel}>Valor actual:</ThemedText>
              <ThemedText style={styles.currentValue}>
                {editingData?.value}
              </ThemedText>

              <ThemedText style={styles.modalLabel}>Nuevo valor:</ThemedText>
              <TextInput
                style={styles.editInput}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="Ingresa el nuevo valor"
                placeholderTextColor={Colors.light.placeholderGray}
                autoFocus={true}
              />

              <ThemedText style={styles.modalLabel}>Rango normal:</ThemedText>
              <ThemedText style={styles.normalRange}>
                {editingData?.normalRange}
              </ThemedText>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelEdit}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.modalCancelText}>Cancelar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveEdit}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.modalSaveText}>Guardar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  backButton: {
    padding: 8,
    position: "absolute",
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    textAlign: "center",
  },
  scrollContent: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  mainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.light.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.textGray,
    textAlign: "center",
  },
  dataList: {
    gap: 16,
  },
  dataCard: {
    backgroundColor: Colors.light.friendlyBlueBg,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.friendlyBlueBorder,
  },
  dataHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dataIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dataName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.textGray,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dataContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  valueContainer: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.gray,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  rangeContainer: {
    alignItems: "flex-end",
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.gray,
    marginBottom: 4,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderGray,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.textGray,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.gray,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.textGray,
    backgroundColor: Colors.light.white,
  },
  normalRange: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.gray,
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderGray,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.gray,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
});