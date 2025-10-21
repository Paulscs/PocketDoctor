import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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

const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  MEDICAL_BLUE: "#1E40AF",
  HEALTH_GREEN: "#059669",
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
} as const;

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

const MOCK_CLINICS: Clinic[] = [
  {
    id: "1",
    name: "CEMDOE",
    fullName: "Centro Médico de Diabetes, Obesidad y Especialidades",
    address: "C. Clara Pardo, Santo Domingo",
    specialties: ["Cardiología", "Endocrinología", "Nutrición"],
    image: "cemdoe-building",
    mapCode: "F3Q3+9M Santo Domingo",
    rating: 4.8,
    phone: "+1 809-555-0123",
    website: "www.cemdoe.com",
  },
  {
    id: "2",
    name: "Hospital General",
    fullName: "Hospital General de la Plaza de la Salud",
    address: "Av. Independencia, Santo Domingo",
    specialties: ["Medicina General", "Cardiología", "Neurología"],
    image: "hospital-general",
    mapCode: "F3Q4+2M Santo Domingo",
    rating: 4.6,
    phone: "+1 809-555-0124",
    website: "www.hospitalgeneral.com",
  },
  {
    id: "3",
    name: "Clínica Abreu",
    fullName: "Clínica Abreu - Centro de Especialidades",
    address: "C. Winston Churchill, Santo Domingo",
    specialties: ["Cardiología", "Cirugía", "Oncología"],
    image: "clinica-abreu",
    mapCode: "F3Q5+5M Santo Domingo",
    rating: 4.7,
    phone: "+1 809-555-0125",
    website: "www.clinicaabreu.com",
  },
  {
    id: "4",
    name: "Centro Cardiológico",
    fullName: "Centro Cardiológico Dominicano",
    address: "Av. 27 de Febrero, Santo Domingo",
    specialties: ["Cardiología", "Cirugía Cardíaca"],
    image: "centro-cardio",
    mapCode: "F3Q6+8M Santo Domingo",
    rating: 4.9,
    phone: "+1 809-555-0126",
    website: "www.centrocardio.com",
  },
  {
    id: "5",
    name: "Instituto Endocrino",
    fullName: "Instituto de Endocrinología y Metabolismo",
    address: "C. Max Henríquez Ureña, Santo Domingo",
    specialties: ["Endocrinología", "Nutrición", "Diabetes"],
    image: "instituto-endocrino",
    mapCode: "F3Q7+1M Santo Domingo",
    rating: 4.7,
    phone: "+1 809-555-0127",
    website: "www.institutoendocrino.com",
  },
];

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
    { light: COLORS.WHITE, dark: "#000000" },
    "background"
  );

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [recommendedSpecialties, setRecommendedSpecialties] = useState<
    string[]
  >([]);

  useEffect(() => {
    // Generate recommendations based on user's medical profile
    const recommendations = getRecommendedSpecialties(MOCK_USER_PROFILE);
    setRecommendedSpecialties(recommendations);

    // Auto-select first recommended specialty if available
    if (recommendations.length > 0 && !selectedSpecialty) {
      setSelectedSpecialty(recommendations[0]);
    }
  }, [selectedSpecialty]);

  const filteredClinics = MOCK_CLINICS.filter(clinic => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      !selectedSpecialty || clinic.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  const handleClinicPress = (clinic: Clinic) => {
    setSelectedClinic(clinic);
  };

  const handleBackToList = () => {
    setSelectedClinic(null);
  };

  const renderClinicCard = (clinic: Clinic) => (
    <TouchableOpacity
      key={clinic.id}
      style={styles.clinicCard}
      onPress={() => handleClinicPress(clinic)}
      activeOpacity={0.7}
    >
      <View style={styles.clinicIcon}>
        <Ionicons name="heart-outline" size={20} color={COLORS.BRAND_BLUE} />
      </View>
      <View style={styles.clinicInfo}>
        <ThemedText style={styles.clinicName}>{clinic.name}</ThemedText>
        <ThemedText style={styles.clinicAddress}>{clinic.address}</ThemedText>
      </View>
      <View style={styles.clinicThumbnail}>
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="business-outline" size={24} color={COLORS.GRAY_400} />
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
          <Ionicons name="arrow-back" size={24} color={COLORS.BRAND_BLUE} />
          <ThemedText style={styles.backButtonText}>Volver</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.clinicImageContainer}>
        <View style={styles.clinicImagePlaceholder}>
          <Ionicons name="business-outline" size={48} color={COLORS.GRAY_400} />
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
              color={COLORS.BRAND_BLUE}
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

        <TouchableOpacity style={styles.mapButton} activeOpacity={0.7}>
          <Ionicons
            name="location-outline"
            size={16}
            color={COLORS.BRAND_BLUE}
          />
          <ThemedText style={styles.mapButtonText}>{clinic.mapCode}</ThemedText>
        </TouchableOpacity>

        <View style={styles.clinicDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="star-outline" size={16} color={COLORS.GRAY_600} />
            <ThemedText style={styles.detailText}>
              Calificación: {clinic.rating}/5.0
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={COLORS.GRAY_600} />
            <ThemedText style={styles.detailText}>{clinic.phone}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="globe-outline" size={16} color={COLORS.GRAY_600} />
            <ThemedText style={styles.detailText}>{clinic.website}</ThemedText>
          </View>
        </View>

        <View style={styles.specialtiesSection}>
          <ThemedText style={styles.specialtiesTitle}>
            Especialidades:
          </ThemedText>
          <View style={styles.specialtiesList}>
            {clinic.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <ThemedText style={styles.specialtyText}>
                  {specialty}
                </ThemedText>
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
            <TouchableOpacity
              style={styles.profileIconButton}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.profileIconText}>A</ThemedText>
            </TouchableOpacity>
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
                color={COLORS.GRAY_400}
              />
              <ThemedText style={styles.searchPlaceholder}>
                Clínicas y Especialistas
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            style={styles.filtersContainer}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {recommendedSpecialties.map(specialty => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.filterChip,
                  selectedSpecialty === specialty && styles.filterChipActive,
                ]}
                onPress={() =>
                  setSelectedSpecialty(
                    selectedSpecialty === specialty ? null : specialty
                  )
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    specialty === "Cardiología"
                      ? "heart-outline"
                      : specialty === "Endocrinología"
                        ? "medical-outline"
                        : specialty === "Nutrición"
                          ? "restaurant-outline"
                          : "medical-outline"
                  }
                  size={14}
                  color={
                    selectedSpecialty === specialty
                      ? COLORS.WHITE
                      : COLORS.BRAND_BLUE
                  }
                />
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedSpecialty === specialty &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {specialty}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

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
    borderBottomColor: COLORS.GRAY_200,
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
    color: COLORS.BRAND_BLUE,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
  },
  profileIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.BRAND_BLUE,
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
    color: COLORS.WHITE,
  },

  content: {
    backgroundColor: COLORS.GRAY_50,
    paddingTop: 16,
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: COLORS.GRAY_400,
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
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
    height: 28,
    minWidth: 120,
  },
  filterChipActive: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderColor: COLORS.BRAND_BLUE,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.GRAY_600,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
    lineHeight: 14,
  },
  filterChipTextActive: {
    color: COLORS.WHITE,
  },

  clinicsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },

  clinicCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.GRAY_100,
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
    color: COLORS.GRAY_800,
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: COLORS.GRAY_500,
  },
  clinicThumbnail: {
    width: 60,
    height: 40,
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.GRAY_50,
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
    color: COLORS.BRAND_BLUE,
  },

  clinicImageContainer: {
    height: 200,
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.GRAY_600,
  },

  clinicDetailCard: {
    backgroundColor: COLORS.WHITE,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
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
    backgroundColor: COLORS.GRAY_100,
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
    color: COLORS.GRAY_800,
    marginBottom: 4,
    lineHeight: 24,
  },
  clinicDetailShortName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.BRAND_BLUE,
    marginBottom: 4,
  },
  clinicDetailAddress: {
    fontSize: 14,
    color: COLORS.GRAY_500,
  },

  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.GRAY_100,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
    gap: 6,
  },
  mapButtonText: {
    fontSize: 12,
    color: COLORS.BRAND_BLUE,
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
    color: COLORS.GRAY_600,
  },

  specialtiesSection: {
    marginTop: 8,
  },
  specialtiesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY_800,
    marginBottom: 12,
  },
  specialtiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specialtyText: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: "500",
  },
});
