import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
}

const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  MEDICAL_BLUE: "#1E40AF",
  HEALTH_GREEN: "#059669",
  SUCCESS: "#34C759",
  WARNING: "#FF9500",
  ERROR: "#FF3B30",
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

const INITIAL_PROFILE: UserProfile = {
  firstName: "Ethan",
  lastName: "Peña Sosa",
  email: "Ethan@gmail.com",
  phone: "829-555-0103",
};

export default function ProfileScreen() {
  const backgroundColor = useThemeColor(
    { light: COLORS.WHITE, dark: "#000000" },
    "background"
  );

  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveChanges = () => {
    console.log("Saving profile changes:", profile);
    setIsEditing(false);
    // TODO: Implement actual save functionality
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePress = () => {
    // Already on profile tab, no navigation needed
    console.log("Already on profile tab");
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // TODO: Implement actual logout functionality
    router.push("/login");
  };

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
          <ThemedText style={styles.pageTitle}>Perfil</ThemedText>
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
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              <Ionicons name="person" size={40} color={COLORS.GRAY_400} />
            </View>
            <TouchableOpacity
              style={styles.editPictureButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={12} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.fullName}>
            {profile.firstName} {profile.lastName}
          </ThemedText>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Información Personal
          </ThemedText>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Nombres</ThemedText>
              <TextInput
                style={styles.textInput}
                value={profile.firstName}
                onChangeText={text => updateProfile("firstName", text)}
                editable={isEditing}
                placeholder="Nombres"
                placeholderTextColor={COLORS.GRAY_400}
              />
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Apellidos</ThemedText>
              <TextInput
                style={styles.textInput}
                value={profile.lastName}
                onChangeText={text => updateProfile("lastName", text)}
                editable={isEditing}
                placeholder="Apellidos"
                placeholderTextColor={COLORS.GRAY_400}
              />
            </View>
          </View>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Correo Electrónico
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={profile.email}
              onChangeText={text => updateProfile("email", text)}
              editable={isEditing}
              placeholder="Correo electrónico"
              placeholderTextColor={COLORS.GRAY_400}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Phone Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Teléfono</ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={profile.phone}
              onChangeText={text => updateProfile("phone", text)}
              editable={isEditing}
              placeholder="Teléfono"
              placeholderTextColor={COLORS.GRAY_400}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChanges}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.saveButtonText}>Guardar Cambios</ThemedText>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={16} color={COLORS.ERROR} />
          <ThemedText style={styles.logoutButtonText}>Cerrar Sesión</ThemedText>
        </TouchableOpacity>
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
  profileIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profilePictureSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 32,
  },
  profilePictureContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.GRAY_100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.GRAY_200,
  },
  editPictureButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.BRAND_BLUE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  fullName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.GRAY_700,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.GRAY_800,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  logoutButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.ERROR,
  },
});
