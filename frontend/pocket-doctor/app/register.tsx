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
import { useTranslation } from "react-i18next";
import CheckRow from "../components/ui/CheckRow";
import { router, useRouter } from "expo-router";
import { TermsConditionsModal } from "@/components/TermsConditionsModal";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import DropDownPicker, {
  ItemType as DDItem,
} from "react-native-dropdown-picker";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/src/store/authStore";
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


// Mapped items created inside component with hooks


function RegisterScreenInner() {
  const { t } = useTranslation();
  const router = useRouter();
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

  // --- MEMOIZED OPTIONS WITH TRANSLATIONS ---
  const bloodTypeItems = useMemo(() => [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ], []);

  const genderItems = useMemo(() => [
    { label: t('auth.register.options.gender.male'), value: "masculino" },
    { label: t('auth.register.options.gender.female'), value: "femenino" },
    { label: t('auth.register.options.gender.other'), value: "otro" },
  ], [t]);

  const allergyItems = useMemo(() => [
    { label: t('auth.register.options.allergies.penicillin'), value: "Penicilina" },
    { label: t('auth.register.options.allergies.shellfish'), value: "Mariscos" },
    { label: t('auth.register.options.allergies.pollen'), value: "Polen" },
    { label: t('auth.register.options.allergies.dairy'), value: "Lácteos" },
    { label: t('auth.register.options.allergies.nuts'), value: "Nueces" },
    { label: t('auth.register.options.allergies.eggs'), value: "Huevos" },
    { label: t('auth.register.options.allergies.other'), value: "Otro" },
  ], [t]);

  const conditionItems = useMemo(() => [
    { label: t('auth.register.options.conditions.diabetes'), value: "Diabetes" },
    { label: t('auth.register.options.conditions.hypertension'), value: "Hipertensión" },
    { label: t('auth.register.options.conditions.asthma'), value: "Asma" },
    { label: t('auth.register.options.conditions.arthritis'), value: "Artritis" },
    { label: t('auth.register.options.conditions.heart_disease'), value: "Enfermedad cardíaca" },
    { label: t('auth.register.options.conditions.other'), value: "Otro" },
  ], [t]);


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
  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: "pocketdoctor://home",
        },
      });
      if (error) Alert.alert(t('common.error'), error.message);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  const handleMicrosoftSignUp = useCallback(async () => {
    try {
      const redirectUri = makeRedirectUri({
        scheme: "pocketdoctor",
        path: "auth/callback",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          scopes: "email profile openid offline_access",
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error || !data?.url) {
        console.error(error);
        Alert.alert(
          t('common.error'),
          error?.message ?? t('auth.register.error_microsoft_login')
        );
        return;
      }

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (res.type !== "success") return;

      // Extract tokens manually
      const { url } = res;
      if (!url) {
        Alert.alert(t('common.error'), t('auth.register.error_no_browser_response'));
        return;
      }

      const params = new URLSearchParams(url.split("#")[1] || url.split("?")[1]);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const code = params.get("code");

      let session: any = null;
      let user: any = null;

      if (code) {
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) throw sessionError;
        session = sessionData.session;
        user = session?.user;
      } else if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
        session = sessionData.session;
        user = session?.user;
      } else {
        // Fallback
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          session = existingSession;
          user = existingSession.user;
        } else {
          Alert.alert(t('common.error'), t('auth.register.error_no_active_session'));
          return;
        }
      }

      if (user) {
        console.log("MICROSOFT USER:", JSON.stringify(user, null, 2));

        if (session.access_token) {
          try {
            const { getUserProfile } = await import("@/src/services/user");
            const profile = await getUserProfile(session.access_token);
            // set store
            const { useAuthStore } = require("@/src/store/authStore");
            useAuthStore.setState({ user: session.user, session, userProfile: profile });
          } catch (err) {
            console.warn("Error fetching profile:", err);
          }
        }

        const email = user.email ?? "";
        const fullName =
          (user.user_metadata.full_name as string) ||
          (user.user_metadata.name as string) ||
          "";
        const givenName = user.user_metadata.given_name as string | undefined;
        const familyName = user.user_metadata.family_name as string | undefined;
        const avatarUrl = user.user_metadata.avatar_url as string | undefined;

        // Upsert
        const { error: upsertError } = await supabase
          .from("usuarios")
          .upsert(
            {
              auth_id: user.id, // register.tsx uses auth_id
              email,
              nombre: givenName || fullName,
              apellido: familyName || null,
              avatar_url: avatarUrl ?? null,
            },
            {
              onConflict: "auth_id",
            }
          );

        if (upsertError) {
          console.warn("Error al sincronizar perfil básico:", upsertError);
        }

        router.push("/(tabs)/home");
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        t('common.error'),
        t('auth.register.error_microsoft_login_unexpected')
      );
    }
  }, [router, t]);


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
        return { text: t('auth.register.password_strength_very_weak'), color: "#E74C3C" };
      case 2:
        return { text: t('auth.register.password_strength_weak'), color: "#F39C12" };
      case 3:
        return { text: t('auth.register.password_strength_medium'), color: "#F1C40F" };
      case 4:
      default:
        return { text: t('auth.register.password_strength_strong'), color: "#27AE60" };
    }
  }, [passwordStrength, t]);

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

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const toggleAllergy = useCallback(
    (allergyValue: string) => {
      if (allergyValue === "Otro") {
        if (selectedAllergies.includes("Otro")) {
          setSelectedAllergies(selectedAllergies.filter(a => a !== "Otro"));
          setOtherAllergies("");
        } else setSelectedAllergies([...selectedAllergies, "Otro"]);
      } else {
        setSelectedAllergies(prev =>
          prev.includes(allergyValue)
            ? prev.filter(a => a !== allergyValue)
            : [...prev, allergyValue]
        );
      }
    },
    [selectedAllergies]
  );

  const toggleCondition = useCallback(
    (conditionValue: string) => {
      if (conditionValue === "Otro") {
        if (selectedConditions.includes("Otro")) {
          setSelectedConditions(selectedConditions.filter(c => c !== "Otro"));
          setOtherConditions("");
        } else setSelectedConditions([...selectedConditions, "Otro"]);
      } else {
        setSelectedConditions(prev =>
          prev.includes(conditionValue)
            ? prev.filter(c => c !== conditionValue)
            : [...prev, conditionValue]
        );
      }
    },
    [selectedConditions]
  );

  const onRegister = async () => {
    setSubmitted(true);

    // Basic client-side validations with user-friendly alerts
    if (!isValidEmail(email)) {
      Alert.alert(t('auth.login.error_invalid_email'), t('auth.login.error_invalid_email_message'));
      return;
    }

    // collect missing required fields to show a helpful alert
    const missing: string[] = [];
    if (!requiredStr(firstName)) missing.push(t('auth.register.names'));
    if (!requiredStr(lastName)) missing.push(t('auth.register.surnames'));
    if (!requiredStr(email)) missing.push(t('auth.register.email'));
    if (!requiredStr(password)) missing.push(t('auth.register.password'));
    if (!requiredStr(confirmPassword)) missing.push(t('auth.register.confirm_password'));
    if (!requiredStr(height)) missing.push(t('auth.register.height'));
    if (!requiredStr(weight)) missing.push(t('auth.register.weight'));
    if (!requiredStr(bloodType)) missing.push(t('auth.register.blood_type'));
    if (!requiredStr(gender)) missing.push(t('auth.register.gender'));
    if (!dateOfBirth) missing.push(t('auth.register.birth_date'));
    if (!accepted) missing.push(t('auth.register.accept_terms'));

    if (missing.length > 0) {
      Alert.alert(
        t('auth.register.missing_fields_title'),
        `${t('auth.register.missing_fields_message')}: ${missing.join(", ")}`
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auth.forgot_password.error_password_mismatch'), t('auth.forgot_password.error_password_mismatch_message'));
      return;
    }

    if (!passwordMeetsPolicy(password)) {
      Alert.alert(
        t('auth.register.weak_password_title'),
        t('auth.register.weak_password_message')
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
          t('auth.register.email_already_registered_title'),
          t('auth.register.email_already_registered_message')
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
              <ThemedText style={styles.title}>{t('auth.register.title')}</ThemedText>
              <ThemedText style={styles.subtitle}>
                {t('auth.register.subtitle')}
              </ThemedText>
            </View>

            <View style={styles.form}>
              <Label required styles={styles}>
                {t('auth.register.names')}
              </Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(firstName) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder={t('auth.register.names_placeholder')}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor={placeholderGray}
                  autoCapitalize="words"
                />
              </View>
              {submitted && !requiredStr(firstName) && (
                <Text style={styles.err}>{t('common.required')}</Text>
              )}

              <Label required styles={styles}>
                {t('auth.register.surnames')}
              </Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(lastName) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder={t('auth.register.surnames_placeholder')}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor={placeholderGray}
                  autoCapitalize="words"
                />
              </View>
              {submitted && !requiredStr(lastName) && (
                <Text style={styles.err}>{t('common.required')}</Text>
              )}

              <Label required styles={styles}>
                {t('auth.register.email')}
              </Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && (!requiredStr(email) || (requiredStr(email) && !isValidEmail(email))) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder={t('auth.login.email_placeholder')}
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
                <Text style={styles.err}>{t('auth.login.error_invalid_email')}</Text>
              )}

              {submitted && !requiredStr(email) && (
                <Text style={styles.err}>{t('common.required')}</Text>
              )}
              {submitted && requiredStr(email) && !isValidEmail(email) && (
                <Text style={styles.err}>{t('auth.login.error_invalid_email')}</Text>
              )}

              <Label required styles={styles}>
                {t('auth.register.password')}
              </Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && (!requiredStr(password) || !passwordMeetsPolicy(password)) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder={t('auth.register.password')}
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
                {t('auth.register.password_policy')}
              </Text>
              {submitted && !requiredStr(password) && (
                <Text style={styles.err}>{t('common.required')}</Text>
              )}
              {submitted && requiredStr(password) && !passwordMeetsPolicy(password) && (
                <Text style={styles.err}>{t('auth.forgot_password.error_password_length')}</Text>
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
                {t('auth.register.confirm_password')}
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
                  placeholder={t('auth.register.confirm_password')}
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
                <Text style={styles.err}>{t('auth.forgot_password.error_password_mismatch')}</Text>
              )}
              {submitted && !requiredStr(confirmPassword) && (
                <Text style={styles.err}>{t('common.required')}</Text>
              )}
              {submitted && requiredStr(confirmPassword) && password !== confirmPassword && (
                <Text style={styles.err}>{t('auth.forgot_password.error_password_mismatch')}</Text>
              )}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('auth.register.health_info')}</Text>
              </View>

              <Label required styles={styles}>
                {t('auth.register.height')}
              </Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(height) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder={t('auth.register.height_placeholder')}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholderTextColor={placeholderGray}
                />
              </View>
              {submitted && !requiredStr(height) && (
                <Text style={styles.err}>{t('common.required')}</Text>
              )}

              <Label required styles={styles}>
                {t('auth.register.weight')}
              </Label>
              <View
                style={[
                  styles.inputContainer,
                  submitted && !requiredStr(weight) && styles.fieldError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder={t('auth.register.weight_placeholder')}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholderTextColor={placeholderGray}
                />
              </View>
              {submitted && !requiredStr(weight) && (
                <Text style={styles.err}>{t('common.required')}</Text>
              )}

              <SelectField
                label={t('auth.register.blood_type')}
                value={bloodType}
                onChange={setBloodType}
                placeholder={t('auth.register.blood_type_placeholder')}
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
                <Text style={styles.err}>{t('common.required')}</Text>
              )}

              <Label required styles={styles}>
                {t('auth.register.birth_date')}
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
                <Text style={styles.err}>{t('common.required')}</Text>
              )}

              <SelectField
                label={t('auth.register.gender')}
                value={gender}
                onChange={setGender}
                placeholder={t('auth.register.gender_placeholder')}
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
                <Text style={styles.err}>{t('common.required')}</Text>
              )}

              <Label styles={styles}>{t('auth.register.allergies')}</Label>
              <View style={styles.checkboxContainer}>
                {allergyItems.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.checkboxRow}
                    onPress={() => toggleAllergy(item.value)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedAllergies.includes(item.value) &&
                        styles.checkboxSelected,
                      ]}
                    >
                      {selectedAllergies.includes(item.value) && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedAllergies.includes("Otro") && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('auth.register.other_allergies_placeholder')}
                    value={otherAllergies}
                    onChangeText={setOtherAllergies}
                    placeholderTextColor={placeholderGray}
                  />
                </View>
              )}

              <Label styles={styles}>{t('auth.register.conditions')}</Label>
              <View style={styles.checkboxContainer}>
                {conditionItems.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.checkboxRow}
                    onPress={() => toggleCondition(item.value)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedConditions.includes(item.value) &&
                        styles.checkboxSelected,
                      ]}
                    >
                      {selectedConditions.includes(item.value) && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedConditions.includes("Otro") && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('auth.register.other_conditions_placeholder')}
                    value={otherConditions}
                    onChangeText={setOtherConditions}
                    placeholderTextColor={placeholderGray}
                  />
                </View>
              )}

              <CheckRow
                checked={accepted}
                onToggle={() => setAccepted(!accepted)}
                text={t('auth.register.terms_text')}
                linkText={t('auth.register.terms_link')}
                onPressLink={() => setShowTermsModal(true)}
                afterLinkText={t('auth.register.privacy_text')}
                privacyText={t('auth.register.privacy_link')}
                onPressPrivacy={() => setShowPrivacyModal(true)}

              />
              {submitted && !accepted && (
                <Text style={styles.err}>{t('auth.register.error_accept_terms')}</Text>
              )}

              {submitted && !formValid && (
                <Text style={styles.err}>{t('auth.register.error_missing_fields')}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  styles.registerButtonActive,
                ]}
                onPress={onRegister}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.registerButtonText,
                    styles.registerButtonTextActive,
                  ]}
                >
                  {isLoading ? t('auth.register.registering') : t('auth.register.register_button')}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>{t('auth.register.or_register_with')}</Text>
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
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleMicrosoftSignUp}>
                  <Image
                    source={require("@/assets/images/microsoft.png")}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.signInRow}>
                <Text style={styles.signInText}>{t('auth.register.already_have_account')}</Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.signInLink}>{t('auth.register.login_link')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView >

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
    </SafeAreaView >
  );
}

export default function RegisterScreen() {
  return <RegisterScreenInner />;
}
