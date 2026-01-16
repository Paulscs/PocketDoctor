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
import DateTimePickerModal from "react-native-modal-datetime-picker";
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
import LanguageSwitcher from "@/src/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const { session, userProfile, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<'alergias' | 'condiciones_medicas' | null>(null);
  const [tempItems, setTempItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

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
          Alert.alert(t('common.error'), t('profile.error_load'));
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
      Alert.alert(t('common.error'), 'No hay sesión activa');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare update data - only send the fields defined in UserProfileUpdate schema
      const updateData = {
        peso_kg: profile.peso_kg,
        alergias: profile.alergias,
        condiciones_medicas: profile.condiciones_medicas,
        nombre: profile.nombre,
        apellido: profile.apellido,
        fecha_nacimiento: profile.fecha_nacimiento,
        altura_cm: profile.altura_cm,
      };

      const updatedProfile = await updateUserProfile(session.access_token, updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert(t('common.save'), t('profile.success_update'));
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert(t('common.error'), t('profile.error_update'));
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

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    updateProfile("fecha_nacimiento", formattedDate);
    hideDatePicker();
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
      Alert.alert(t("common.error"), t("profile.error_logout"));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.brandBlue} />
          <ThemedText style={styles.loadingText}>{t("profile.loading")}</ThemedText>
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
          <ThemedText style={styles.pageTitle}>{t("profile.title")}</ThemedText>
          <UserAvatar />
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
            {t("profile.personal_info")}
          </ThemedText>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>{t("profile.names")}</ThemedText>
              <TextInput
                style={isEditing ? styles.textInput : styles.textInputDisabled}
                value={profile.nombre || ''}
                onChangeText={text => updateProfile("nombre", text)}
                editable={isEditing}
                placeholder={t("profile.names")}
                placeholderTextColor={Colors.light.placeholderGray}
              />
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>{t("profile.surnames")}</ThemedText>
              <TextInput
                style={isEditing ? styles.textInput : styles.textInputDisabled}
                value={profile.apellido || ''}
                onChangeText={text => updateProfile("apellido", text)}
                editable={isEditing}
                placeholder={t("profile.surnames")}
                placeholderTextColor={Colors.light.placeholderGray}
              />
            </View>
          </View>
        </View>


        {/* Email Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t("profile.email")}
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInputDisabled}
              value={profile.email}
              onChangeText={text => updateProfile("email", text)}
              editable={false}
              placeholder={t("profile.email")}
              placeholderTextColor={Colors.light.placeholderGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Birth Date Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("profile.birth_date")}</ThemedText>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={isEditing ? styles.textInput : styles.textInputDisabled}
              onPress={() => isEditing && showDatePicker()}
              activeOpacity={isEditing ? 0.7 : 1}
            >
              <ThemedText style={{ color: profile.fecha_nacimiento ? Colors.light.textGray : Colors.light.placeholderGray, fontSize: 16 }}>
                {profile.fecha_nacimiento || "YYYY-MM-DD"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Medical Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("profile.medical_info")}</ThemedText>

          {/* Height Section */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>{t("profile.height")}</ThemedText>
            <TextInput
              style={isEditing ? styles.textInput : styles.textInputDisabled}
              value={profile.altura_cm?.toString() || ''}
              onChangeText={text => updateProfile("altura_cm", text ? parseFloat(text) : undefined)}
              editable={isEditing}
              placeholder={t("profile.height_placeholder")}
              placeholderTextColor={Colors.light.placeholderGray}
              keyboardType="numeric"
            />
          </View>

          {/* Weight Section */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>{t("profile.weight")}</ThemedText>
            <TextInput
              style={styles.textInput}
              value={profile.peso_kg?.toString() || ''}
              onChangeText={text => updateProfile("peso_kg", text ? parseFloat(text) : undefined)}
              editable={isEditing}
              placeholder={t("profile.weight_placeholder")}
              placeholderTextColor={Colors.light.placeholderGray}
              keyboardType="numeric"
            />
          </View>

          {/* Allergies Section */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.inputLabel}>{t("profile.allergies")}</ThemedText>
              {isEditing && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openItemModal('alergias')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={20} color={Colors.light.brandBlue} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.chipContainer}>
              {profile.alergias && profile.alergias.length > 0 ? (
                profile.alergias.map((alergia, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => isEditing && openItemModal('alergias')}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.chipText}>{alergia}</ThemedText>
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.chipRemove}
                        onPress={(e) => {
                          e.stopPropagation();
                          const newAlergias = profile.alergias?.filter((_, i) => i !== index) || [];
                          updateProfile('alergias', newAlergias);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close" size={14} color={Colors.light.error} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity
                  style={styles.addButtonInline}
                  onPress={() => isEditing && openItemModal('alergias')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={Colors.light.brandBlue} />
                  <ThemedText style={styles.addButtonTextInline}>
                    {isEditing ? t("profile.add_allergy") : t("profile.no_allergies")}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Medical Conditions Section */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.inputLabel}>{t("profile.medical_conditions")}</ThemedText>
              {isEditing && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openItemModal('condiciones_medicas')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={20} color={Colors.light.brandBlue} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.chipContainer}>
              {profile.condiciones_medicas && profile.condiciones_medicas.length > 0 ? (
                profile.condiciones_medicas.map((condicion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => isEditing && openItemModal('condiciones_medicas')}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.chipText}>{condicion}</ThemedText>
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.chipRemove}
                        onPress={(e) => {
                          e.stopPropagation();
                          const newCondiciones = profile.condiciones_medicas?.filter((_, i) => i !== index) || [];
                          updateProfile('condiciones_medicas', newCondiciones);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close" size={14} color={Colors.light.error} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity
                  style={styles.addButtonInline}
                  onPress={() => isEditing && openItemModal('condiciones_medicas')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={Colors.light.brandBlue} />
                  <ThemedText style={styles.addButtonTextInline}>
                    {isEditing ? t("profile.add_condition") : t("profile.no_conditions")}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>



        {/* Save Changes Button */}
        {isSaving ? (
          <View style={styles.saveButton}>
            <ActivityIndicator color={Colors.light.white} />
            <ThemedText style={styles.saveButtonText}>{t("profile.saving")}</ThemedText>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.saveButtonText}>{t("profile.save_changes")}</ThemedText>
          </TouchableOpacity>
        )}

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("profile.settings")}</ThemedText>
          <LanguageSwitcher />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t("profile.support")}</ThemedText>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => router.push('/help')}
            activeOpacity={0.7}
          >
            <View style={styles.helpButtonContent}>
              <Ionicons name="help-buoy-outline" size={24} color={Colors.light.brandBlue} />
              <ThemedText style={styles.helpButtonText}>{t("profile.help_center")}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.placeholderGray} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}{/* Logout Button */}
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
          <ThemedText style={styles.logoutButtonText}>{t("profile.logout")}</ThemedText>
        </TouchableOpacity>
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
              {editingField === 'alergias' ? t("profile.edit_allergies") : t("profile.edit_conditions")}
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
                  {editingField === 'alergias' ? t("profile.no_allergies") : t("profile.no_conditions")}
                </ThemedText>
              }
            />

            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={newItem}
                onChangeText={setNewItem}
                placeholder={editingField === 'alergias' ? t("profile.new_allergy") : t("profile.new_condition")}
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
                <ThemedText style={styles.cancelButtonText}>{t("common.cancel")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButtonModal]}
                onPress={saveItems}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.saveButtonTextModal}>{t("common.save")}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    padding: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    color: Colors.light.textGray,
  },
  chipRemove: {
    padding: 2,
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
});
