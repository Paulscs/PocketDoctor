import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuthStore } from "@/src/store";
import { apiClient } from "@/src/utils/apiClient";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CustomLoader } from "@/components/ui/CustomLoader";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface MedicalResult {
  id: string;
  title: string;
  date: string;
  type: "blood" | "imaging" | "cardiac" | "other";
  status: "normal" | "elevated" | "low" | "critical";
  description: string;
  raw_data: any;
}

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

const getStatusText = (status: MedicalResult["status"], t: any) => {
  switch (status) {
    case "normal":
      return t('history.status.normal');
    case "elevated":
      return t('history.status.elevated');
    case "low":
      return t('history.status.low');
    case "critical":
      return t('history.status.critical');
    default:
      return t('history.status.pending');
  }
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor(
    { light: Colors.light.lightGray, dark: Colors.dark.background },
    "background"
  );

  const { session } = useAuthStore();
  const [results, setResults] = useState<MedicalResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Date Range State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);


  const filteredResults = useMemo(() => {
    if (!startDate && !endDate) return results;

    return results.filter(item => {
      // item.date is YYYY-MM-DD
      const itemDate = new Date(item.date);
      // Reset hours to compare dates only
      itemDate.setHours(0, 0, 0, 0);

      let matchesStart = true;
      let matchesEnd = true;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesStart = itemDate >= start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        matchesEnd = itemDate <= end;
      }

      return matchesStart && matchesEnd;
    });
  }, [results, startDate, endDate]);

  const showDatePicker = (type: 'start' | 'end') => {
    setActivePicker(type);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setActivePicker(null);
  };

  const handleConfirmDate = (date: Date) => {
    if (activePicker === 'start') {
      setStartDate(date);
      // Constructive logic: if end date exists and is before start date, maybe clear it or set it to start date?
      // For now let's just set it.
      if (endDate && date > endDate) {
        setEndDate(null); // Reset end date if invalid
      }
    } else if (activePicker === 'end') {
      setEndDate(date);
      if (startDate && date < startDate) {
        setStartDate(null); // Reset start date if invalid
      }
    }
    hideDatePicker();
  };

  const clearFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    if (!session?.access_token) return;

    try {
      if (!refreshing) setIsLoading(true);
      const response = await apiClient("ocr-local/history", {
        token: session.access_token,
      });

      if (!response.ok) throw new Error("Error fetching history");

      const data = await response.json();

      const mappedResults: MedicalResult[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.titulo || t('history.analysis'),
        date: item.created_at ? item.created_at.split("T")[0] : t('history.date_unknown'),
        type: item.tipo || "other",
        status: item.estado === "alert" ? "elevated" : "normal",
        description: item.resumen || t('history.no_summary'),
        raw_data: item.datos_completos
      }));

      // Sort by date descending (newest first)
      mappedResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setResults(mappedResults);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  const handleResultPress = (result: MedicalResult) => {
    if (result.raw_data) {
      setSubmittingId(result.id);
      // Give UI time to render loader
      setTimeout(() => {
        router.push({
          pathname: "/ai-analytics",
          params: { historyData: JSON.stringify(result.raw_data) }
        });
        // We don't clear submittingId immediately to keep loader while screen transitions
        // verify focus effect might clear it if needed
        setTimeout(() => setSubmittingId(null), 1000);
      }, 50);
    } else {
      console.warn("No raw data for this history item");
    }
  };

  const handleDeletePress = (id: string, e: any) => {
    e.stopPropagation(); // Prevent triggering item press
    Alert.alert(
      t('history.delete_title'),
      t('history.delete_confirmation'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              if (!session?.access_token) return;
              setResults(prev => prev.filter(item => item.id !== id));
              const res = await apiClient(`ocr-local/history/${id}`, {
                method: "DELETE",
                token: session.access_token
              });
              if (!res.ok) throw new Error("Failed to delete");
              // verify deletion?
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert(t('common.error'), t('history.delete_error'));
              fetchHistory();
            }
          }
        }
      ]
    );
  };



  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.headerActions}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{t('history.medical_history')}</ThemedText>
        </View>

        <View style={styles.filterRow}>
          {/* Start Date Chip */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              startDate && styles.filterChipActive
            ]}
            onPress={() => showDatePicker('start')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={startDate ? "calendar" : "calendar-outline"}
              size={16}
              color={startDate ? Colors.light.white : Colors.light.brandBlue}
            />
            <ThemedText style={[
              styles.filterChipText,
              startDate && styles.filterChipTextActive
            ]}>
              {startDate ? startDate.toLocaleDateString() : t('common.from')}
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={{ color: Colors.light.gray, fontSize: 16 }}>-</ThemedText>

          {/* End Date Chip */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              endDate && styles.filterChipActive
            ]}
            onPress={() => showDatePicker('end')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={endDate ? "calendar" : "calendar-outline"}
              size={16}
              color={endDate ? Colors.light.white : Colors.light.brandBlue}
            />
            <ThemedText style={[
              styles.filterChipText,
              endDate && styles.filterChipTextActive
            ]}>
              {endDate ? endDate.toLocaleDateString() : t('common.to')}
            </ThemedText>
          </TouchableOpacity>

          {(startDate || endDate) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilter}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={24} color={Colors.light.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        maximumDate={new Date()}
        date={
          activePicker === 'start'
            ? (startDate || new Date())
            : (endDate || new Date())
        }
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {!isLoading && (
        <>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="document-text-outline" size={48} color={Colors.light.placeholderGray} />
          </View>
          <ThemedText style={styles.emptyText}>
            {t('history.empty')}
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {t('history.empty_hint', 'Scan your first medical document to see it here.')}
          </ThemedText>
        </>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: MedicalResult }) => (
    <Card
      style={styles.cardResult}
      variant="elevated"
    >
      <TouchableOpacity
        onPress={() => handleResultPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={12} color={Colors.light.brandBlue} />
            <ThemedText style={styles.dateText}>{item.date}</ThemedText>
          </View>
          <TouchableOpacity onPress={(e) => handleDeletePress(item.id, e)} hitSlop={10}>
            <Ionicons name="trash-outline" size={18} color={Colors.light.placeholderGray} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.light.friendlyBlueBg }]}>
            <Ionicons
              name={getResultIcon(item.type) as keyof typeof Ionicons.glyphMap}
              size={24}
              color={Colors.light.brandBlue}
            />
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.resultTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.resultDescription} numberOfLines={2}>
              {item.description}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status, t)}
            </ThemedText>
          </View>
          <View style={styles.viewDetails}>
            {submittingId === item.id ? (
              <ActivityIndicator size="small" color={Colors.light.brandBlue} />
            ) : (
              <>
                <ThemedText style={styles.viewDetailsText}>{t('common.view', 'View Details')}</ThemedText>
                <Ionicons name="chevron-forward" size={14} color={Colors.light.brandBlue} />
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>


      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <CustomLoader />
          <ThemedText style={styles.loadingText}>{t('history.loading')}</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.brandBlue]}
              tintColor={Colors.light.brandBlue}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  listHeader: {
    marginBottom: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.brandBlue,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.placeholderGray,
    marginTop: 4,
  },
  cardResult: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.gray,
    fontWeight: '500',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 14,
    color: Colors.light.gray,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderGray,
    paddingTop: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.circle,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.brandBlue,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.light.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.gray,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.placeholderGray,
    textAlign: 'center',
  },

  headerActions: {
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.circle,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    gap: Spacing.xs,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: Colors.light.brandBlue,
    borderColor: Colors.light.brandBlue,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textGray,
  },
  filterChipTextActive: {
    color: Colors.light.white,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.white,
    marginLeft: 4,
  },
  clearButton: {
    padding: 4,
  },
});
