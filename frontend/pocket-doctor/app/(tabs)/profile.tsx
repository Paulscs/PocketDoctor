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
  Modal,
  FlatList,
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
import { UserAvatar } from "@/components/ui/UserAvatar";

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

  const { session, userProfile, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<'alergias' | 'condiciones_medicas' | null>(null);
  const [tempItems, setTempItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

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

  const openItemModal = (field: 'alergias' | 'condiciones_medicas') => {
    setEditingField(field);
    setTempItems(profile[field] || []);
    setNewItem('');
    setModalVisible(true);
  };

  const addItem = () => {
    if (newItem.trim()) {
      setTempItems([...tempItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setTempItems(tempItems.filter((_, i) => i !== index));
  };

  const saveItems = () => {
    if (editingField) {
      updateProfile(editingField, tempItems);
    }
    setModalVisible(false);
    setEditingField(null);
  };

  const cancelItems = () => {
    setModalVisible(false);
    setEditingField(null);
  };

  const updateProfile = (field: keyof UserProfile, value: string | number | string[] | undefined) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePress = () => {
    // Already on profile tab, no navigation needed
    console.log("Already on profile tab");
  };

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "No se pudo cerrar sesión");
    }
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
          <UserAvatar />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              {profile.nombre ? (
                <ThemedText style={styles.avatarText}>{profile.nombre[0]}</ThemedText>
              ) : (
                <Ionicons name="person" size={40} color={Colors.light.placeholderGray} />
              )}
            </View>
            <TouchableOpacity
              style={styles.editPictureButton}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={14} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.fullName}>
            {profile.nombre || 'Nombre'} {profile.apellido || 'Apellido'}
          </ThemedText>
          <ThemedText style={styles.emailText}>{profile.email}</ThemedText>
        </View>


        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Información Personal</ThemedText>
            <TouchableOpacity onPress={handleEditProfile} style={styles.cardHeaderAction}>
              <ThemedText style={styles.cardHeaderActionText}>Editar</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Nombres</ThemedText>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profile.nombre || ''}
                onChangeText={text => updateProfile("nombre", text)}
                editable={isEditing}
                placeholder="Nombres"
              />
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Apellidos</ThemedText>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profile.apellido || ''}
                onChangeText={text => updateProfile("apellido", text)}
                editable={isEditing}
                placeholder="Apellidos"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Fecha de Nacimiento</ThemedText>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputReadonly]}
              value={profile.fecha_nacimiento || ''}
              onChangeText={text => updateProfile("fecha_nacimiento", text)}
              editable={isEditing}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        {/* Medical Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Información Médica</ThemedText>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Altura (cm)</ThemedText>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profile.altura_cm?.toString() || ''}
                onChangeText={text => updateProfile("altura_cm", text ? parseFloat(text) : undefined)}
                editable={isEditing}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Peso (kg)</ThemedText>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profile.peso_kg?.toString() || ''}
                onChangeText={text => updateProfile("peso_kg", text ? parseFloat(text) : undefined)}
                editable={isEditing}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Allergies */}
          <View style={styles.divider} />
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>Alérgias</ThemedText>
            {isEditing && (
              <TouchableOpacity onPress={() => openItemModal('alergias')}>
                <Ionicons name="add-circle" size={24} color={Colors.light.brandBlue} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.chipContainer}>
            {profile.alergias && profile.alergias.length > 0 ? (
              profile.alergias.map((alergia, index) => (
                <View key={index} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{alergia}</ThemedText>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => {
                        const newAlergias = profile.alergias?.filter((_, i) => i !== index) || [];
                        updateProfile('alergias', newAlergias);
                      }}
                      style={styles.chipRemove}
                    >
                      <Ionicons name="close-circle" size={16} color={Colors.light.textGray} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <ThemedText style={styles.emptyText}>No hay alergias registradas</ThemedText>
            )}
          </View>

          {/* Conditions */}
          <View style={styles.divider} />
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>Condiciones Médicas</ThemedText>
            {isEditing && (
              <TouchableOpacity onPress={() => openItemModal('condiciones_medicas')}>
                <Ionicons name="add-circle" size={24} color={Colors.light.brandBlue} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.chipContainer}>
            {profile.condiciones_medicas && profile.condiciones_medicas.length > 0 ? (
              profile.condiciones_medicas.map((condicion, index) => (
                <View key={index} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{condicion}</ThemedText>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => {
                        const newCondiciones = profile.condiciones_medicas?.filter((_, i) => i !== index) || [];
                        updateProfile('condiciones_medicas', newCondiciones);
                      }}
                      style={styles.chipRemove}
                    >
                      <Ionicons name="close-circle" size={16} color={Colors.light.textGray} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <ThemedText style={styles.emptyText}>No hay condiciones registradas</ThemedText>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <ThemedText style={styles.saveButtonText}>Guardar Cambios</ThemedText>
            )}
          </TouchableOpacity>
        )}

        {/* Links Section */}
        <View style={styles.linksContainer}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/help')}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="help-buoy" size={22} color={Colors.light.brandBlue} />
            </View>
            <ThemedText style={styles.linkText}>Centro de Ayuda</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.placeholderGray} />
          </TouchableOpacity>

          <View style={styles.linkDivider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={handleLogout}
          >
            <View style={[styles.linkIcon, { backgroundColor: '#ffe5e5' }]}>
              <Ionicons name="log-out" size={22} color={Colors.light.error} />
            </View>
            <ThemedText style={[styles.linkText, { color: Colors.light.error }]}>Cerrar Sesión</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for editing allergies/medical conditions */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelItems}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {editingField === 'alergias' ? 'Editar Alérgias' : 'Editar Condiciones Médicas'}
            </ThemedText>

            <FlatList
              style={styles.itemList}
              data={tempItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.itemRow}>
                  <ThemedText style={styles.itemText}>{item}</ThemedText>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.light.error} />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <ThemedText style={styles.placeholderText}>
                  {editingField === 'alergias' ? 'No hay alergias agregadas' : 'No hay condiciones médicas agregadas'}
                </ThemedText>
              }
            />

            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={newItem}
                onChangeText={setNewItem}
                placeholder={editingField === 'alergias' ? 'Nueva alergia...' : 'Nueva condición médica...'}
                placeholderTextColor={Colors.light.placeholderGray}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addItem}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={Colors.light.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelItems}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButtonModal]}
                onPress={saveItems}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.saveButtonTextModal}>Guardar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140, // Height to cover header and part of profile pic
    backgroundColor: Colors.light.brandBlue,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    // Removed border
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
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  profilePictureContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profilePicture: {
    width: 100, // Larger
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.light.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.light.brandBlue,
  },
  editPictureButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.brandBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.light.white,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.black, // Changed to black for contrast below header
    textAlign: "center",
    marginTop: 8,
  },
  emailText: {
    fontSize: 14,
    color: Colors.light.textGray,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.black,
  },
  cardHeaderAction: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cardHeaderActionText: {
    color: Colors.light.brandBlue,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16, // Spacing between rows
  },
  inputContainer: {
    flex: 1,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.light.textGray,
    marginBottom: 6,
    opacity: 0.8,
  },
  textInput: {
    backgroundColor: Colors.light.lightGray, // Lighter background
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.black,
    // Removed border
  },
  textInputReadonly: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 16,
    color: Colors.light.black,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderGray,
    opacity: 0.5,
    marginVertical: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.light.brandBlue + '15', // Transparent blue
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    color: Colors.light.brandBlue,
    fontWeight: '500',
  },
  chipRemove: {
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.placeholderGray,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: Colors.light.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.white,
  },
  linksContainer: {
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    padding: 8, // container padding
    marginBottom: 40,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.brandBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.black,
  },
  linkDivider: {
    height: 1,
    backgroundColor: Colors.light.borderGray,
    marginLeft: 68, // Offset icon
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
  editButton: {
    padding: 4,
  },
  addButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    borderStyle: 'dashed',
  },
  addButtonTextInline: {
    fontSize: 14,
    color: Colors.light.brandBlue,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.light.placeholderGray,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.brandBlue,
    marginBottom: 16,
    textAlign: 'center',
  },
  itemList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    color: Colors.light.textGray,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addItemContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: Colors.light.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.textGray,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
  },
  addButton: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textGray,
  },
  saveButtonModal: {
    backgroundColor: Colors.light.brandBlue,
  },
  saveButtonTextModal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  helpButton: {
    backgroundColor: Colors.light.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  helpButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpButtonText: {
    fontSize: 16,
    color: Colors.light.textGray,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
