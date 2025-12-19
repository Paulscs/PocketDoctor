import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Linking,
  ImageSourcePropType,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/src/store";
import { getUserProfile } from "@/src/services/user";
import * as AuthSession from "expo-auth-session";

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
      marginBottom: 16,
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

    errorToast: {
      backgroundColor: "#EF4444",
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
      marginHorizontal: 0,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    errorIcon: {
      marginRight: 12,
    },
    errorText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
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
  const [showError, setShowError] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Global state
  const { login, isLoading, error, clearError, session } = useAuthStore();

  // Theme colors... (omitted for brevity, assume existing context hooks are fine)
  // Re-declare theme hooks since I am replacing the whole block
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

  // ------------ LOCKOUT TIMER ------------
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (lockoutTime !== null && lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev === null || prev <= 1) return null;
          return prev - 1;
        });
      }, 1000);
    } else if (lockoutTime === 0) {
      setLockoutTime(null);
    }
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ------------ EMAIL + PASSWORD LOGIN ------------
  const handleOpenLink = () => {
    const url = 'https://www.cdc.gov/phlp/php/resources/health-insurance-portability-and-accountability-act-of-1996-hipaa.html';

    // Es buena práctica usar catch por si falla al abrir
    Linking.openURL(url).catch(err => console.error("No se pudo cargar la página", err));
  };
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
    if (lockoutTime !== null) return; // Prevent invalid click
    if (!validate()) return;
    clearError();
    try {
      await login(email, password); // tu store debe llamar a supabase.auth.signInWithPassword
      // Navigation is handled by useEffect when session updates
    } catch (err) {
      // el store ya maneja error
    }
  }, [validate, login, email, password, clearError, lockoutTime]);

  // Sync store error with local state and animation
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (error) {
      // Check for lockout protocol "LOCKED:123"
      if (typeof error === 'string' && error.startsWith("LOCKED:")) {
        const secondsStr = error.split(":")[1];
        const seconds = parseInt(secondsStr, 10);
        if (!isNaN(seconds)) {
          setLockoutTime(seconds);
        }
      }

      setShowError(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide logic
      // Si es locked, también lo ocultamos después de 4s para limpiar el toast,
      // pero el bloqueo (lockoutTime) persiste en el estado local.
      timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowError(false);
          clearError(); // Clear in store
        });
      }, 4000);

    } else {
      setShowError(false);
      fadeAnim.setValue(0);
    }

    return () => clearTimeout(timer);
  }, [error, fadeAnim, clearError]);



  const handleMicrosoftSignUp = useCallback(async () => {
    try {
      // 1. Crear redirectUri explícito
      const redirectUri = makeRedirectUri({
        scheme: "pocketdoctor",
        path: "auth/callback",
      });

      // 2. Iniciar el flujo con Supabase
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
        console.error("Error signInWithOAuth Microsoft:", error);
        Alert.alert(
          "Error",
          error?.message ?? "No se pudo iniciar sesión con Microsoft"
        );
        return;
      }

      // 3. Abrir navegador
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type !== "success") {
        if (result.type === 'dismiss') {
          // Usuario cerró la ventana
        }
        return;
      }

      // 4. Extraer token/code manualmente
      const { url } = result;
      if (!url) {
        Alert.alert("Error", "No se recibió respuesta del navegador");
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
        // Fallback: revisar si la sesión se estableció sola (a veces pasa en iOS)
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          session = existingSession;
          user = session.user;
        } else {
          Alert.alert("Error", "No se encontró sesión tras el login con Microsoft.");
          return;
        }
      }

      if (user) {
        console.log("MICROSOFT USER:", JSON.stringify(user, null, 2));

        // --- Fetch backend profile (opcional) ---
        if (session.access_token) {
          try {
            const { getUserProfile } = await import("@/src/services/user");
            const profile = await getUserProfile(session.access_token);
            const { useAuthStore } = require("@/src/store");
            useAuthStore.setState({ user: session.user, session, userProfile: profile });
          } catch (err) {
            console.warn("Error fetching profile after Microsoft OAuth:", err);
          }
        }

        // Datos del usuario para upsert
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

        // Upsert en tabla usuarios
        const { error: upsertError } = await supabase
          .from("usuarios")
          .upsert(
            {
              auth_id: user.id, // o user_auth_id según tu schema (revisaré register.tsx usa auth_id, login usa user_auth_id?)
              // NOTA: En register.tsx usaste 'auth_id', en login.tsx veo 'user_auth_id' en handleGoogleLogin (line 649).
              // Voy a usar user_auth_id aquí para ser consistente con login.tsx, pero debo verificar cual es el correcto.
              // El usuario tiene copiado handleGoogleLogin en login.tsx con 'user_auth_id'.
              // Voy a asumir 'user_auth_id' para login.tsx porque es lo que hay ahí.
              user_auth_id: user.id,
              email: user.email ?? "",
              nombre: nombre || null,
              apellido,
              avatar_url: meta.avatar_url ?? null,
            },
            {
              onConflict: "user_auth_id",
            }
          );

        if (upsertError) {
          console.warn("Error upsert Microsoft:", upsertError);
        }

        // Navegar home
        router.push("/(tabs)/home");
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Error",
        "Ocurrió un problema al iniciar sesión con Microsoft."
      );
    }
  }, [router]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      // 1. Crear redirectUri explícito "pocketdoctor://auth/callback"
      const redirectUri = makeRedirectUri({
        scheme: "pocketdoctor",
        path: "auth/callback",
      });

      console.log("[GOOGLE] redirectUri:", redirectUri);

      // 2. Iniciar el flujo de OAuth con Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        console.error("[GOOGLE] signInWithOAuth error:", error);
        Alert.alert("Error", error?.message ?? "No se pudo iniciar con Google");
        return;
      }

      console.log("[GOOGLE] Auth URL:", data.url);

      // 3. Abrir el navegador del sistema
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

      console.log("[GOOGLE] WebBrowser result:", result);

      if (result.type !== "success") {
        if (result.type === 'dismiss') {
          Alert.alert("Cancelado", "Inicio de sesión cancelado.");
        }
        return;
      }


      // 4. Extraer token/code de la URL de retorno
      const { url } = result;
      if (!url) {
        Alert.alert("Error", "No se recibió respuesta del navegador");
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
        console.warn("[GOOGLE] No se encontraron tokens en URL:", url);
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          session = existingSession;
          user = session.user;
        } else {
          Alert.alert("Error", "No se pudo verificar la sesión.");
          return; // Stop here
        }
      }

      if (user) {
        // --- tu upsert (igual que antes) ---
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
        }

        useAuthStore.setState({ user, session });
        Alert.alert("Bienvenido", "Inicio de sesión correcto con Google ✅");
      }
    } catch (err) {
      console.error("[GOOGLE] error inesperado:", err);
      Alert.alert("Error", "Problema iniciando sesión con Google.");
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
            {/* 
              DEMO MODE: Custom visual masking to prevent Android FLAG_SECURE (black screen).
              We render the dots manually in a background Text, and make the foreground TextInput transparent.
            */}
            <View style={{ flex: 1, justifyContent: "center" }}>
              {/* Visual Layer (Dots or Text) */}
              <Text
                style={[
                  styles.input,
                  {
                    position: "absolute",
                    color: !showPassword && password.length > 0 ? black : "transparent",
                    zIndex: 0,
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    textAlignVertical: 'center',
                    paddingTop: 14
                  },
                ]}
                numberOfLines={1}
              >
                {!showPassword ? "•".repeat(password.length) : ""}
              </Text>

              {/* Functional Layer (Transparent Input) */}
              <TextInput
                style={[
                  styles.input,
                  {
                    color: !showPassword && password.length > 0 ? "transparent" : black,
                    zIndex: 1,
                  },
                ]}
                placeholder="Introduzca su contraseña"
                placeholderTextColor={placeholder}
                secureTextEntry={false}
                autoComplete="password"
                editable={!isLoading}
                value={password}
                onChangeText={setPassword}
              />
            </View>
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

            <TouchableOpacity onPress={navigateToForgotPassword}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {/* Lockout Warning */}
          {lockoutTime !== null && (
            <View style={{ marginBottom: 12, alignItems: "center", paddingHorizontal: 20 }}>
              <Text style={{ color: "#EF4444", fontWeight: "600", textAlign: "center", marginBottom: 4 }}>
                Cuenta bloqueada temporalmente
              </Text>
              <Text style={{ color: "#EF4444", fontSize: 13, textAlign: "center" }}>
                Has superado el límite de intentos. Por favor espera {formatTime(lockoutTime)} antes de intentar de nuevo.
              </Text>
            </View>
          )}

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || lockoutTime !== null) && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading || lockoutTime !== null}
          >
            <Text style={styles.buttonText}>
              {lockoutTime !== null
                ? `Bloqueado (${formatTime(lockoutTime)})`
                : (isLoading ? "Iniciando..." : "Iniciar Sesión")}
            </Text>
          </TouchableOpacity>

          {showError && (
            <Animated.View style={[styles.errorToast, { opacity: fadeAnim }]}>
              <Ionicons name="close-circle" size={24} color={white} style={styles.errorIcon} />
              <Text style={styles.errorText}>
                El correo electrónico o la contraseña son incorrectos.
              </Text>
            </Animated.View>
          )}

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
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleMicrosoftSignUp}
            >
              <Image
                source={require("@/assets/images/microsoft.png")}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Microsoft / Apple: por ahora solo UI */}

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
              <TouchableOpacity onPress={handleOpenLink} activeOpacity={0.7}>

                {/* Tu código original */}
                <View style={styles.warningContent}>
                  <Text style={[styles.warningTitle, styles.securityTitle]}>
                    HIPAA
                  </Text>
                  <Text style={[styles.warningText, styles.securityText]}>
                    Datos encriptados y seguros
                  </Text>
                </View>

              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
