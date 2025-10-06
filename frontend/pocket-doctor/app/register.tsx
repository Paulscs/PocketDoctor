import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
} from "react-native";
import * as Linking from "expo-linking";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import CheckRow from "../components/ui/CheckRow";
import { router } from "expo-router";
import DropDownPicker, {
  ItemType as DDItem,
} from "react-native-dropdown-picker";

const BRAND_BLUE = "#002D73";
const MUTED = "#52607A";

type Item = { label: string; value: string };

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Text style={styles.inputLabel}>
      {children}
      {required && <Text style={styles.requiredStar}> *</Text>}
    </Text>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  items,
  open,
  setOpen,
  zIndex,
  invalid,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  items: Item[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  zIndex: number;
  invalid?: boolean;
  required?: boolean;
}) {
  const [ddItems, setDdItems] = useState<DDItem<string>[]>(items);

  return (
    <View style={{ zIndex }}>
      <Label required={required}>{label}</Label>
      <DropDownPicker
        open={open}
        value={value}
        items={ddItems}
        setOpen={setOpen}
        setItems={setDdItems}
        setValue={cb => onChange((cb(value) as string) ?? "")}
        placeholder={placeholder}
        style={[styles.ddInput, invalid && styles.fieldErrorBottom]}
        dropDownContainerStyle={[
          styles.ddMenu,
          invalid && styles.fieldErrorBox,
        ]}
        listMode="SCROLLVIEW"
      />
    </View>
  );
}

