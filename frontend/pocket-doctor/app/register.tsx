// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import CheckRow from "@/components/ui/CheckRow";
import { router } from "expo-router";

// import ThemeProvider

const BRAND_BLUE = "#002D73";
const MUTED = "#52607A";

function RegisterScreenInner() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("ejemplo@gmail.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const onRegister = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (!accepted) {
      alert("Debe aceptar los Términos y Condiciones y Política de Privacidad.");
      return;
    }
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image source={require("@/assets/images/aloneLogo.png")} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.header}>
            <ThemedText style={styles.title}>Crear Cuenta</ThemedText>
            <ThemedText style={styles.subtitle}>Unos pocos pasos y estará listo para comenzar.</ThemedText>
          </View>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Nombres</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Introduzca sus nombres"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.inputLabel}>Apellidos</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Introduzca sus apellidos"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.inputLabel}>Correo electrónico</Text>
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

            <Text style={styles.inputLabel}>Confirmar contraseña</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Confirme su contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={secureConfirm}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeBtn}>
                <Ionicons name={secureConfirm ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>


            <CheckRow
              checked={accepted}
              onToggle={() => setAccepted(!accepted)}
              text="Al registrarme, confirmo que he leído y acepto nuestros "
              linkText="Términos y Condiciones"
              onPressLink={() => Linking.openURL("https://example.com/terms")}
              afterLinkText=" y nuestra "
              privacyText="Política de Privacidad"
              onPressPrivacy={() => Linking.openURL("https://example.com/privacy")}
            />

            <TouchableOpacity 
              style={[styles.registerButton, accepted && styles.registerButtonActive]} 
              onPress={onRegister} 
              disabled={!accepted}
            >
              <Text style={[styles.registerButtonText, accepted && styles.registerButtonTextActive]}>Registrarme</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>O regístrese con</Text>
              <View style={styles.dividerLine} />
            </View>

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

            <View style={styles.signInRow}>
              <Text style={styles.signInText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.signInLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Wrapper: envuelve sólo esta pantalla con ThemeProvider (útil para pruebas)
export default function RegisterScreen() {
  return (
      <RegisterScreenInner />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  logoContainer: { alignItems: "center", marginBottom: 32, marginTop: 20 },
  logo: { width: 200, height: 140 },
  header: { alignItems: "center", marginVertical: 12 },
  title: { fontSize: 28, fontWeight: "700", color: BRAND_BLUE, marginBottom: 6 },
  subtitle: { fontSize: 14, color: MUTED, textAlign: "center", paddingHorizontal: 12 },
  form: { marginTop: 6 },
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
  registerButton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 25,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  registerButtonActive: {
    backgroundColor: "#002D73",
  },
  registerButtonText: {
    color: "#9AA4B2",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButtonTextActive: {
    color: "#FFFFFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  orText: {
    color: "#9AA4B2",
    fontSize: 14,
    marginHorizontal: 16,
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
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    color: "#6B7280",
    fontSize: 14,
  },
  signInLink: {
    color: "#002D73",
    fontWeight: "600",
    fontSize: 14,
  },
});
