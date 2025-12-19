import React, { useState, useCallback, useMemo } from "react";
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
  Alert
} from "react-native";
import * as Linking from "expo-linking";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import CheckRow from "../components/ui/CheckRow";
import { router } from "expo-router";
import { TermsConditionsModal } from "@/components/TermsConditionsModal";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import DropDownPicker, {
  ItemType as DDItem,
} from "react-native-dropdown-picker";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/src/store";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/src/lib/supabase";
import { makeRedirectUri } from "expo-auth-session"; // 👈 solo esto de auth-session

WebBrowser.maybeCompleteAuthSession(); // ayuda a cerrar el navegador al volver
const scheme = "pocketdoctor"; // mismo scheme que tienes en app.json


type Item = { label: string; value: string };

interface ThemeColors {
  brandBlue: string;
  muted: string;
  error: string;
  lightGray: string;
  borderGray: string;
  textGray: string;
  placeholderGray: string;
  white: string;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.lightGray },
    scrollContent: { padding: 24, paddingTop: 20, paddingBottom: 40 },
    logoContainer: { alignItems: "center", marginBottom: 16, marginTop: 10 },
    logo: { width: 80, height: 80 },
    header: { alignItems: "center", marginVertical: 12 },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.brandBlue,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
      paddingHorizontal: 12,
    },
    form: { marginTop: 6 },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.brandBlue,
      marginBottom: 4,
      marginTop: 16,
    },
    requiredStar: { color: colors.error },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.borderGray,
      paddingVertical: 8,
      marginBottom: 8,
    },
    textInput: {
      flex: 1,
      fontSize: 14,
      color: colors.textGray,
      paddingVertical: 4,
      backgroundColor: "transparent",
    },
    ddInput: {
      borderWidth: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderGray,
      backgroundColor: "transparent",
      minHeight: 44,
    },
    ddMenu: {
      borderWidth: 1,
      borderColor: colors.borderGray,
      backgroundColor: colors.white,
    },
    fieldError: { borderBottomColor: colors.error },
    fieldErrorBottom: { borderBottomColor: colors.error, borderBottomWidth: 1 },
    fieldErrorBox: { borderColor: colors.error },
    err: { color: colors.error, fontSize: 12, marginTop: 4 },
    strengthContainer: { marginTop: 8, marginBottom: 6 },
    strengthBarContainer: { flexDirection: 'row', height: 6, gap: 6, marginTop: 6 },
    strengthSegment: { flex: 1, borderRadius: 3, backgroundColor: '#E6E8EB' },
    strengthText: { fontSize: 12, marginTop: 6, color: colors.textGray },
    policyText: { fontSize: 12, color: colors.muted, marginTop: 6, marginBottom: 8 },
    eyeBtn: { padding: 6, marginLeft: 8 },
    registerButton: {
      backgroundColor: colors.borderGray,
      borderRadius: 8,
      paddingVertical: 12,
      marginTop: 20,
      marginBottom: 16,
      alignItems: "center",
    },
    registerButtonActive: { backgroundColor: colors.brandBlue },
    registerButtonText: {
      color: colors.muted,
      fontSize: 16,
      fontWeight: "600",
    },
    registerButtonTextActive: { color: colors.white },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderGray },
    orText: { color: colors.muted, fontSize: 13, marginHorizontal: 16 },
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
    signInText: { color: colors.muted, fontSize: 13 },
    signInLink: {
      color: colors.brandBlue,
      fontWeight: "600",
      fontSize: 13,
      textDecorationLine: "underline",
    },
    sectionHeader: { marginTop: 24, marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.brandBlue },
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
      borderColor: colors.borderGray,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      backgroundColor: colors.white,
    },
    checkboxSelected: {
      backgroundColor: colors.brandBlue,
      borderColor: colors.brandBlue,
    },
    checkboxLabel: {
      fontSize: 15,
      color: colors.textGray,
      fontWeight: "500",
      flex: 1,
    },
    datePickerButton: { backgroundColor: "#F8FAFC" },
    placeholderText: { color: colors.placeholderGray },
  });