function RegisterScreenInner() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [bloodType, setBloodType] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [otherAllergies, setOtherAllergies] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherConditions, setOtherConditions] = useState("");

  const [accepted, setAccepted] = useState(false);
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [openBlood, setOpenBlood] = useState(false);
  const [openGenderDD, setOpenGenderDD] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const requiredStr = (s: string) => s.trim().length > 0;
  const formValid =
    requiredStr(firstName) &&
    requiredStr(lastName) &&
    requiredStr(email) &&
    requiredStr(password) &&
    requiredStr(confirmPassword) &&
    requiredStr(height) &&
    requiredStr(weight) &&
    requiredStr(bloodType) &&
    requiredStr(gender) &&
    !!dateOfBirth &&
    password === confirmPassword &&
    accepted;

  const bloodTypeItems: Item[] = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ];

  const genderItems: Item[] = [
    { label: "Masculino", value: "Masculino" },
    { label: "Femenino", value: "Femenino" },
  ];

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const toggleAllergy = (allergy: string) => {
    if (allergy === "Otro") {
      if (selectedAllergies.includes("Otro")) {
        setSelectedAllergies(selectedAllergies.filter(a => a !== "Otro"));
        setOtherAllergies("");
      } else setSelectedAllergies([...selectedAllergies, "Otro"]);
    } else {
      setSelectedAllergies(prev =>
        prev.includes(allergy)
          ? prev.filter(a => a !== allergy)
          : [...prev, allergy]
      );
    }
  };

  const toggleCondition = (condition: string) => {
    if (condition === "Otro") {
      if (selectedConditions.includes("Otro")) {
        setSelectedConditions(selectedConditions.filter(c => c !== "Otro"));
        setOtherConditions("");
      } else setSelectedConditions([...selectedConditions, "Otro"]);
    } else {
      setSelectedConditions(prev =>
        prev.includes(condition)
          ? prev.filter(c => c !== condition)
          : [...prev, condition]
      );
    }
  };

  const onRegister = () => {
    setSubmitted(true);
    if (!formValid) return;
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/logoBlue.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.header}>
              <ThemedText style={styles.title}>Crear Cuenta</ThemedText>
              <ThemedText style={styles.subtitle}>
                Unos pocos pasos y estará listo para comenzar.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <Label required>Nombres</Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(firstName) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Introduzca sus nombres"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
              {submitted && !requiredStr(firstName) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required>Apellidos</Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(lastName) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Introduzca sus apellidos"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
              {submitted && !requiredStr(lastName) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required>Correo electrónico</Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(email) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  inputMode="email"
                  placeholderTextColor="#999"
                />
              </View>
              {submitted && !requiredStr(email) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required>Contraseña</Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(password) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Introduzca su contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secure}
                  placeholderTextColor="#999"
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setSecure(!secure)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={secure ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {submitted && !requiredStr(password) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required>Confirmar contraseña</Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted &&
                    (!requiredStr(confirmPassword) ||
                      password !== confirmPassword) &&
                    styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirme su contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={secureConfirm}
                  placeholderTextColor="#999"
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setSecureConfirm(!secureConfirm)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={secureConfirm ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {submitted && !requiredStr(confirmPassword) && (
                <Text style={styles.err}>Requerido</Text>
              )}
              {submitted &&
                requiredStr(confirmPassword) &&
                password !== confirmPassword && (
                  <Text style={styles.err}>Las contraseñas no coinciden</Text>
                )}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Información de Salud</Text>
              </View>

              <Label required>Altura (cm)</Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(height) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: 175"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              {submitted && !requiredStr(height) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required>Peso (kg)</Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(weight) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: 70"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              {submitted && !requiredStr(weight) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <SelectField
                label="Tipo de sangre"
                value={bloodType}
                onChange={setBloodType}
                placeholder="Seleccione su tipo de sangre"
                items={bloodTypeItems}
                open={openBlood}
                setOpen={o => {
                  setOpenBlood(o);
                  if (o) setOpenGenderDD(false);
                }}
                zIndex={2000}
                invalid={submitted && !requiredStr(bloodType)}
                required
              />
              {submitted && !requiredStr(bloodType) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required>Fecha de nacimiento</Label>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  styles.datePickerButton,
                  submitted && !dateOfBirth && styles.fieldError,
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={[
                    styles.textInput,
                    !dateOfBirth && styles.placeholderText,
                  ]}
                >
                  {dateOfBirth ? formatDate(dateOfBirth) : "DD/MM/AAAA"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={BRAND_BLUE}
                />
              </TouchableOpacity>
              {submitted && !dateOfBirth && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <SelectField
                label="Género"
                value={gender}
                onChange={setGender}
                placeholder="Seleccione su género"
                items={genderItems}
                open={openGenderDD}
                setOpen={o => {
                  setOpenGenderDD(o);
                  if (o) setOpenBlood(false);
                }}
                zIndex={1000}
                invalid={submitted && !requiredStr(gender)}
                required
              />
              {submitted && !requiredStr(gender) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label>Alergias (opcional)</Label>
              <View style={styles.checkboxContainer}>
                {[
                  "Penicilina",
                  "Mariscos",
                  "Polen",
                  "Lácteos",
                  "Nueces",
                  "Huevos",
                  "Otro",
                ].map(allergy => (
                  <TouchableOpacity
                    key={allergy}
                    style={styles.checkboxRow}
                    onPress={() => toggleAllergy(allergy)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedAllergies.includes(allergy) &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {selectedAllergies.includes(allergy) && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{allergy}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedAllergies.includes("Otro") && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Especifique otras alergias"
                    value={otherAllergies}
                    onChangeText={setOtherAllergies}
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              <Label>Condiciones médicas (opcional)</Label>
              <View style={styles.checkboxContainer}>
                {[
                  "Diabetes",
                  "Hipertensión",
                  "Asma",
                  "Artritis",
                  "Enfermedad cardíaca",
                  "Otro",
                ].map(condition => (
                  <TouchableOpacity
                    key={condition}
                    style={styles.checkboxRow}
                    onPress={() => toggleCondition(condition)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedConditions.includes(condition) &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {selectedConditions.includes(condition) && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{condition}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedConditions.includes("Otro") && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Especifique otras condiciones médicas"
                    value={otherConditions}
                    onChangeText={setOtherConditions}
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              <CheckRow
                checked={accepted}
                onToggle={() => setAccepted(!accepted)}
                text="Al registrarme, confirmo que he leído y acepto nuestra "
                linkText="Términos y Condiciones"
                onPressLink={() => Linking.openURL("https://example.com/terms")}
                afterLinkText=" y nuestra "
                privacyText="Política de Privacidad"
                onPressPrivacy={() =>
                  Linking.openURL("https://example.com/privacy")
                }
              />
              {submitted && !accepted && (
                <Text style={styles.err}>Debe aceptar los términos</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  formValid && styles.registerButtonActive,
                ]}
                onPress={onRegister}
                disabled={!formValid}
              >
                <Text
                  style={[
                    styles.registerButtonText,
                    formValid && styles.registerButtonTextActive,
                  ]}
                >
                  Registrarme
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>O regístrate con</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("@/assets/images/google.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("@/assets/images/microsoft.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require("@/assets/images/apple.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.signInRow}>
                <Text style={styles.signInText}>¿Ya tienes una cuenta? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.signInLink}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={date => {
          setDateOfBirth(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        date={dateOfBirth || new Date(2000, 0, 1)}
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        display={Platform.OS === "ios" ? "inline" : "default"}
      />
    </SafeAreaView>
  );
}

export default function RegisterScreen() {
  return <RegisterScreenInner />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 24, paddingTop: 20, paddingBottom: 40 },
  logoContainer: { alignItems: "center", marginBottom: 16, marginTop: 10 },
  logo: { width: 80, height: 80 },
  header: { alignItems: "center", marginVertical: 12 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: BRAND_BLUE,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  form: { marginTop: 6 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_BLUE,
    marginBottom: 4,
    marginTop: 16,
  },
  requiredStar: { color: "#DC2626" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#2D3748",
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  ddInput: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "transparent",
    minHeight: 44,
  },
  ddMenu: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  fieldError: { borderBottomColor: "#DC2626" },
  fieldErrorBottom: { borderBottomColor: "#DC2626", borderBottomWidth: 1 },
  fieldErrorBox: { borderColor: "#DC2626" },
  err: { color: "#DC2626", fontSize: 12, marginTop: 4 },
  eyeBtn: { padding: 6, marginLeft: 8 },
  registerButton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  registerButtonActive: { backgroundColor: BRAND_BLUE },
  registerButtonText: { color: "#9AA4B2", fontSize: 16, fontWeight: "600" },
  registerButtonTextActive: { color: "#FFFFFF" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  orText: { color: "#9AA4B2", fontSize: 13, marginHorizontal: 16 },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    marginBottom: 24,
  },
  socialButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: { width: 24, height: 24 },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: { color: "#6B7280", fontSize: 13 },
  signInLink: {
    color: BRAND_BLUE,
    fontWeight: "600",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  sectionHeader: { marginTop: 24, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: BRAND_BLUE },
  checkboxContainer: {
    marginBottom: 12,
    backgroundColor: "#FAFBFC",
    borderRadius: 12,
    padding: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: { backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE },
  checkboxLabel: { fontSize: 15, color: "#374151", fontWeight: "500", flex: 1 },
  datePickerButton: { backgroundColor: "#F8FAFC" },
  placeholderText: { color: "#94A3B8" },
});
