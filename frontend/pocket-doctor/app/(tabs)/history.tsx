import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/src/store";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { apiClient } from "@/src/utils/apiClient";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CustomLoader } from "@/components/ui/CustomLoader";

interface MedicalResult {
  id: string;
  title: string;
  date: string;
  type: "blood" | "imaging" | "cardiac" | "other";
  status: "normal" | "elevated" | "low" | "critical";
  description: string;
  raw_data: any;
}

// API_BASE_URL removed

// Mock removed


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

  const { session } = useAuthStore();
  const [results, setResults] = useState<MedicalResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch history when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    if (!session?.access_token) return;

    try {
      setIsLoading(true);
      const response = await apiClient("ocr-local/history", {
        token: session.access_token,
      });

      if (!response.ok) throw new Error("Error fetching history");

      const data = await response.json();

      // Map DB to UI model
      const mappedResults: MedicalResult[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.titulo || "Análisis",
        date: item.created_at ? item.created_at.split("T")[0] : "Fecha desconocida",
        type: item.tipo || "other",
        status: item.estado === "alert" ? "elevated" : "normal", // simple mapping
        description: item.resumen || "Sin resumen disponible",
        raw_data: item.datos_completos
      }));

      setResults(mappedResults);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultPress = (result: MedicalResult) => {
    console.log("Viewing result:", result.title);
    if (result.raw_data) {
      router.push({
        pathname: "/ai-analytics",
        params: { historyData: JSON.stringify(result.raw_data) }
      });
    } else {
      console.warn("No raw data for this history item");
    }
  };

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  const handleDeletePress = (id: string) => {
    Alert.alert(
      "Eliminar análisis",
      "¿Estás seguro de que quieres eliminar este resultado permanentemente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              if (!session?.access_token) return;
              // Optimistic update
              setResults(prev => prev.filter(item => item.id !== id));

              const res = await apiClient(`ocr-local/history/${id}`, {
                method: "DELETE",
                token: session.access_token
              });

              if (!res.ok) throw new Error("Failed to delete");

            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "No se pudo eliminar el análisis");
              // Revert if needed, but for MVP simple console log is ok or refetch
              fetchHistory();
            }
          }
        }
      ]
    );
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
        <ThemedText style={styles.resultDescription} numberOfLines={3}>
          {result.description}
        </ThemedText>
      </View>
      <View style={styles.resultActions}>
        <TouchableOpacity
          onPress={() => handleDeletePress(result.id)}
          style={{ padding: 4, marginRight: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
        </TouchableOpacity>

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
          <UserAvatar />
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
          {isLoading ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <CustomLoader />
              <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>Cargando historial...</ThemedText>
            </View>
          ) : results.length > 0 ? (
            results.map(renderResultItem)
          ) : (
            null
          )}
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
