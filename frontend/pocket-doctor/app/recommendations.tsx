import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router, useLocalSearchParams } from "expo-router";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useTranslation } from "react-i18next";

export default function RecommendationsScreen() {
  const { data } = useLocalSearchParams();
  const { t } = useTranslation();

  // Parse findings from params
  let analysisData: any = null;
  try {
    if (data && typeof data === 'string') {
      analysisData = JSON.parse(data);
    }
  } catch (e) {
    console.error("Error parsing recommendations data", e);
  }

  const recommendations = analysisData?.recommendations || [];
  const warnings = analysisData?.warnings || [];

  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  const handleDiscussWithIA = () => {
    router.push("/(tabs)/chat");
  };

  const handleBackToDashboard = () => {
    router.push("/(tabs)/home");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
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
              <Ionicons
                name="information-circle"
                size={40}
                color={Colors.light.white}
              />
            </View>
            <ThemedText style={styles.mainTitle}>{t('recommendations.title')}</ThemedText>
          </View>

          {/* Recommendation Cards */}
          <View style={styles.recommendationsList}>
            {recommendations.length > 0 ? (
              recommendations.map((rec: { title: string, description: string }, index: number) => (
                <View key={index} style={styles.recommendationCard}>
                  <View style={styles.cardIcon}>
                    <IconSymbol
                      name="heart.fill"
                      size={24}
                      color={Colors.light.white}
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <ThemedText style={styles.cardTitle}>
                      {rec.title}
                    </ThemedText>
                    <ThemedText style={styles.cardDescription}>
                      {rec.description}
                    </ThemedText>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.recommendationCard, { backgroundColor: Colors.light.lightGray, borderColor: Colors.light.borderGray }]}>
                <View style={[styles.cardIcon, { backgroundColor: Colors.light.textGray }]}>
                  <Ionicons name="information" size={24} color={Colors.light.white} />
                </View>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.cardTitle}>Sin recomendaciones</ThemedText>
                  <ThemedText style={styles.cardDescription}>
                    No se encontraron recomendaciones específicas para este análisis.
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Warnings Section if exists */}
            {warnings.length > 0 && (
              <View style={styles.sectionContainer}>
                <ThemedText style={[styles.sectionTitle, { marginTop: 16, marginBottom: 8 }]}>Atención Requerida</ThemedText>
                {warnings.map((warn: { title: string, description: string }, index: number) => (
                  <View key={`warn-${index}`} style={styles.warningCard}>
                    <View style={[styles.cardIcon, { backgroundColor: Colors.light.warning }]}>
                      <Ionicons name="warning" size={24} color={Colors.light.white} />
                    </View>
                    <View style={styles.cardContent}>
                      <ThemedText style={styles.cardTitle}>{warn.title}</ThemedText>
                      <ThemedText style={styles.cardDescription}>{warn.description}</ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            )}

          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleDiscussWithIA}
              activeOpacity={0.8}
            >
              <IconSymbol
                name="message.fill"
                size={20}
                color={Colors.light.white}
              />
              <ThemedText style={styles.primaryButtonText}>
                Discutir con Pocket Doctor
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToDashboard}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Volver al Dashboard
              </ThemedText>
            </TouchableOpacity>
          </View>
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
  recommendationsList: {
    gap: 16,
    marginBottom: 32,
  },
  recommendationCard: {
    backgroundColor: Colors.light.friendlyGreenBg,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.friendlyGreenBorder,
  },
  warningCard: {
    backgroundColor: Colors.light.warningBg,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.warningBorder,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.light.textGray,
    lineHeight: 22,
  },
  actionButtons: {
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
    borderColor: Colors.light.brandBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },
  sectionContainer: {
    marginTop: 24,
    gap: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.textGray,
  },
});
