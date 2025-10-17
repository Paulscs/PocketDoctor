import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";

const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  MEDICAL_BLUE: "#1E40AF",
  HEALTH_GREEN: "#059669",
  WARNING: "#F59E0B",
  WARNING_BG: "#FEF3C7",
  WARNING_BORDER: "#FCD34D",
  SUCCESS: "#10B981",
  SUCCESS_BG: "#D1FAE5",
  SUCCESS_BORDER: "#6EE7B7",
  DANGER: "#EF4444",
  DANGER_BG: "#FEE2E2",
  DANGER_BORDER: "#FCA5A5",
  WHITE: "#FFFFFF",
  GRAY_50: "#F9FAFB",
  GRAY_100: "#F3F4F6",
  GRAY_200: "#E5E7EB",
  GRAY_300: "#D1D5DB",
  GRAY_400: "#9CA3AF",
  GRAY_500: "#6B7280",
  GRAY_600: "#4B5563",
  GRAY_700: "#374151",
  GRAY_800: "#1F2937",
  GRAY_900: "#111827",
};

interface MedicalData {
  id: string;
  name: string;
  value: string;
  normalRange: string;
  status: "normal" | "elevated" | "low";
}

const initialMockData: MedicalData[] = [
  {
    id: "1",
    name: "Hemoglobina",
    value: "12.5 g/dL",
    normalRange: "12.0-15.5 g/dL",
    status: "normal",
  },
  {
    id: "2",
    name: "Células blancas",
    value: "8.2 K/μL",
    normalRange: "4.0-11.0 K/μL",
    status: "normal",
  },
  {
    id: "3",
    name: "Colesterol",
    value: "245 mg/dL",
    normalRange: "<200 mg/dL",
    status: "elevated",
  },
  {
    id: "4",
    name: "Creatinina",
    value: "0.9 mg/dL",
    normalRange: "0.6-1.2 mg/dL",
    status: "normal",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "normal":
      return {
        backgroundColor: COLORS.SUCCESS_BG,
        borderColor: COLORS.SUCCESS_BORDER,
        textColor: COLORS.SUCCESS,
        text: "Normal",
      };
    case "elevated":
      return {
        backgroundColor: COLORS.WARNING_BG,
        borderColor: COLORS.WARNING_BORDER,
        textColor: COLORS.WARNING,
        text: "Elevado",
      };
    case "low":
      return {
        backgroundColor: COLORS.DANGER_BG,
        borderColor: COLORS.DANGER_BORDER,
        textColor: COLORS.DANGER,
        text: "Bajo",
      };
    default:
      return {
        backgroundColor: COLORS.GRAY_100,
        borderColor: COLORS.GRAY_300,
        textColor: COLORS.GRAY_600,
        text: "Desconocido",
      };
  }
};

export default function ValidateDataScreen() {
  const [medicalData, setMedicalData] =
    useState<MedicalData[]>(initialMockData);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingData, setEditingData] = useState<MedicalData | null>(null);
  const [editValue, setEditValue] = useState("");

  const backgroundColor = useThemeColor(
    { light: COLORS.WHITE, dark: "#000000" },
    "background"
  );

  const handleProceedWithAI = () => {
    router.push("/ai-analytics");
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDownloadPDF = () => {
    console.log("Download PDF");
  };

  const handleEditValue = (dataId: string) => {
    const data = medicalData.find(d => d.id === dataId);
    if (data) {
      setEditingData(data);
      setEditValue(data.value);
      setIsEditModalVisible(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingData && editValue.trim()) {
      setMedicalData(prevData =>
        prevData.map(data =>
          data.id === editingData.id
            ? { ...data, value: editValue.trim() }
            : data
        )
      );
      setIsEditModalVisible(false);
      setEditingData(null);
      setEditValue("");
      Alert.alert("Éxito", "Valor actualizado correctamente");
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
          <Ionicons name="arrow-back" size={24} color={COLORS.GRAY_700} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logoBlue.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.brandTitle}>POCKET DOCTOR</ThemedText>
          </View>
        </View>

        <View style={styles.profileIcon}>
          <ThemedText style={styles.profileIconText}>A</ThemedText>
        </View>
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
              <Ionicons name="sync" size={40} color={COLORS.WHITE} />
            </View>
            <ThemedText style={styles.mainTitle}>
              Validar datos extraídos
            </ThemedText>
          </View>

          {/* Data List */}
          <View style={styles.dataList}>
            {medicalData.map(data => {
              const statusConfig = getStatusConfig(data.status);
              return (
                <View key={data.id} style={styles.dataCard}>
                  <View style={styles.dataHeader}>
                    <View style={styles.dataIcon}>
                      <Ionicons name="medical" size={16} color={COLORS.WHITE} />
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
                            color={COLORS.MEDICAL_BLUE}
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
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleProceedWithAI}
          activeOpacity={0.8}
        >
          <Ionicons name="bulb" size={20} color={COLORS.WHITE} />
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
                <Ionicons name="close" size={20} color={COLORS.GRAY_500} />
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
                placeholderTextColor={COLORS.GRAY_400}
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
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.GRAY_50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  backButton: {
    padding: 8,
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
  brandTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    lineHeight: 22,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  profileIconText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
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
    backgroundColor: COLORS.BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: COLORS.BRAND_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.GRAY_800,
    textAlign: "center",
  },
  dataList: {
    gap: 16,
  },
  dataCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.GRAY_100,
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
    backgroundColor: COLORS.BRAND_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dataName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.GRAY_800,
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
    color: COLORS.GRAY_500,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY_800,
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
    color: COLORS.GRAY_500,
    marginBottom: 4,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY_800,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.BRAND_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: COLORS.GRAY_900,
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
    borderBottomColor: COLORS.GRAY_200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.GRAY_800,
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
    color: COLORS.GRAY_600,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY_800,
    backgroundColor: COLORS.GRAY_100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.GRAY_800,
    backgroundColor: COLORS.WHITE,
  },
  normalRange: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.GRAY_600,
    backgroundColor: COLORS.GRAY_50,
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
    borderTopColor: COLORS.GRAY_200,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY_600,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
});
