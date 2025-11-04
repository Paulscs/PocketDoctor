import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/src/store";

const SIZES = {
  ICON: 18,
  BORDER_RADIUS: 8,
  PADDING: 24,
} as const;

interface ThemeColors {
  brandBlue: string;
  muted: string;
  white: string;
  black: string;
  placeholder: string;
  border: string;
  divider: string;
  friendlyBlue: string;
  friendlyBlueBg: string;
  friendlyBlueBorder: string;
  friendlyGreen: string;
  friendlyGreenBg: string;
  friendlyGreenBorder: string;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    content: { flexGrow: 1, padding: SIZES.PADDING },

    header: { alignItems: "center", marginTop: 40, marginBottom: 20 },
    logo: { width: 100, height: 80 },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.brandBlue,
      marginTop: 8,
    },
    subtitle: {
      color: colors.muted,
      fontSize: 14,
      textAlign: "center",
      marginTop: 4,
    },

    form: { marginTop: 12 },
    label: {
      color: colors.brandBlue,
      fontWeight: "600",
      fontSize: 15,
      marginBottom: 6,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.BORDER_RADIUS,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 14,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.black,
      marginLeft: 8,
    },

    optionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    rememberRow: { flexDirection: "row", alignItems: "center" },
    checkbox: {
      width: 16,
      height: 16,
      borderWidth: 1.3,
      borderColor: colors.border,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.white,
      marginRight: 6,
    },
    checkboxChecked: {
      backgroundColor: colors.brandBlue,
      borderColor: colors.brandBlue,
    },
    rememberText: { color: colors.black, fontSize: 13, marginTop: -1 },
    forgotText: {
      color: colors.brandBlue,
      fontSize: 13,
      marginTop: -1,
    },

    button: {
      backgroundColor: colors.brandBlue,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 24,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: colors.white, fontSize: 16, fontWeight: "600" },

    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    line: { flex: 1, height: 1, backgroundColor: colors.divider },
    dividerText: { color: colors.placeholder, marginHorizontal: 10 },

    socialRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 20,
      marginBottom: 24,
    },
    socialButton: { padding: 4 },
    socialIcon: { width: 40, height: 40 },

    signUpRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 16,
    },
    signUpText: { color: colors.muted, fontSize: 14 },
    signUpLink: {
      color: colors.brandBlue,
      fontWeight: "600",
      fontSize: 14,
    },

    footerWarnings: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    warningCard: {
      flex: 1,
      borderRadius: 8,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
    },
    warningIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    warningContent: {
      flex: 1,
    },
    warningTitle: {
      fontSize: 10,
      fontWeight: "700",
      marginBottom: 1,
    },
    warningText: {
      fontSize: 9,
      lineHeight: 11,
    },

    // Medical card styles (friendly blue)
    medicalCard: {
      backgroundColor: colors.friendlyBlueBg,
      borderColor: colors.friendlyBlueBorder,
    },
    medicalIcon: {
      backgroundColor: colors.friendlyBlue,
    },
    medicalTitle: {
      color: colors.friendlyBlue,
    },
    medicalText: {
      color: "#1E40AF",
    },

    // Security card styles (friendly green)
    securityCard: {
      backgroundColor: colors.friendlyGreenBg,
      borderColor: colors.friendlyGreenBorder,
    },
    securityIcon: {
      backgroundColor: colors.friendlyGreen,
    },
    securityTitle: {
      color: colors.friendlyGreen,
    },
    securityText: {
      color: "#047857",
    },
  });

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Global state
  const { login, isLoading, error, clearError } = useAuthStore();

  // Theme colors
  const brandBlue = useThemeColor(
    { light: Colors.light.brandBlue, dark: Colors.dark.brandBlue },
    "brandBlue"
  );
  const muted = useThemeColor(
    { light: Colors.light.muted, dark: Colors.dark.muted },
    "muted"
  );
  const white = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.white },
    "white"
  );
  const black = useThemeColor(
    { light: Colors.light.black, dark: Colors.dark.black },
    "black"
  );
  const placeholder = useThemeColor(
    { light: Colors.light.placeholder, dark: Colors.dark.placeholder },
    "placeholder"
  );
  const border = useThemeColor(
    { light: Colors.light.borderGray, dark: Colors.dark.borderGray },
    "border"
  );
  const divider = useThemeColor(
    { light: Colors.light.divider, dark: Colors.dark.divider },
    "divider"
  );
  const friendlyBlue = useThemeColor(
    { light: Colors.light.friendlyBlue, dark: Colors.dark.friendlyBlue },
    "friendlyBlue"
  );
  const friendlyBlueBg = useThemeColor(
    { light: Colors.light.friendlyBlueBg, dark: Colors.dark.friendlyBlueBg },
    "friendlyBlueBg"
  );
  const friendlyBlueBorder = useThemeColor(
    {
      light: Colors.light.friendlyBlueBorder,
      dark: Colors.dark.friendlyBlueBorder,
    },
    "friendlyBlueBorder"
  );
  const friendlyGreen = useThemeColor(
    { light: Colors.light.friendlyGreen, dark: Colors.dark.friendlyGreen },
    "friendlyGreen"
  );
  const friendlyGreenBg = useThemeColor(
    { light: Colors.light.friendlyGreenBg, dark: Colors.dark.friendlyGreenBg },
    "friendlyGreenBg"
  );
  const friendlyGreenBorder = useThemeColor(
    {
      light: Colors.light.friendlyGreenBorder,
      dark: Colors.dark.friendlyGreenBorder,
    },
    "friendlyGreenBorder"
  );

  const styles = useMemo(
    () =>
      createStyles({
        brandBlue,
        muted,
        white,
        black,
        placeholder,
        border,
        divider,
        friendlyBlue,
        friendlyBlueBg,
        friendlyBlueBorder,
        friendlyGreen,
        friendlyGreenBg,
        friendlyGreenBorder,
      }),
    [
      brandBlue,
      muted,
      white,
      black,
      placeholder,
      border,
      divider,
      friendlyBlue,
      friendlyBlueBg,
      friendlyBlueBorder,
      friendlyGreen,
      friendlyGreenBg,
      friendlyGreenBorder,
    ]
  );

  const validate = useCallback(() => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Por favor, ingresa un correo electrónico válido");
      return false;
    }
    return true;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    clearError();
    try {
      await login(email, password);
      router.push("/(tabs)/home");
    } catch (err) {
      // Error is handled by the store
    }
  }, [validate, login, email, password, clearError]);

  useEffect(() => {
    if (error) {
      Alert.alert("Credenciales inválidas", "El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus datos e intenta nuevamente.");
    }
  }, [error]);

  const navigateToForgotPassword = () => router.push("/forgot-password");
  const navigateToRegister = () => router.push("/register");

  const renderSocial = (src: ImageSourcePropType, key: string) => (
    <TouchableOpacity key={key} style={styles.socialButton}>
      <Image source={src} style={styles.socialIcon} resizeMode="contain" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logoBlue.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>
            Ingresa para descubrir lo que tus análisis dicen de ti.
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          {/* Email */}
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={SIZES.ICON} color={muted} />
            <TextInput
              style={styles.input}
              placeholder="ejemplo@gmail.com"
              placeholderTextColor={placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="lock-closed-outline"
              size={SIZES.ICON}
              color={muted}
            />
            <TextInput
              style={styles.input}
              placeholder="Introduzca su contraseña"
              placeholderTextColor={placeholder}
              secureTextEntry={!showPassword}
              autoComplete="password"
              editable={!isLoading}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={SIZES.ICON}
                color={muted}
              />
            </TouchableOpacity>
          </View>

          {/* Remember + Forgot */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRemember(r => !r)}
              activeOpacity={0.8}
            >
              <View
                style={[styles.checkbox, remember && styles.checkboxChecked]}
              >
                {remember && (
                  <Ionicons name="checkmark" size={12} color={white} />
                )}
              </View>
              <Text style={styles.rememberText}>Recordarme</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateToForgotPassword}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Iniciando..." : "Iniciar Sesión"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.line} />
          </View>

          {/* Social Login */}
          <View style={styles.socialRow}>
            {[
              require("@/assets/images/google.png"),
              require("@/assets/images/microsoft.png"),
              require("@/assets/images/apple.png"),
            ].map((src, i) => renderSocial(src, `social-${i}`))}
          </View>

          {/* Register */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.signUpLink}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Warnings */}
          <View style={styles.footerWarnings}>
            <View style={[styles.warningCard, styles.medicalCard]}>
              <View style={[styles.warningIcon, styles.medicalIcon]}>
                <Ionicons name="medical-outline" size={12} color={white} />
              </View>
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, styles.medicalTitle]}>
                  Solo informativo
                </Text>
                <Text style={[styles.warningText, styles.medicalText]}>
                  No reemplaza diagnóstico médico
                </Text>
              </View>
            </View>

            <View style={[styles.warningCard, styles.securityCard]}>
              <View style={[styles.warningIcon, styles.securityIcon]}>
                <Ionicons name="shield-checkmark" size={12} color={white} />
              </View>
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, styles.securityTitle]}>
                  HIPAA
                </Text>
                <Text style={[styles.warningText, styles.securityText]}>
                  Datos encriptados y seguros
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
