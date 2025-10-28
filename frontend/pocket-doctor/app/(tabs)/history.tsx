import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";

interface MedicalResult {
  id: string;
  title: string;
  date: string;
  type: "blood" | "imaging" | "cardiac" | "other";
  status: "normal" | "elevated" | "low" | "critical";
  description: string;
}

const MOCK_MEDICAL_RESULTS: MedicalResult[] = [
  {
    id: "1",
    title: "Resultados 14 Marzo 2025",
    date: "2025-03-14",
    type: "blood",
    status: "normal",
    description:
      "Análisis de sangre completo - Todos los valores dentro del rango normal",
  },
  {
    id: "2",
    title: "Resultados 12 Marzo 2025",
    date: "2025-03-12",
    type: "cardiac",
    status: "elevated",
    description: "Electrocardiograma - Ritmo cardíaco ligeramente elevado",
  },
  {
    id: "3",
    title: "Resultados 8 Marzo 2025",
    date: "2025-03-08",
    type: "imaging",
    status: "normal",
    description: "Radiografía de tórax - Sin hallazgos patológicos",
  },
  {
    id: "4",
    title: "Resultados 5 Marzo 2025",
    date: "2025-03-05",
    type: "blood",
    status: "elevated",
    description: "Perfil lipídico - Colesterol elevado detectado",
  },
];

const getResultIcon = (type: MedicalResult["type"]) => {
  switch (type) {
    case "blood":
      return "water";
    case "imaging":
      return "scan";
    case "cardiac":
      return "heart";
    default:
      return "document-text";
  }
};

const getStatusColor = (status: MedicalResult["status"]) => {
  switch (status) {
    case "normal":
      return Colors.light.success;
    case "elevated":
    case "low":
      return Colors.light.warning;
    case "critical":
      return Colors.light.error;
    default:
      return Colors.light.gray;
  }
};

const getStatusText = (status: MedicalResult["status"]) => {
  switch (status) {
    case "normal":
      return "Normal";
    case "elevated":
      return "Elevado";
    case "low":
      return "Bajo";
    case "critical":
      return "Crítico";
    default:
      return "Pendiente";
  }
};

export default function HistoryScreen() {
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  const handleResultPress = (result: MedicalResult) => {
    console.log("Viewing result:", result.title);
    // TODO: Navigate to detailed result view
  };

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  const renderResultItem = (result: MedicalResult) => (
    <TouchableOpacity
      key={result.id}
      style={styles.resultItem}
      onPress={() => handleResultPress(result)}
      activeOpacity={0.7}
    >
      <View style={styles.resultIcon}>
        <Ionicons
          name={getResultIcon(result.type) as keyof typeof Ionicons.glyphMap}
          size={20}
          color={Colors.light.brandBlue}
        />
      </View>
      <View style={styles.resultContent}>
        <ThemedText style={styles.resultTitle}>{result.title}</ThemedText>
        <ThemedText style={styles.resultDescription}>
          {result.description}
        </ThemedText>
      </View>
      <View style={styles.resultActions}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(result.status) },
          ]}
        >
          <ThemedText style={styles.statusText}>
            {getStatusText(result.status)}
          </ThemedText>
        </View>
        <IconSymbol
          name="chevron.right"
          size={16}
          color={Colors.light.placeholderGray}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logoBlue.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.logoText}>POCKET DOCTOR</ThemedText>
          </View>
        </View>
        <View style={styles.headerRight}>
          <ThemedText style={styles.pageTitle}>Historial</ThemedText>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.profileIconText}>A</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <ThemedText style={styles.title}>Historial médico</ThemedText>
        </View>

        <View style={styles.resultsList}>
          {MOCK_MEDICAL_RESULTS.map(renderResultItem)}
        </View>

        <View style={styles.emptySpace}>
          <ThemedText style={styles.emptyText}>
            Más resultados aparecerán aquí conforme los agregues
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
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
  titleSection: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.brandBlue,
  },
  resultsList: {
    gap: 12,
  },
  resultItem: {
    backgroundColor: Colors.light.lightBlue,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.white,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: Colors.light.white,
    opacity: 0.9,
  },
  resultActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.white,
  },
  emptySpace: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.gray,
    textAlign: "center",
    fontStyle: "italic",
  },
});
