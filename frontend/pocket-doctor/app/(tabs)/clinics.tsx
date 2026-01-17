import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/src/store/authStore";
import { getCentros, Centro, getEspecialistasCentro, EspecialistaCentro, searchSpecialists } from "@/src/services/clinics";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ClinicsMap } from "@/components/ClinicsMap";

// Clinic interface imported from component to ensure compatibility
import { Clinic } from "@/components/ClinicsMap";
import { useTranslation } from "react-i18next";

interface MedicalData {
  id: string;
  name: string;
  value: string;
  normalRange: string;
  status: "normal" | "elevated" | "low";
}

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medicalHistory: MedicalData[];
}

const MOCK_USER_PROFILE: UserProfile = {
  name: "Ethan",
  age: 28,
  gender: "Masculino",
  bloodType: "O+",
  allergies: ["Penicilina", "Polen"],
  conditions: ["Hipertensión leve"],
  medicalHistory: [
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
  ],
};

const mapCentroToClinic = (centro: Centro): Clinic => ({
  id: centro.id.toString(),
  name: centro.nombre,
  fullName: centro.nombre,
  address: [centro.direccion, centro.ciudad, centro.provincia].filter(Boolean).join(', '),
  specialties: [],
  image: '',
  mapCode: centro.ubicacion_geografica || '',
  rating: 0,
  phone: centro.telefono || '',
  website: '',
});

// Generate recommended specialties based on user's medical data
const getRecommendedSpecialties = (userProfile: UserProfile): string[] => {
  const recommendations: string[] = [];

  // Check for elevated cholesterol
  const elevatedCholesterol = userProfile.medicalHistory.find(
    data =>
      data.name.toLowerCase().includes("colesterol") &&
      data.status === "elevated"
  );

  if (elevatedCholesterol) {
    recommendations.push("Cardiología", "Endocrinología", "Nutrición");
  }

  // Check for hypertension
  if (userProfile.conditions.includes("Hipertensión leve")) {
    recommendations.push("Cardiología");
  }

  // Check for allergies
  if (userProfile.allergies.length > 0) {
    recommendations.push("Alergología");
  }

  // Remove duplicates and return
  return [...new Set(recommendations)];
};

