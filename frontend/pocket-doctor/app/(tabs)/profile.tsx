import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile, updateUserProfile, UserProfile as ApiUserProfile } from "@/src/services/user";
import { useAuthStore } from "@/src/store/authStore";

interface UserProfile {
  id: number;
  user_auth_id: string;
  nombre?: string;
  apellido?: string;
  email: string;
  fecha_nacimiento?: string;
  sexo?: string;
  ubicacion?: string;
  fecha_registro: string;
  estado: boolean;
  es_admin?: boolean;
  altura_cm?: number;
  peso_kg?: number;
  tipo_sangre?: string;
  alergias?: string[];
  condiciones_medicas?: string[];
}

const INITIAL_PROFILE: UserProfile = {
  id: 0,
  user_auth_id: "",
  nombre: "Ethan",
  apellido: "Peña Sosa",
  email: "Ethan@gmail.com",
  fecha_registro: "",
  estado: true,
  peso_kg: undefined,
  alergias: [],
  condiciones_medicas: [],
};

export default function ProfileScreen() {
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  const { session, userProfile } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (userProfile) {
        setProfile(userProfile);
        setIsLoading(false);
      } else if (session?.access_token) {
        try {
          const fetchedProfile = await getUserProfile(session.access_token);
          setProfile(fetchedProfile);
        } catch (error) {
          console.error('Failed to load profile:', error);
          Alert.alert('Error', 'No se pudo cargar el perfil');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userProfile, session]);

  const handleSaveChanges = async () => {
    if (!session?.access_token) {
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare update data - only send the fields defined in UserProfileUpdate schema
      const updateData = {
        peso_kg: profile.peso_kg,
        alergias: profile.alergias,
        condiciones_medicas: profile.condiciones_medicas,
      };

      const updatedProfile = await updateUserProfile(session.access_token, updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const updateProfile = (field: keyof UserProfile, value: string | number | string[] | undefined) => {
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.brandBlue} />
          <ThemedText style={styles.loadingText}>Cargando perfil...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

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
            {profile.nombre || 'Nombre'} {profile.apellido || 'Apellido'}
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
                style={styles.textInputDisabled}
                value={profile.nombre || ''}
                onChangeText={text => updateProfile("nombre", text)}
                editable={false}
                placeholder="Nombres"
                placeholderTextColor={Colors.light.placeholderGray}
              />
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Apellidos</ThemedText>
              <TextInput
                style={styles.textInputDisabled}
                value={profile.apellido || ''}
                onChangeText={text => updateProfile("apellido", text)}
                editable={false}
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
              style={styles.textInputDisabled}
              value={profile.email}
              onChangeText={text => updateProfile("email", text)}
              editable={false}
              placeholder="Correo electrónico"
              placeholderTextColor={Colors.light.placeholderGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
 {/* Birth Date Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Fecha de Nacimiento</ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInputDisabled}
              value={profile.fecha_nacimiento || ''}
              onChangeText={text => updateProfile("fecha_nacimiento", text)}
              editable={false}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.light.placeholderGray}
            />
          </View>
        </View>
        
        {/* Medical Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Información Médica</ThemedText>

          {/* Height Section */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Altura (cm)</ThemedText>
            <TextInput
              style={styles.textInputDisabled}
              value={profile.altura_cm?.toString() || ''}
              onChangeText={text => updateProfile("altura_cm", text ? parseFloat(text) : undefined)}
              editable={false}
              placeholder="Altura en cm"
              placeholderTextColor={Colors.light.placeholderGray}
              keyboardType="numeric"
            />
          </View>

          {/* Weight Section */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Peso (kg)</ThemedText>
            <TextInput
              style={styles.textInput}
              value={profile.peso_kg?.toString() || ''}
              onChangeText={text => updateProfile("peso_kg", text ? parseFloat(text) : undefined)}
              editable={isEditing}
              placeholder="Peso en kg"
              placeholderTextColor={Colors.light.placeholderGray}
              keyboardType="numeric"
            />
          </View>

          {/* Allergies Section */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Alérgias</ThemedText>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              value={profile.alergias?.join(', ') || ''}
              onChangeText={text => updateProfile("alergias", text ? text.split(',').map(a => a.trim()) : [])}
              editable={isEditing}
              placeholder="Separadas por coma"
              placeholderTextColor={Colors.light.placeholderGray}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Medical Conditions Section */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Condiciones Médicas</ThemedText>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              value={profile.condiciones_medicas?.join(', ') || ''}
              onChangeText={text => updateProfile("condiciones_medicas", text ? text.split(',').map(c => c.trim()) : [])}
              editable={isEditing}
              placeholder="Separadas por coma"
              placeholderTextColor={Colors.light.placeholderGray}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

       

        {/* Save Changes Button */}
        {isSaving ? (
          <View style={styles.saveButton}>
            <ActivityIndicator color={Colors.light.white} />
            <ThemedText style={styles.saveButtonText}>Guardando...</ThemedText>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.saveButtonText}>Guardar Cambios</ThemedText>
          </TouchableOpacity>
        )}

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
  textInputDisabled: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.placeholderGray,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.brandBlue,
  },
});