function Label({
  children,
  required,
  styles,
}: {
  children: React.ReactNode;
  required?: boolean;
  styles: ReturnType<typeof createStyles>;
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
  styles,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  items: { label: string; value: string }[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  zIndex: number;
  invalid?: boolean;
  required?: boolean;
  styles: ReturnType<typeof createStyles>;
}) {
  const [ddItems, setDdItems] = useState(items);

  return (
    <View style={{ zIndex, position: 'relative' }}>
      <Label required={required} styles={styles}>
        {label}
      </Label>

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

        // 👇 Estas dos líneas son las que arreglan el problema
        zIndex={zIndex}
        zIndexInverse={zIndex}
        multiple={false}
        closeAfterSelecting={true}
        autoScroll={true}
        dropDownDirection="AUTO"
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

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [openBlood, setOpenBlood] = useState(false);
  const [openGenderDD, setOpenGenderDD] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  // Global state
  const { register, isLoading, error, clearError } = useAuthStore();

  // Theme colors
  const brandBlue = useThemeColor(
    { light: Colors.light.brandBlue, dark: Colors.dark.brandBlue },
    "brandBlue"
  );
  const muted = useThemeColor(
    { light: Colors.light.muted, dark: Colors.dark.muted },
    "muted"
  );
  const errorColor = useThemeColor(
    { light: Colors.light.error, dark: Colors.dark.error },
    "error"
  );
  const lightGray = useThemeColor(
    { light: Colors.light.lightGray, dark: Colors.dark.lightGray },
    "lightGray"
  );
  const borderGray = useThemeColor(
    { light: Colors.light.borderGray, dark: Colors.dark.borderGray },
    "borderGray"
  );
  const textGray = useThemeColor(
    { light: Colors.light.textGray, dark: Colors.dark.textGray },
    "textGray"
  );
  const placeholderGray = useThemeColor(
    { light: Colors.light.placeholderGray, dark: Colors.dark.placeholderGray },
    "placeholderGray"
  );
  const white = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.white },
    "white"
  );

  const styles = useMemo(
    () =>
      createStyles({
        brandBlue,
        muted,
        error: errorColor,
        lightGray,
        borderGray,
        textGray,
        placeholderGray,
        white,
      }),
    [
      brandBlue,
      muted,
      errorColor,
      lightGray,
      borderGray,
      textGray,
      placeholderGray,
      white,
    ]
  );
  const handleGoogleSignUp = useCallback(async () => {
    try {
      const redirectTo = makeRedirectUri({
        scheme,
        path: "auth/callback",
      });

      // 1) Pedimos URL de login a Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        console.error(error);
        Alert.alert(
          "Error",
          error?.message ?? "No se pudo iniciar sesión con Google"
        );
        return;
      }

      // 2) Abrimos el navegador / pestaña del sistema
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (res.type === "success") {
        // 3) Obtener sesión y usuario de Supabase
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error(sessionError);
          Alert.alert("Error", "No se pudo obtener la sesión de Supabase");
          return;
        }

        const session = sessionData.session;
        if (!session) {
          Alert.alert(
            "Error",
            "No se encontró una sesión activa después del login con Google."
          );
          return;
        }

        const user = session.user;

        console.log("USER:", JSON.stringify(user, null, 2));
        console.log("USER METADATA:", JSON.stringify(user.user_metadata, null, 2));

        // --- Fetch backend profile and populate store ---
        if (session.access_token) {
          try {
            const { getUserProfile } = await import("@/src/services/user");
            const profile = await getUserProfile(session.access_token);
            // set store directly so the app has the profile available
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { useAuthStore } = require("@/src/store");
            useAuthStore.setState({ user: session.user, session, userProfile: profile });
          } catch (err) {
            console.warn("Error fetching profile after Google OAuth:", err);
          }
        }
        // ---- AQUÍ SOLO EXTRAEMOS DATOS BÁSICOS ----
        const email = user.email ?? "";
        const fullName =
          (user.user_metadata.full_name as string) ||
          (user.user_metadata.name as string) ||
          "";
        const givenName = user.user_metadata.given_name as string | undefined;
        const familyName = user.user_metadata.family_name as string | undefined;
        const avatarUrl = user.user_metadata.avatar_url as string | undefined;

        // 4) Upsert mínimo en tu tabla usuarios
        const { error: upsertError } = await supabase
          .from("usuarios") // 👈 ajusta si tu tabla se llama distinto
          .upsert(
            {
              auth_id: user.id,              // FK a auth.users.id
              email,
              nombre: givenName || fullName, // nombre de pila o completo
              apellido: familyName || null,
              avatar_url: avatarUrl ?? null, // solo si existe la columna
              // completed_profile: false,   // si creas este campo
            },
            {
              onConflict: "auth_id", // que no duplique si ya existe
            }
          );

        if (upsertError) {
          console.warn("Error al sincronizar perfil básico:", upsertError);
          // No bloqueamos la sesión; puedes mostrar solo un aviso si quieres.
        }

        // 5) Navegar dentro de la app
        router.push("/(tabs)/home");
      } else if (res.type === "cancel") {
        console.log("Login con Google cancelado por el usuario");
      } else {
        console.log("Resultado OAuth inesperado:", res);
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Error",
        "Ocurrió un problema al iniciar sesión con Google. Inténtalo de nuevo."
      );
    }
  }, [router]);


  const requiredStr = (s: string) => s.trim().length > 0;
  const isValidEmail = (e: string) =>
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i.test(
      e.trim()
    );
  const passwordMeetsPolicy = (p: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(p);

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    // normalize to 0..4
    return Math.min(4, score);
  }, [password]);

  const strengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { text: "Muy débil", color: "#E74C3C" };
      case 2:
        return { text: "Débil", color: "#F39C12" };
      case 3:
        return { text: "Regular", color: "#F1C40F" };
      case 4:
      default:
        return { text: "Fuerte", color: "#27AE60" };
    }
  }, [passwordStrength]);

  const formValid =
    requiredStr(firstName) &&
    requiredStr(lastName) &&
    requiredStr(email) &&
    isValidEmail(email) &&
    requiredStr(password) &&
    passwordMeetsPolicy(password) &&
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

  const toggleAllergy = useCallback(
    (allergy: string) => {
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
    },
    [selectedAllergies]
  );

  const toggleCondition = useCallback(
    (condition: string) => {
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
    },
    [selectedConditions]
  );

  const onRegister = async () => {
    setSubmitted(true);

    // Basic client-side validations with user-friendly alerts
    if (!isValidEmail(email)) {
      Alert.alert("Correo inválido", "Introduzca un correo electrónico válido.");
      return;
    }

    // collect missing required fields to show a helpful alert
    const missing: string[] = [];
    if (!requiredStr(firstName)) missing.push("Nombres");
    if (!requiredStr(lastName)) missing.push("Apellidos");
    if (!requiredStr(email)) missing.push("Correo electrónico");
    if (!requiredStr(password)) missing.push("Contraseña");
    if (!requiredStr(confirmPassword)) missing.push("Confirmar contraseña");
    if (!requiredStr(height)) missing.push("Altura");
    if (!requiredStr(weight)) missing.push("Peso");
    if (!requiredStr(bloodType)) missing.push("Tipo de sangre");
    if (!requiredStr(gender)) missing.push("Género");
    if (!dateOfBirth) missing.push("Fecha de nacimiento");
    if (!accepted) missing.push("Aceptar términos");

    if (missing.length > 0) {
      Alert.alert(
        "Campos faltantes",
        `Por favor complete los siguientes campos: ${missing.join(", ")}`
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Contraseñas no coinciden", "Revise que ambas contraseñas sean iguales.");
      return;
    }

    if (!passwordMeetsPolicy(password)) {
      Alert.alert(
        "Contraseña débil",
        "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y un carácter especial."
      );
      return;
    }

    // Check if email already registered in `usuarios` table
    try {
      clearError();

      const { data: existsData, error: existsError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (existsError) {
        console.warn("Error checking existing email:", existsError);
        // continue — we don't block registration if check fails, fallback to register
      } else if (existsData && Array.isArray(existsData) && existsData.length > 0) {
        Alert.alert(
          "Correo ya registrado",
          "El correo ya está en uso. Intente iniciar sesión o recuperar su contraseña."
        );
        return;
      }

      // proceed to register
      await register({
        email,
        password,
        nombre: firstName,
        apellido: lastName,
        fecha_nacimiento: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        sexo: gender,
        estatura: height ? parseInt(height) : undefined,
        peso: weight ? parseInt(weight) : undefined,
        tipo_sangre: bloodType,
        alergias: selectedAllergies,
        condiciones_medicas: selectedConditions,
      });
      router.push("/(tabs)/home");
    } catch (err) {
      // Error is handled by the store
      console.error(err);
    }
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
              <Label required styles={styles}>
                Nombres
              </Label>
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
                  placeholderTextColor={placeholderGray}
                  autoCapitalize="words"
                />
              </View>
              {submitted && !requiredStr(firstName) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required styles={styles}>
                Apellidos
              </Label>
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
                  placeholderTextColor={placeholderGray}
                  autoCapitalize="words"
                />
              </View>
              {submitted && !requiredStr(lastName) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required styles={styles}>
                Correo electrónico
              </Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && (!requiredStr(email) || (requiredStr(email) && !isValidEmail(email))) && styles.fieldError,
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
                  placeholderTextColor={placeholderGray}
                />
              </View>
              {!submitted && email.length > 0 && !isValidEmail(email) && (
                <Text style={styles.err}>Correo inválido</Text>
              )}

              {submitted && !requiredStr(email) && (
                <Text style={styles.err}>Requerido</Text>
              )}
              {submitted && requiredStr(email) && !isValidEmail(email) && (
                <Text style={styles.err}>Correo inválido</Text>
              )}

              <Label required styles={styles}>
                Contraseña
              </Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && (!requiredStr(password) || !passwordMeetsPolicy(password)) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Introduzca su contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secure}
                  placeholderTextColor={placeholderGray}
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
              <Text style={styles.policyText}>
                Mínimo de 8 caracteres: mayúscula, minúscula, número, carácter especial
              </Text>
              {submitted && !requiredStr(password) && (
                <Text style={styles.err}>Requerido</Text>
              )}
              {submitted && requiredStr(password) && !passwordMeetsPolicy(password) && (
                <Text style={styles.err}>La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y un carácter especial</Text>
              )}

              {/* Password strength meter */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarContainer}>
                    {[0, 1, 2, 3].map(i => (
                      <View
                        key={i}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor:
                              i <= (passwordStrength - 1)
                                ? strengthLabel.color
                                : '#E6E8EB',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthText, { color: strengthLabel.color }]}>
                    {strengthLabel.text}
                  </Text>
                </View>
              )}

              <Label required styles={styles}>
                Confirmar contraseña
              </Label>
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
                  placeholderTextColor={placeholderGray}
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
              {/* real-time mismatch alert */}
              {!submitted && confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.err}>Las contraseñas no coinciden</Text>
              )}
              {submitted && !requiredStr(confirmPassword) && (
                <Text style={styles.err}>Requerido</Text>
              )}
              {submitted && requiredStr(confirmPassword) && password !== confirmPassword && (
                <Text style={styles.err}>Las contraseñas no coinciden</Text>
              )}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Información de Salud</Text>
              </View>

              <Label required styles={styles}>
                Altura (cm)
              </Label>
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
                  placeholderTextColor={placeholderGray}
                />
              </View>
              {submitted && !requiredStr(height) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required styles={styles}>
                Peso (kg)
              </Label>
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
                  placeholderTextColor={placeholderGray}
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
                styles={styles}
              />
              {submitted && !requiredStr(bloodType) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label required styles={styles}>
                Fecha de nacimiento
              </Label>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  styles.datePickerButton,
                  submitted && !dateOfBirth && styles.fieldError,
                ]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.textInput, !dateOfBirth && styles.placeholderText]}
                >
                  {dateOfBirth ? formatDate(dateOfBirth) : "DD/MM/AAAA"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={brandBlue} />
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
                styles={styles}
              />
              {submitted && !requiredStr(gender) && (
                <Text style={styles.err}>Requerido</Text>
              )}

              <Label styles={styles}>Alergias (opcional)</Label>
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
                        <Ionicons name="checkmark" size={12} color="white" />
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
                    placeholderTextColor={placeholderGray}
                  />
                </View>
              )}

              <Label styles={styles}>Condiciones médicas (opcional)</Label>
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
                        <Ionicons name="checkmark" size={12} color="white" />
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
                    placeholderTextColor={placeholderGray}
                  />
                </View>
              )}

              <CheckRow
                checked={accepted}
                onToggle={() => setAccepted(!accepted)}
                text="Al registrarme, confirmo que he leído y acepto nuestra "
                linkText="Términos y Condiciones"
                onPressLink={() => setShowTermsModal(true)}
                afterLinkText=" y nuestra "
                privacyText="Política de Privacidad"
                onPressPrivacy={() => setShowPrivacyModal(true)}

              />
              {submitted && !accepted && (
                <Text style={styles.err}>Debe aceptar los términos</Text>
              )}

              {submitted && !formValid && (
                <Text style={styles.err}>Faltan campos requeridos. Por favor, complete todos los campos obligatorios.</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  formValid && styles.registerButtonActive,
                ]}
                onPress={onRegister}
                disabled={!formValid || isLoading}
              >
                <Text
                  style={[
                    styles.registerButtonText,
                    formValid && styles.registerButtonTextActive,
                  ]}
                >
                  {isLoading ? "Registrando..." : "Registrarme"}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>O regístrate con</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleSignUp}
                >
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

      <TermsConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </SafeAreaView>
  );
}

export default function RegisterScreen() {
  return <RegisterScreenInner />;
}
