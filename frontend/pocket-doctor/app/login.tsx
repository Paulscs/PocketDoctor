import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  BORDER: "#D1D5DB",
  MUTED: "#6B7280",
  WHITE: "#FFFFFF",
  BLACK: "#111827",
  PLACEHOLDER: "#9CA3AF",
  DIVIDER: "#E5E7EB",
} as const;

const SIZES = {
  ICON: 18,
  BORDER_RADIUS: 8,
  PADDING: 24,
} as const;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      router.push("/(tabs)/home");
    } catch {
      Alert.alert("Error", "No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [validate]);

  const navigateToForgotPassword = () => router.push("/forgot-password");
  const navigateToRegister = () => router.push("/register");

  const renderSocial = (src: any, key: string) => (
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
            <Ionicons
              name="mail-outline"
              size={SIZES.ICON}
              color={COLORS.MUTED}
            />
            <TextInput
              style={styles.input}
              placeholder="ejemplo@gmail.com"
              placeholderTextColor={COLORS.PLACEHOLDER}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
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
              color={COLORS.MUTED}
            />
            <TextInput
              style={styles.input}
              placeholder="Introduzca su contraseña"
              placeholderTextColor={COLORS.PLACEHOLDER}
              secureTextEntry={!showPassword}
              autoComplete="password"
              editable={!loading}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={SIZES.ICON}
                color={COLORS.MUTED}
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
                  <Ionicons name="checkmark" size={12} color={COLORS.WHITE} />
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
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Iniciando..." : "Iniciar Sesión"}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  content: { flexGrow: 1, padding: SIZES.PADDING },

  header: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  logo: { width: 100, height: 80 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    marginTop: 8,
  },
  subtitle: {
    color: COLORS.MUTED,
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },

  form: { marginTop: 12 },
  label: {
    color: COLORS.BRAND_BLUE,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: SIZES.BORDER_RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.BLACK,
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
    borderColor: COLORS.BORDER,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    marginRight: 6,
  },
  checkboxChecked: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderColor: COLORS.BRAND_BLUE,
  },
  rememberText: { color: COLORS.BLACK, fontSize: 13, marginTop: -1 },
  forgotText: {
    color: COLORS.BRAND_BLUE,
    fontSize: 13,
    marginTop: -1,
  },

  button: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.WHITE, fontSize: 16, fontWeight: "600" },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  line: { flex: 1, height: 1, backgroundColor: COLORS.DIVIDER },
  dividerText: { color: COLORS.PLACEHOLDER, marginHorizontal: 10 },

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
    marginBottom: 20,
  },
  signUpText: { color: COLORS.MUTED, fontSize: 14 },
  signUpLink: {
    color: COLORS.BRAND_BLUE,
    fontWeight: "600",
    fontSize: 14,
  },
});
