import React, { useState, useCallback, useMemo } from "react";
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

import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/src/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const scheme = "pocketdoctor"; // mismo que en app.json

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

  // ------------ EMAIL + PASSWORD LOGIN ------------

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
      await login(email, password); // tu store debe llamar a supabase.auth.signInWithPassword
      router.push("/(tabs)/home");
    } catch (err) {
      // el store ya maneja error
    }
  }, [validate, login, email, password, clearError]);

  // ------------ GOOGLE LOGIN (SUPABASE OAUTH) ------------

  // ------------ GOOGLE LOGIN (SUPABASE OAUTH) ------------

  const handleGoogleLogin = useCallback(async () => {
    try {
      const redirectTo = makeRedirectUri({
        scheme,
        path: "auth/callback",
      });

      console.log("[GOOGLE] redirectTo:", redirectTo);

      // 1) Pedimos a Supabase la URL de login con Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true, // usamos nuestro propio navegador
        },
      });

      if (error || !data?.url) {
        console.error("[GOOGLE] signInWithOAuth error:", error);
        Alert.alert(
          "Error",
          error?.message ?? "No se pudo iniciar sesión con Google"
        );
        return;
      }

      console.log("[GOOGLE] auth URL:", data.url);

      // 2) Abrimos el navegador para hacer el login con Google
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      console.log("[GOOGLE] WebBrowser result:", res);

      // 3) Polling a getSession() hasta que Supabase cree la sesión
      let session: any = null;
      let lastError: any = null;

      for (let i = 0; i < 8; i++) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        console.log(
          `[GOOGLE] poll ${i}: hasSession =`,
          !!sessionData?.session,
          sessionError ? "con error" : "sin error"
        );

        if (sessionError) {
          lastError = sessionError;
        }

        if (sessionData?.session) {
          session = sessionData.session;
          break;
        }

        // pequeño delay antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (!session) {
        console.warn("[GOOGLE] No se obtuvo sesión tras el login.");
        if (lastError) console.error("[GOOGLE] getSession lastError:", lastError);
        Alert.alert(
          "Error",
          "No se encontró una sesión activa después del login con Google."
        );
        return;
      }

      const user = session.user;
      console.log("[GOOGLE] usuario autenticado:", user);

      // --- nombre / apellido desde metadata de Google ---
      const meta: any = user.user_metadata ?? {};
      const fullName: string =
        meta.full_name ||
        meta.name ||
        `${meta.given_name ?? ""} ${meta.family_name ?? ""}`.trim();

      let nombre = "";
      let apellido: string | null = null;

      if (meta.given_name) {
        nombre = meta.given_name;
        apellido = meta.family_name ?? null;
      } else if (fullName) {
        const parts = fullName.split(" ");
        nombre = parts.shift() ?? "";
        apellido = parts.length ? parts.join(" ") : null;
      }

      console.log("[GOOGLE] nombre/apellido para guardar:", { nombre, apellido });

      // --- upsert en tu tabla usuarios ---
      const { error: upsertError } = await supabase
        .from("usuarios")
        .upsert(
          {
            user_auth_id: user.id,
            email: user.email ?? "",
            nombre: nombre || null,
            apellido,
          },
          { onConflict: "user_auth_id" }
        );

      if (upsertError) {
        console.error("[GOOGLE] upsert usuarios error:", upsertError);
        // no bloqueamos el acceso, solo lo logueamos
      }

      console.log("[GOOGLE] login OK, navegando al home");
      Alert.alert("Bienvenido", "Inicio de sesión correcto con Google ✅");
      router.replace("/(tabs)/home"); // uso replace para sacar /login del stack
    } catch (err) {
      console.error("[GOOGLE] error inesperado:", err);
      Alert.alert(
        "Error",
        "Ocurrió un problema al iniciar sesión con Google. Inténtalo de nuevo."
      );
    }
  }, []);





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
            {/* Google: real login */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
            >
              <Image
                source={require("@/assets/images/google.png")}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Microsoft / Apple: por ahora solo UI */}
            {[
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
