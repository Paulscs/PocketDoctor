import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/src/store/authStore";
import { getCentros, Centro, getEspecialistasCentro, EspecialistaCentro } from "@/src/services/clinics";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface Clinic {
  id: string;
  name: string;
  fullName: string;
  address: string;
  specialties: string[];
  image: string;
  mapCode: string;
  rating: number;
  phone: string;
  website: string;
}

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
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  const { session } = useAuthStore();

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [specialists, setSpecialists] = useState<EspecialistaCentro[]>([]);


  useEffect(() => {
    const fetchClinics = async () => {
      if (!session?.access_token) return;
      setLoading(true);
      try {
        const centros = await getCentros(session.access_token);
        const mappedClinics = centros.map(mapCentroToClinic);
        setClinics(mappedClinics);
      } catch (error) {
        console.error('Failed to fetch clinics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, [session]);

  useEffect(() => {
    const fetchSpecialists = async () => {
      if (!selectedClinic || !session?.access_token) {
        setSpecialists([]);
        return;
      }
      try {
        const specs = await getEspecialistasCentro(selectedClinic.id, session.access_token);
        setSpecialists(specs);
      } catch (error) {
        console.error('Failed to fetch specialists:', error);
        setSpecialists([]);
      }
    };
    fetchSpecialists();
  }, [selectedClinic, session]);

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleClinicPress = (clinic: Clinic) => {
    setSelectedClinic(clinic);
  };

  const handleBackToList = () => {
    setSelectedClinic(null);
  };

  const handleOpenMap = (mapCode: string) => {
    if (!mapCode) return;
    const match = mapCode.match(/\(([^,]+),([^)]+)\)/);
    if (match) {
      const lat = match[1];
      const lng = match[2];
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

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

  const renderClinicDetail = (clinic: Clinic) => (
    <ScrollView
      style={styles.detailContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToList}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.light.brandBlue}
          />
          <ThemedText style={styles.backButtonText}>Volver</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.clinicImageContainer}>
        <View style={styles.clinicImagePlaceholder}>
          <Ionicons
            name="business-outline"
            size={48}
            color={Colors.light.placeholderGray}
          />
          <ThemedText style={styles.imagePlaceholderText}>
            {clinic.name}
          </ThemedText>
        </View>
      </View>

      <View style={styles.clinicDetailCard}>
        <View style={styles.clinicDetailHeader}>
          <View style={styles.clinicDetailIcon}>
            <Ionicons
              name="heart-outline"
              size={20}
              color={Colors.light.brandBlue}
            />
          </View>
          <View style={styles.clinicDetailInfo}>
            <ThemedText style={styles.clinicDetailName}>
              {clinic.fullName}
            </ThemedText>
            <ThemedText style={styles.clinicDetailShortName}>
              {clinic.name}
            </ThemedText>
            <ThemedText style={styles.clinicDetailAddress}>
              {clinic.address}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.mapButton} activeOpacity={0.7} onPress={() => handleOpenMap(clinic.mapCode)}>
          <Ionicons
            name="location-outline"
            size={16}
            color={Colors.light.brandBlue}
          />
          <ThemedText style={styles.mapButtonText}>Ver ubicación</ThemedText>
        </TouchableOpacity>

        <View style={styles.clinicDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={Colors.light.gray} />
            <ThemedText style={styles.detailText}>{clinic.phone}</ThemedText>
          </View>
        </View>

        <View style={styles.specialistsSection}>
          <ThemedText style={styles.specialistsTitle}>
            Especialistas:
          </ThemedText>
          <View style={styles.specialistsList}>
            {specialists.map((specialist) => (
              <View key={specialist.especialista_id} style={styles.specialistCard}>
                <View style={styles.specialistHeader}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.light.brandBlue}
                  />
                  <View style={styles.specialistInfo}>
                    <ThemedText style={styles.specialistName}>
                      {specialist.nombre} {specialist.apellido || ''}
                    </ThemedText>
                    {specialist.contacto && (
                      <ThemedText style={styles.specialistContact}>
                        {specialist.contacto}
                      </ThemedText>
                    )}
                  </View>
                </View>
                {specialist.especialidad && specialist.especialidad.length > 0 && (
                  <View style={styles.specialistSpecialties}>
                    {specialist.especialidad.map((esp, index) => (
                      <View key={index} style={styles.specialtyTag}>
                        <ThemedText style={styles.specialtyText}>
                          {esp}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
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
          <View style={styles.titleContainer}>
            <ThemedText style={styles.pageTitle}>Clínicas y</ThemedText>
            <ThemedText style={styles.pageTitle}>Especialistas</ThemedText>
          </View>
          <View style={styles.profileIcon}>
            <UserAvatar size={32} />
          </View>
        </View>
      </View>

      {!selectedClinic ? (
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <TouchableOpacity style={styles.searchBar} activeOpacity={0.7}>
              <Ionicons
                name="business-outline"
                size={20}
                color={Colors.light.placeholderGray}
              />
              <ThemedText style={styles.searchPlaceholder}>
                Clínicas y Especialistas
              </ThemedText>
            </TouchableOpacity>
          </View>


          <View style={styles.clinicsList}>
            {filteredClinics.map(renderClinicCard)}
          </View>
        </View>
      ) : (
        renderClinicDetail(selectedClinic)
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
  titleContainer: {
    alignItems: "center",
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
  profileIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.white,
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
    paddingVertical: 12,
    gap: 12,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.placeholderGray,
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
    gap: 12,
  },

  clinicCard: {
    backgroundColor: Colors.light.white,
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

  detailContainer: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
  },

  backButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },

  clinicImageContainer: {
    height: 200,
    backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.gray,
  },

  clinicDetailCard: {
    backgroundColor: Colors.light.white,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicDetailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  clinicDetailIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clinicDetailInfo: {
    flex: 1,
  },
  clinicDetailName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 4,
    lineHeight: 24,
  },
  clinicDetailShortName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.brandBlue,
    marginBottom: 4,
  },
  clinicDetailAddress: {
    fontSize: 14,
    color: Colors.light.gray,
  },

  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.lightGray,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
    gap: 6,
  },
  mapButtonText: {
    fontSize: 12,
    color: Colors.light.brandBlue,
    fontWeight: "500",
  },

  clinicDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.light.gray,
  },

  specialtiesSection: {
    marginTop: 8,
  },
  specialtiesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 12,
  },
  specialtiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialistsSection: {
    marginTop: 8,
  },
  specialistsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
    marginBottom: 12,
  },
  specialistsList: {
    gap: 12,
  },
  specialistCard: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  specialistHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  specialistInfo: {
    flex: 1,
    marginLeft: 8,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textGray,
  },
  specialistContact: {
    fontSize: 14,
    color: Colors.light.gray,
  },
  specialistSpecialties: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specialtyText: {
    fontSize: 12,
    color: Colors.light.white,
    fontWeight: "500",
  },
});
