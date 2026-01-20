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
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ListItem } from "@/components/ui/ListItem";
import { Card } from "@/components/ui/Card";
import { CustomLoader } from "@/components/ui/CustomLoader";

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
  nombre: "",
  apellido: "",
  email: "",
  fecha_registro: "",
  estado: true,
  peso_kg: undefined,
  alergias: [],
  condiciones_medicas: [],
};

export default function ProfileScreen() {
  const backgroundColor = useThemeColor(
    { light: Colors.light.lightGray, dark: Colors.dark.background },
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

  const handleLogout = async () => {
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
          <CustomLoader />
          <ThemedText style={styles.loadingText}>{t("profile.loading")}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={{ flex: 1 }}> {/* Wrapper to ensure relative positioning context if needed, though SafeAreaView handles flex:1 */}


        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.floatingEditBtn}
            onPress={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.light.brandBlue} />
            ) : (
              <ThemedText style={styles.editHeaderBtnText}>
                {isEditing ? t("common.save", "Done") : t("common.edit", "Edit")}
              </ThemedText>
            )}
          </TouchableOpacity>
          {/* Profile Card */}
          <View style={styles.profileHeaderCard}>
            <UserAvatar size={80} />
            <ThemedText style={styles.fullName}>
              {profile.nombre || t('profile.names')} {profile.apellido || t('profile.surnames')}
            </ThemedText>
            <ThemedText style={styles.emailText}>{profile.email}</ThemedText>
          </View>

          {/* Vital Stats Row */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard} variant="elevated">
              <ThemedText style={styles.statLabel}>{t('profile.height')}</ThemedText>
              {isEditing ? (
                <View style={styles.editStatRow}>
                  <TextInput
                    value={profile.altura_cm?.toString()}
                    onChangeText={t => updateProfile("altura_cm", t ? Number(t) : undefined)}
                    keyboardType="numeric"
                    style={styles.statInput}
                    placeholder="0"
                  />
                  <ThemedText style={styles.statUnit}>cm</ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.statValue}>{profile.altura_cm || '--'} <ThemedText style={styles.statUnit}>cm</ThemedText></ThemedText>
              )}
            </Card>
            <Card style={styles.statCard} variant="elevated">
              <ThemedText style={styles.statLabel}>{t('profile.weight')}</ThemedText>
              {isEditing ? (
                <View style={styles.editStatRow}>
                  <TextInput
                    value={profile.peso_kg?.toString()}
                    onChangeText={t => updateProfile("peso_kg", t ? Number(t) : undefined)}
                    keyboardType="numeric"
                    style={styles.statInput}
                    placeholder="0"
                  />
                  <ThemedText style={styles.statUnit}>kg</ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.statValue}>{profile.peso_kg || '--'} <ThemedText style={styles.statUnit}>kg</ThemedText></ThemedText>
              )}
            </Card>
          </View>

          {/* Personal Info */}
          <SectionHeader title={t("profile.personal_info")} />
          <Card variant="elevated" style={styles.sectionCard}>
            {isEditing ? (
              <View style={styles.formGroup}>
                <ThemedText style={styles.inputLabel}>{t("profile.names")}</ThemedText>
                <TextInput
                  style={styles.input}
                  value={profile.nombre}
                  onChangeText={t => updateProfile('nombre', t)}
                  placeholder={t("profile.names")}
                />
                <View style={styles.divider} />

                <ThemedText style={styles.inputLabel}>{t("profile.surnames")}</ThemedText>
                <TextInput
                  style={styles.input}
                  value={profile.apellido}
                  onChangeText={t => updateProfile('apellido', t)}
                  placeholder={t("profile.surnames")}
                />
                <View style={styles.divider} />

                <ThemedText style={styles.inputLabel}>{t("profile.birth_date")}</ThemedText>
                <TouchableOpacity onPress={showDatePicker} style={styles.dateInputBtn}>
                  <ThemedText style={profile.fecha_nacimiento ? styles.inputText : styles.placeholderText}>
                    {profile.fecha_nacimiento || "YYYY-MM-DD"}
                  </ThemedText>
                  <Ionicons name="calendar-outline" size={20} color={Colors.light.brandBlue} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ListItem
                  title={t("profile.names")}
                  subtitle={`${profile.nombre || ''} ${profile.apellido || ''}`}
                  leftIcon="person-outline"
                  showChevron={false}
                  style={styles.cleanListItem}
                />
                <View style={styles.separator} />
                <ListItem
                  title={t("profile.birth_date")}
                  subtitle={profile.fecha_nacimiento || t('common.not_set', 'Not Set')}
                  leftIcon="calendar-outline"
                  showChevron={false}
                  style={styles.cleanListItem}
                />
              </>
            )}
          </Card>

          {/* Medical History */}
          <SectionHeader title={t("profile.medical_info")} />
          <Card variant="elevated" style={styles.sectionCard}>
            <View style={styles.medicalSectionPart}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.light.lightGray }]}>
                  <Ionicons name="pulse-outline" size={20} color={Colors.light.brandBlue} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.medicalHeaderRow}>
                    <ThemedText style={styles.medicalLabel}>{t("profile.allergies")}</ThemedText>
                    {isEditing && (
                      <TouchableOpacity onPress={() => openItemModal('alergias')}>
                        <Ionicons name="add-circle" size={24} color={Colors.light.brandBlue} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.chipContainer}>
                    {profile.alergias && profile.alergias.length > 0 ? (
                      profile.alergias.map((item, idx) => (
                        <View key={idx} style={styles.chip}>
                          <ThemedText style={styles.chipText}>{item}</ThemedText>
                          {isEditing && (
                            <TouchableOpacity onPress={() => {
                              const newItems = profile.alergias?.filter((_, i) => i !== idx);
                              updateProfile('alergias', newItems);
                            }} style={styles.chipRemove}>
                              <Ionicons name="close" size={12} color={Colors.light.white} />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    ) : (
                      <ThemedText style={styles.emptyText}>{t("profile.no_allergies")}</ThemedText>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.medicalSectionPart}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.light.lightGray }]}>
                  <Ionicons name="medkit-outline" size={20} color={Colors.light.brandBlue} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.medicalHeaderRow}>
                    <ThemedText style={styles.medicalLabel}>{t("profile.medical_conditions")}</ThemedText>
                    {isEditing && (
                      <TouchableOpacity onPress={() => openItemModal('condiciones_medicas')}>
                        <Ionicons name="add-circle" size={24} color={Colors.light.brandBlue} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.chipContainer}>
                    {profile.condiciones_medicas && profile.condiciones_medicas.length > 0 ? (
                      profile.condiciones_medicas.map((item, idx) => (
                        <View key={idx} style={styles.chip}>
                          <ThemedText style={styles.chipText}>{item}</ThemedText>
                          {isEditing && (
                            <TouchableOpacity onPress={() => {
                              const newItems = profile.condiciones_medicas?.filter((_, i) => i !== idx);
                              updateProfile('condiciones_medicas', newItems);
                            }} style={styles.chipRemove}>
                              <Ionicons name="close" size={12} color={Colors.light.white} />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    ) : (
                      <ThemedText style={styles.emptyText}>{t("profile.no_conditions")}</ThemedText>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Preferences */}
          <SectionHeader title={t("profile.settings")} />
          <Card variant="elevated" style={styles.sectionCard}>
            <View style={{ padding: Spacing.sm }}>
              <LanguageSwitcher />
            </View>
          </Card>

          {/* Account Actions */}
          <SectionHeader title={t("profile.support")} />
          <ListItem
            title={t("profile.help_center")}
            leftIcon="help-buoy-outline"
            onPress={() => router.push('/help')}
            style={styles.menuItem}
          />
          <ListItem
            title={t("profile.logout")}
            leftIcon="log-out-outline"
            variant="danger"
            onPress={handleLogout}
            style={styles.menuItem}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Modal for adding items */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelItems}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {editingField === 'alergias' ? t("profile.edit_allergies") : t("profile.edit_conditions")}
            </ThemedText>

            <FlatList
              data={tempItems}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.modalItemRow}>
                  <ThemedText>{item}</ThemedText>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.modalList}
            />

            <View style={styles.addItemRow}>
              <TextInput
                style={styles.addItemInput}
                value={newItem}
                onChangeText={setNewItem}
                placeholder={t("common.add_new", "Add new...")}
              />
              <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={cancelItems} style={styles.modalCancelBtn}>
                <ThemedText style={{ color: Colors.light.gray }}>{t("common.cancel")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveItems} style={styles.modalSaveBtn}>
                <ThemedText style={{ color: 'white', fontWeight: '600' }}>{t("common.save")}</ThemedText>
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
  floatingEditBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.lg,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.9)', // Slight background for visibility
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editHeaderBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  profileHeaderCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.brandBlue,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: Colors.light.gray,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.brandBlue,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.placeholderGray,
  },
  editStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInput: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.brandBlue,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
    textAlign: 'center',
    width: 60,
    padding: 0,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
    padding: 0, // Reset default padding to handle list items better
  },
  cleanListItem: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  menuItem: {
    marginBottom: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.borderGray,
    marginLeft: Spacing.lg,
  },
  formGroup: {
    padding: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.light.gray,
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderGray,
    marginVertical: 8,
  },
  dateInputBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  inputText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.light.placeholderGray,
  },
  medicalSectionPart: {
    padding: Spacing.md,
  },
  medicalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2, // Match ListItem subtitle spacing (marginTop: 2)
  },
  medicalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    
    // color: Colors.light.textGray, // Removed to match ListItem title (inherits default)
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.light.friendlyBlueBg,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    color: Colors.light.brandBlue,
    fontSize: 13, // Match ListItem subtitle fontSize
    fontWeight: '500',
  },
  chipRemove: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.light.placeholderGray,
    fontStyle: 'italic',
    fontSize: 13, // Match ListItem subtitle fontSize
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalList: {
    marginBottom: Spacing.md,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
  },
  addItemRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  addItemBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.light.brandBlue,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.lightGray,
  },
  modalSaveBtn: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.brandBlue,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
});
