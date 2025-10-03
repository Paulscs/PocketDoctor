import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Text,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CheckRow from "@/components/ui/CheckRow";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
const BRAND_BLUE = "#002D73";
const MUTED = "#52607A";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [secure, setSecure] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const isFormValid = email.trim() !== "" && password.trim() !== "";

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push("/(tabs)");
    } catch {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Social Login", `${provider} login will be implemented`);
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    Alert.alert("Forgot Password", "Password reset will be implemented");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          {/* Real Pocket Doctor Logo */}
          <Image source={require("@/assets/images/aloneLogo.png")} style={styles.logo} resizeMode="contain" />
          <ThemedText style={styles.title}>Bienvenido</ThemedText>
          <ThemedText style={styles.subtitle}>
            Inicia sesión para acceder a tu asistente médico IA
          </ThemedText>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="ejemplo@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.inputLabel}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Introduzca su contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeBtn}>
            <Ionicons name={secure ? "eye-off" : "eye"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <CheckRow
                checked={rememberMe}
                onToggle={() => setRememberMe(!rememberMe)}
                text="Recordarme"
              >
              </CheckRow>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Iniciando..." : "Iniciar Sesión"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image source={require("@/assets/images/google.png")} style={styles.socialIcon} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image source={require("@/assets/images/microsoft.png")} style={styles.socialIcon} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image source={require("@/assets/images/apple.png")} style={styles.socialIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>


          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.signUpLink}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>🛡️ Cumple con HIPAA</Text>
            <Text style={styles.footerText}>🔒 Cifrado 256 bits</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", color: BRAND_BLUE, marginBottom: 6 },
  subtitle: { fontSize: 14, color: MUTED, textAlign: "center", paddingHorizontal: 12 },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: "center", marginBottom: 32, marginTop: 20 },
  logo: { width: 200, height: 140 },
  welcomeText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A365D",
    marginBottom: 8,
  },
  formContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#002D73",
    marginBottom: 8,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 12,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  eyeBtn: { 
    padding: 6,
    marginLeft: 8,
  },
  inputIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginBottom: 32,
  },
  socialButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CBD5E0",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4299E1",
    borderColor: "#4299E1",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rememberText: {
    fontSize: 14,
    color: "#4A5568",
  },
  forgotText: {
    color: "#002D73",
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#002D73",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#4299E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    fontSize: 14,
    color: "#A0AEC0",
    marginHorizontal: 16,
  },
  socialContainer: {
    alignItems: "center",
  },
  socialText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3748",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  signUpText: {
    fontSize: 14,
    color: "#718096",
  },
  signUpLink: {
    color: "#002D73",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#A0AEC0",
  },
});
