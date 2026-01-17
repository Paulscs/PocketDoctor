import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/src/store";
import { useChatStore } from "@/src/store/chatStore";
import { apiClient } from "@/src/utils/apiClient";
import { HeartRateLoader } from "@/components/ui/HeartRateLoader";
import { useTranslation } from "react-i18next";

export default function IAAnalyticsScreen() {
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(true);
  const [analysisData, setAnalysisData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const session = useAuthStore((state) => state.session);
  const accessToken = session?.access_token;

  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  // API_BASE_URL removed

  React.useEffect(() => {
    const loadAnalysis = async () => {
      // 1. History mode (Offline/Cached data)
      if (params.historyData) {
        try {
          const data = typeof params.historyData === 'string'
            ? JSON.parse(params.historyData)
            : params.historyData;
          setAnalysisData(data);
          setAnalysisData(data);
        } catch (err: any) {
          setError(t('analytics.error_loading_history'));
        } finally {
          setLoading(false);
        }
        return;
      }

      // 2. New Analysis mode (OCR Data -> LLM)
      const fetchNewAnalysis = async () => {
        try {
          if (!params.ocrData) {
            throw new Error(t('analytics.error_no_data'));
          }

          const ocrResult = typeof params.ocrData === 'string'
            ? JSON.parse(params.ocrData)
            : params.ocrData;

          // Prepare payload for LLM analysis
          const payload = {
            ocr_text: ocrResult.text || "",
            patient_profile: ocrResult.analysis_input?.patient_profile || null,
            draft_analysis_input: ocrResult.analysis_input || null,
          };

          console.log("Requesting AI Analysis...");

          const response = await apiClient("ocr-local/parse-llm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            token: accessToken,
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || t('analytics.error_analyzing'));
          }

          const data = await response.json();
          setAnalysisData(data);
        } catch (err: any) {
          console.error("Analysis Error:", err);
          setError(err.message || t('analytics.error_unknown'));
        } finally {
          setLoading(false);
        }
      };

      fetchNewAnalysis();
    };

    loadAnalysis();
  }, [params.ocrData, params.historyData]);

  // Stabilize the ID for this analysis session
  const uniqueAnalysisId = React.useMemo(() => {
    if (params.historyData) {
      try {
        const parsed = typeof params.historyData === 'string'
          ? JSON.parse(params.historyData)
          : params.historyData;
        return parsed.id ? parsed.id.toString() : `analysis-${Date.now()}`;
      } catch {
        return `analysis-${Date.now()}`;
      }
    }
    return `analysis-${Date.now()}`;
  }, [params.historyData]); // Depend only on params.historyData

  React.useEffect(() => {
    // Auto-create/Resume chat session once data is available
    if (analysisData && !loading) {
      useChatStore.getState().createSessionFromAnalysis(analysisData, uniqueAnalysisId);
    }
  }, [analysisData, loading, uniqueAnalysisId]);

  const handleViewDetailedRecommendations = () => {
    router.push({
      pathname: "/recommendations",
      params: {
        data: JSON.stringify(analysisData)
      }
    });
  };

  const handleDownloadPDF = () => {
    console.log("Download PDF");
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <HeartRateLoader />
        <ThemedText style={{ marginTop: 20 }}>{t('analytics.analyzing')}</ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.error} />
        <ThemedText style={{ marginTop: 20, textAlign: 'center', color: Colors.light.error }}>{error}</ThemedText>
        <TouchableOpacity style={styles.actionButton} onPress={handleBack}>
          <ThemedText style={styles.actionButtonText}>{t('common.back')}</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
          {/* IA Title */}
          <View style={styles.iconContainer}>
            <ThemedText style={styles.mainTitle}>{t('analytics.title')}</ThemedText>
          </View>

          {/* Analysis Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIcon}>
                <ThemedText style={styles.overviewIconText}>{t('home.ia')}</ThemedText>
              </View>
              <ThemedText style={styles.overviewTitle}>
                {t('analytics.complete_analysis')}
              </ThemedText>
            </View>
            <ThemedText style={styles.overviewText}>
              {analysisData?.summary || t('analytics.no_summary')}
            </ThemedText>
          </View>

          {/* Medical Details Section */}
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>
              {t('analytics.medical_details')}
            </ThemedText>

            {analysisData?.analysis_input?.lab_results?.map((item: any, index: number) => (
              <View key={index} style={styles.medicalCard}>
                <View style={styles.medicalCardHeader}>
                  <ThemedText style={styles.medicalCardTitle} numberOfLines={2}>
                    {item.name}
                  </ThemedText>
                  <View style={[
                    styles.priorityPill,
                    item.status === 'alto' ? { backgroundColor: Colors.light.error + '20', borderColor: Colors.light.error } :
                      item.status === 'bajo' ? { backgroundColor: Colors.light.warningBg, borderColor: Colors.light.warningBorder } :
                        { backgroundColor: Colors.light.friendlyGreenBg, borderColor: Colors.light.friendlyGreenBorder }
                  ]}>
                    <ThemedText style={[
                      styles.priorityText,
                      item.status === 'alto' ? { color: Colors.light.error } :
                        item.status === 'bajo' ? { color: Colors.light.warning } :
                          { color: Colors.light.success }
                    ]}>
                      {item.status ? (t(`history.status.${item.status}`) || item.status.toUpperCase()) : t('analytics.normal')}
                    </ThemedText>
                  </View>
                </View>

                {/* Value Section */}
                <View style={styles.analysisSection}>
                  <ThemedText style={styles.analysisTitle}>{t('analytics.result')}</ThemedText>
                  <ThemedText style={styles.analysisText}>
                    {item.value !== null && item.value !== undefined
                      ? `${item.value} ${item.unit || ""} ${(item.ref_low !== null && item.ref_high !== null) ? t('analytics.ref_range', { low: item.ref_low, high: item.ref_high }) : ""}`
                      : (item.value_as_string || t('analytics.no_numeric_result'))}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          {/* Possible Risks Section */}
          {analysisData?.warnings && analysisData.warnings.length > 0 && (
            <View style={styles.risksCard}>
              <View style={styles.risksHeader}>
                <View style={styles.warningIcon}>
                  <Ionicons
                    name="warning"
                    size={20}
                    color={Colors.light.warning}
                  />
                </View>
                <ThemedText style={styles.risksTitle}>
                  {t('analytics.possible_risks')}
                </ThemedText>
              </View>

              {analysisData.warnings.map((warning: { title: string, description: string }, index: number) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <ThemedText style={[styles.risksText, { fontWeight: '700', marginBottom: 4 }]}>
                    • {warning.title}
                  </ThemedText>
                  <ThemedText style={[styles.risksText, { paddingLeft: 16 }]}>
                    {warning.description}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewDetailedRecommendations}
            activeOpacity={0.8}
          >
            <IconSymbol name="doc.fill" size={20} color={Colors.light.white} />
            <ThemedText style={styles.actionButtonText}>
              {t('analytics.view_recommendations')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>



      {/* Chat Action Button Section (Replaces Download PDF) */}
      <View style={styles.downloadSection}>
        <TouchableOpacity
          style={[styles.downloadButton, { flexDirection: 'row', gap: 8 }]}
          onPress={() => {
            // Ensure the session is active before navigating
            // The useEffect should have handled it, but let's be safe
            if (analysisData) {
              useChatStore.getState().createSessionFromAnalysis(analysisData, uniqueAnalysisId);
              router.push("/(tabs)/chat");
            } else {
              console.warn("Analysis data not ready for chat");
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubbles-outline" size={24} color={Colors.light.brandBlue} />
          <ThemedText style={styles.downloadButtonText}>
            {t('analytics.chat_assistant')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView >
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
    marginBottom: 24,
    paddingTop: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.textGray,
    textAlign: "center",
  },
  overviewCard: {
    backgroundColor: Colors.light.friendlyGreenBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.friendlyGreenBorder,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  overviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  overviewIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.white,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.textGray,
  },
  overviewText: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.light.textGray,
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.textGray,
    marginBottom: 16,
  },
  medicalCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 16, // Back to 16 for softer look
    padding: 16,
    marginBottom: 20, // Increased to 20 to be very visible
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.lightGray,
  },
  medicalCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    width: '100%', // Ensure full width
  },
  medicalCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.textGray,
    flex: 1, // Take available space
    flexShrink: 1, // FORCE shrink
    marginRight: 8,
  },
  priorityPill: {
    backgroundColor: Colors.light.warningBg,
    borderColor: Colors.light.warningBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    minWidth: 60, // Ensure it doesn't collapse
    alignItems: 'center',
    flexShrink: 0, // DO NOT SHRINK
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.warning,
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.light.textGray,
    lineHeight: 22,
  },
  recommendationsSection: {
    backgroundColor: Colors.light.friendlyGreenBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.friendlyGreenBorder,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 8,
  },
  recommendationsText: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.light.textGray,
    lineHeight: 22,
  },
  risksCard: {
    backgroundColor: Colors.light.warningBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.warningBorder,
  },
  risksHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningIcon: {
    marginRight: 12,
  },
  risksTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.textGray,
  },
  risksText: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.light.textGray,
    lineHeight: 24,
    marginBottom: 16,
  },
  riskItems: {
    gap: 12,
  },
  riskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riskItemLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.textGray,
  },
  riskItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.warning,
  },
  actionButton: {
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
    marginBottom: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
    marginLeft: 8,
  },
  downloadSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderGray,
  },
  downloadButton: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },
});
