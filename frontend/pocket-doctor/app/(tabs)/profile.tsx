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
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
}

const INITIAL_PROFILE: UserProfile = {
  firstName: "Ethan",
  lastName: "Peña Sosa",
  email: "Ethan@gmail.com",
  phone: "829-555-0103",
};

export default function ProfileScreen() {
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
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
              <Ionicons
                name="person"
                size={40}
                color={Colors.light.placeholderGray}
              />
            </View>
            <TouchableOpacity
              style={styles.editPictureButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={12} color={Colors.light.white} />
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
                placeholderTextColor={Colors.light.placeholderGray}
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
                placeholderTextColor={Colors.light.placeholderGray}
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
              placeholderTextColor={Colors.light.placeholderGray}
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
              placeholderTextColor={Colors.light.placeholderGray}
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
          <Ionicons
            name="log-out-outline"
            size={16}
            color={Colors.light.error}
          />
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
    backgroundColor: Colors.light.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.borderGray,
  },
  editPictureButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.brandBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.white,
  },
  fullName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
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
    color: Colors.light.textGray,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.textGray,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 20,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
  logoutButton: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.light.error,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.error,
  },
});