export default function ClinicsScreen() {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );
  const tintColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');

  const { session } = useAuthStore();

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // selectedClinic state removed
  // specialists state removed (fetched in detail screen now)
  const [searchedSpecialists, setSearchedSpecialists] = useState<EspecialistaCentro[]>([]);
  const [errorState, setErrorState] = useState<'timeout' | 'error' | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');


  const loadData = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setErrorState(null);

    try {
      // 20 Seconds Timeout Promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 20000)
      );

      const fetchPromise = getCentros(session.access_token);

      // Race: Fetch vs Timeout
      const centros = await Promise.race([fetchPromise, timeoutPromise]) as Centro[];

      const mappedClinics = centros.map(mapCentroToClinic);
      setClinics(mappedClinics);
    } catch (error: any) {
      console.error('Failed to fetch clinics:', error);
      if (error.message === "TIMEOUT") {
        setErrorState('timeout');
      } else {
        setErrorState('error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session]);

  // Removed useEffect for fetching specialists for selectedClinic

  // Effect customizado para búsqueda en tiempo real de especialistas
  useEffect(() => {
    const doSearch = async () => {
      if (!session?.access_token || searchQuery.length < 2) {
        setSearchedSpecialists([]);
        return;
      }
      try {
        const results = await searchSpecialists(searchQuery, session.access_token);
        setSearchedSpecialists(results);
      } catch (error) {
        console.error("Error searching specialists:", error);
      }
    };

    const timeoutId = setTimeout(doSearch, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [searchQuery, session]);

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleClinicPress = (clinic: Clinic) => {
    // Navigate to detail screen
    router.push(`/clinic/${clinic.id}`);
  };

  // handleBackToList removed
  // handleOpenMap removed (handled in detail screen)

  const renderClinicCard = (clinic: Clinic) => (
    <TouchableOpacity
      key={clinic.id}
      style={styles.clinicCard}
      onPress={() => handleClinicPress(clinic)}
      activeOpacity={0.7}
    >
      <View style={styles.clinicIcon}>
        <Ionicons
          name="heart-outline"
          size={20}
          color={Colors.light.brandBlue}
        />
      </View>
      <View style={styles.clinicInfo}>
        <ThemedText style={styles.clinicName}>{clinic.name}</ThemedText>
        <ThemedText style={styles.clinicAddress}>{clinic.address}</ThemedText>
      </View>
      <View style={styles.clinicThumbnail}>
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons
            name="business-outline"
            size={24}
            color={Colors.light.placeholderGray}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  // renderClinicDetail removed

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.pageTitle}>{t('clinics.title')} {t('clinics.title_specialists')}</ThemedText>
        </View>
      </View>

      {!errorState ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search-outline"
                size={20}
                color={Colors.light.placeholderGray}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={t('clinics.search_placeholder')}
                placeholderTextColor={Colors.light.placeholderGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.light.gray} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Toggle View Mode */}
          <View style={styles.viewToggleContainer}>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
                onPress={() => setViewMode('list')}
                activeOpacity={0.8}
              >
                <Ionicons name="list" size={18} color={viewMode === 'list' ? Colors.light.white : Colors.light.gray} />
                <ThemedText style={[styles.toggleButtonText, viewMode === 'list' && styles.toggleButtonTextActive]}>
                  {t('clinics.view_list')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
                onPress={() => setViewMode('map')}
                activeOpacity={0.8}
              >
                <Ionicons name="map" size={18} color={viewMode === 'map' ? Colors.light.white : Colors.light.gray} />
                <ThemedText style={[styles.toggleButtonText, viewMode === 'map' && styles.toggleButtonTextActive]}>
                  {t('clinics.view_map')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {viewMode === 'map' ? (
            <View style={{ flex: 1, height: '100%' }}>
              <ClinicsMap clinics={filteredClinics} onClinicPress={handleClinicPress} />
            </View>
          ) : (
            <View style={styles.clinicsList}>
              {/* Sección de Especialistas Encontrados */}
              {searchQuery.length > 0 && searchedSpecialists.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600', color: Colors.light.brandBlue, marginBottom: 12, marginLeft: 4 }}>
                    {t('clinics.found_specialists')} ({searchedSpecialists.length})
                  </ThemedText>
                  {searchedSpecialists.map((spec) => (
                    <View key={spec.especialista_id} style={[styles.clinicCard, { flexDirection: 'column', alignItems: 'flex-start', padding: 12 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, width: '100%' }}>
                        <View style={[styles.clinicIcon, { backgroundColor: Colors.light.lightBlue, width: 32, height: 32, borderRadius: 16 }]}>
                          <Ionicons name="person" size={16} color={Colors.light.white} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <ThemedText style={[styles.clinicName, { fontSize: 14, marginBottom: 0 }]}>{spec.nombre} {spec.apellido || ''}</ThemedText>
                          {spec.especialidad && spec.especialidad.length > 0 && (
                            <ThemedText style={{ fontSize: 12, color: Colors.light.gray }}>{spec.especialidad.join(", ")}</ThemedText>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Sección de Clínicas */}
              {(searchQuery.length === 0 || filteredClinics.length > 0) && (
                <View>
                  {searchQuery.length > 0 && (
                    <ThemedText style={{ fontSize: 16, fontWeight: '600', color: Colors.light.brandBlue, marginBottom: 12, marginLeft: 4 }}>
                      {t('clinics.clinics')}
                    </ThemedText>
                  )}
                  {filteredClinics.map(renderClinicCard)}
                </View>
              )}

              {/* Empty State */}
              {searchQuery.length > 0 && filteredClinics.length === 0 && searchedSpecialists.length === 0 && (
                <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.6 }}>
                  <Ionicons name="search" size={48} color={Colors.light.gray} />
                  <ThemedText style={{ marginTop: 12, color: Colors.light.gray }}>{t('clinics.no_results')}</ThemedText>
                </View>
              )}

            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons
            name={errorState === 'timeout' ? "time-outline" : "cloud-offline-outline"}
            size={64}
            color={Colors.light.gray}
          />
          <ThemedText style={styles.errorTitle}>
            {errorState === 'timeout'
              ? t('clinics.error_timeout_title')
              : t('clinics.error_connection_title')}
          </ThemedText>
          <ThemedText style={styles.errorMessage}>
            {errorState === 'timeout'
              ? t('clinics.error_timeout_message')
              : t('clinics.error_connection_message')}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <ThemedText style={styles.retryButtonText}>{t('clinics.retry')}</ThemedText>
            <Ionicons name="refresh" size={18} color={Colors.light.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  titleContainer: {
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },


  content: {
    backgroundColor: Colors.light.lightGray,
    paddingTop: 16,
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12, // Increased touch area
    gap: 12,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.textGray,
    padding: 0, // Reset default padding
  },

  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filtersContent: {
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 0,
  },
  filterChip: {
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
    height: 28,
    minWidth: 120,
  },
  filterChipActive: {
    backgroundColor: Colors.light.brandBlue,
    borderColor: Colors.light.brandBlue,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.light.gray,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
    lineHeight: 14,
  },
  filterChipTextActive: {
    color: Colors.light.white,
  },

  clinicsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    // gap: 12 removed in favor of card margin for better compatibility
  },

  clinicCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // Explicit spacing
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: Colors.light.gray,
  },
  clinicThumbnail: {
    width: 60,
    height: 40,
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // Error View Styles
  viewToggleContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 4,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.brandBlue,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.gray,
  },
  toggleButtonTextActive: {
    color: Colors.light.white,
  },

  // Error View Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.light.lightGray,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textGray,
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.light.gray,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.brandBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: Colors.light.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
