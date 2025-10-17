import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  BORDER: "#D1D5DB",
  MUTED: "#6B7280",
  WHITE: "#FFFFFF",
  BLACK: "#111827",
  PLACEHOLDER: "#9CA3AF",
  DIVIDER: "#E5E7EB",
  SUCCESS: "#34C759",
} as const;

const SIZES = {
  ICON: 18,
  BORDER_RADIUS: 8,
  PADDING: 24,
} as const;

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordScreen() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { forgotPassword } = useAuth();

  const validateEmail = useCallback(() => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor, ingresa tu correo electrónico");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Por favor, ingresa un correo electrónico válido");
      return false;
    }
    return true;
  }, [email]);

  const validateCode = useCallback(() => {
    if (!code.trim() || code.length !== 4) {
      Alert.alert("Error", "Por favor, ingresa el código de 4 dígitos");
      return false;
    }
    return true;
  }, [code]);

  const validatePasswords = useCallback(() => {
    if (!newPassword.trim()) {
      Alert.alert("Error", "Por favor, ingresa tu nueva contraseña");
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }
    return true;
  }, [newPassword, confirmPassword]);

  const handleSendCode = useCallback(async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      const success = await forgotPassword(email);
      if (success) {
        setCurrentStep("code");
      }
    } catch {
      Alert.alert("Error", "No se pudo enviar el código. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [validateEmail, email, forgotPassword]);

  const handleVerifyCode = useCallback(async () => {
    if (!validateCode()) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep("password");
    } catch {
      Alert.alert("Error", "Código inválido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [validateCode]);

  const handleUpdatePassword = useCallback(async () => {
    if (!validatePasswords()) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccessModal(true);
    } catch {
      Alert.alert(
        "Error",
        "No se pudo actualizar la contraseña. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, [validatePasswords]);

  const handleResendCode = useCallback(async () => {
    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert(
        "Código Reenviado",
        "Se ha enviado un nuevo código a tu correo"
      );
    } catch {
      Alert.alert("Error", "No se pudo reenviar el código. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [email, forgotPassword]);

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push("/login");
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo y te enviaremos un código para reestablecerla.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={COLORS.PLACEHOLDER}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
            value={email}
            onChangeText={setEmail}
          />
          <Ionicons
            name="mail-outline"
            size={SIZES.ICON}
            color={COLORS.MUTED}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!email.trim() || loading) && styles.buttonDisabled,
          ]}
          onPress={handleSendCode}
          disabled={!email.trim() || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Enviando..." : "Enviar"}
          </Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.linkText}>Volver a Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.linkText}>Volver a Registrarme</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          No compartimos tu información con terceros. Tu seguridad es nuestra
          prioridad.
        </Text>
      </View>
    </>
  );

  const renderCodeStep = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep("email")}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BRAND_BLUE} />
        </TouchableOpacity>
        <Text style={styles.title}>Ingresa el código</Text>
        <Text style={styles.subtitle}>
          Revisa tu correo y escribe el código que te enviamos para reestablecer
          tu contraseña.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.codeContainer}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={styles.codeInput}>
              <Text style={styles.codeText}>{code[index] || ""}</Text>
            </View>
          ))}
        </View>

        <TextInput
          style={styles.hiddenInput}
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={4}
          autoFocus
        />

        <TouchableOpacity
          style={[
            styles.button,
            (code.length !== 4 || loading) && styles.buttonDisabled,
          ]}
          onPress={handleVerifyCode}
          disabled={code.length !== 4 || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verificando..." : "Verificar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendCode} disabled={loading}>
          <Text style={styles.linkText}>¿No recibiste el código? Reenviar</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep("code")}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BRAND_BLUE} />
        </TouchableOpacity>
        <Text style={styles.title}>Crear nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Escribe tu nueva contraseña y confírmala para continuar.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nueva contraseña</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={COLORS.PLACEHOLDER}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            editable={!loading}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={SIZES.ICON}
              color={COLORS.MUTED}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirma contraseña</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Confirma tu contraseña"
            placeholderTextColor={COLORS.PLACEHOLDER}
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
            editable={!loading}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(p => !p)}>
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={SIZES.ICON}
              color={COLORS.MUTED}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!newPassword.trim() || !confirmPassword.trim() || loading) &&
              styles.buttonDisabled,
          ]}
          onPress={handleUpdatePassword}
          disabled={!newPassword.trim() || !confirmPassword.trim() || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Actualizando..." : "Actualizar"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSuccessModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={COLORS.SUCCESS}
            />
          </View>
          <Text style={styles.modalTitle}>¡Listo!</Text>
          <Text style={styles.modalMessage}>
            Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con
            tu nueva contraseña.
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleSuccessConfirm}
          >
            <Text style={styles.modalButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === "email" && renderEmailStep()}
        {currentStep === "code" && renderCodeStep()}
        {currentStep === "password" && renderPasswordStep()}
      </ScrollView>
      {renderSuccessModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  content: { flexGrow: 1 },

  header: {
    alignItems: "flex-start",
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: SIZES.PADDING,
  },
  backButton: {
    marginBottom: 16,
    padding: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    marginBottom: 8,
    textAlign: "left",
  },
  subtitle: {
    color: COLORS.MUTED,
    fontSize: 14,
    textAlign: "left",
    lineHeight: 20,
  },

  form: {
    marginTop: 12,
    paddingHorizontal: SIZES.PADDING,
  },
  label: {
    color: COLORS.BRAND_BLUE,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingVertical: 8,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.BLACK,
    paddingVertical: 4,
  },
  hiddenInput: {
    position: "absolute",
    left: -1000,
    opacity: 0,
  },

  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
  },
  codeText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
  },

  button: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: COLORS.LIGHT_BLUE,
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },

  linksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  linkText: {
    color: COLORS.BRAND_BLUE,
    fontSize: 13,
    textDecorationLine: "underline",
  },

  footer: {
    marginTop: "auto",
    paddingTop: 20,
    paddingHorizontal: SIZES.PADDING,
  },
  footerText: {
    color: COLORS.MUTED,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  successIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: COLORS.LIGHT_BLUE,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
});
