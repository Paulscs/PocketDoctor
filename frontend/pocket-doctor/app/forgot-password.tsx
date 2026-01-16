import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Pressable, // Importante para detectar el toque en los cuadros
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

// IMPORTANTE: Ajusta esta ruta a donde tengas tu cliente de supabase
import { supabase } from "@/src/lib/supabase";
import { useTranslation } from "react-i18next";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Nuevo estado para el foco visual
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Referencia para el input oculto
  const inputRef = useRef<TextInput>(null);

  // --- VALIDACIONES ---
  const validateEmail = useCallback(() => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.forgot_password.error_email_required'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('common.error'), t('auth.login.error_invalid_email'));
      return false;
    }
    return true;
  }, [email]);

  const validateCode = useCallback(() => {
    if (!code.trim() || code.length !== 6) {
      Alert.alert(t('common.error'), t('auth.forgot_password.error_code_required'));
      return false;
    }
    return true;
  }, [code]);

  const validatePasswords = useCallback(() => {
    if (!newPassword.trim()) {
      Alert.alert(t('common.error'), t('auth.forgot_password.error_password_required'));
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert(t('common.error'), t('auth.forgot_password.error_password_length'));
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.forgot_password.error_password_mismatch'));
      return false;
    }
    return true;
  }, [newPassword, confirmPassword]);

  // --- LÓGICA SUPABASE ---

  // 1. Enviar el código al correo
  const handleSendCode = useCallback(async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      // Si todo sale bien, pasamos al siguiente paso
      setCurrentStep("code");
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || "No se pudo enviar el código.");
    } finally {
      setLoading(false);
    }
  }, [validateEmail, email]);

  // 2. Verificar el código OTP
  const handleVerifyCode = useCallback(async () => {
    if (!validateCode()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: "recovery", // Importante: recovery para reset de password
      });

      if (error) throw error;

      // Al verificar, Supabase inicia sesión automáticamente.
      setCurrentStep("password");
    } catch (error: any) {
      Alert.alert(t('common.error'), "El código es incorrecto o ha expirado.");
    } finally {
      setLoading(false);
    }
  }, [validateCode, email, code]);

  // 3. Actualizar la contraseña (Usuario ya autenticado)
  const handleUpdatePassword = useCallback(async () => {
    if (!validatePasswords()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || "No se pudo actualizar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  }, [validatePasswords, newPassword]);

  // Reenviar código
  const handleResendCode = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      Alert.alert(
        t('auth.forgot_password.code_resent_title'),
        t('auth.forgot_password.code_resent_message')
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), "Espera un momento antes de solicitar otro código.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.replace("/login");
  };

  // --- RENDERS ---

  const renderEmailStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{t('auth.forgot_password.title')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.forgot_password.subtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('auth.forgot_password.email_label')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.login.email_placeholder')}
            placeholderTextColor={Colors.light.placeholderGray}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
            value={email}
            onChangeText={setEmail}
          />
          <Ionicons name="mail-outline" size={18} color={Colors.light.gray} />
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
            {loading ? t('auth.forgot_password.sending') : t('auth.forgot_password.submit_email')}
          </Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.linkText}>{t('auth.forgot_password.back_to_login')}</Text>
          </TouchableOpacity>
        </View>
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
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.light.brandBlue}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t('auth.forgot_password.code_title')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.forgot_password.code_subtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Envoltura Pressable para recuperar el foco al tocar los cuadros */}
        <Pressable
          style={styles.codeContainer}
          onPress={() => inputRef.current?.focus()}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            // Es activo si el teclado está abierto y coincide con la posición del cursor
            const isActive = isInputFocused && code.length === index;

            return (
              <View
                key={index}
                style={[
                  styles.codeInput,
                  isActive && styles.codeInputFocused // Aplica borde azul si es el activo
                ]}
              >
                <Text style={styles.codeText}>{code[index] || ""}</Text>
              </View>
            );
          })}
        </Pressable>

        {/* Input oculto conectado con ref */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          autoFocus
          editable={!loading}
          // Manejadores de foco para el estilo visual
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />

        <TouchableOpacity
          style={[
            styles.button,
            (code.length !== 6 || loading) && styles.buttonDisabled,
          ]}
          onPress={handleVerifyCode}
          disabled={code.length !== 6 || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('auth.forgot_password.verifying') : t('auth.forgot_password.verify_code')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendCode} disabled={loading}>
          <Text style={styles.linkText}>{t('auth.forgot_password.resend_code')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{t('auth.forgot_password.new_password_title')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.forgot_password.new_password_subtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('auth.forgot_password.new_password_label')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.forgot_password.new_password_placeholder')}
            placeholderTextColor={Colors.light.placeholderGray}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            editable={!loading}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={Colors.light.gray}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{t('auth.forgot_password.confirm_password_label')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.forgot_password.confirm_password_placeholder')}
            placeholderTextColor={Colors.light.placeholderGray}
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
            editable={!loading}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword((p) => !p)}>
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={Colors.light.gray}
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
            {loading ? t('auth.forgot_password.updating') : t('auth.forgot_password.update_password')}
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
              color={Colors.light.success}
            />
          </View>
          <Text style={styles.modalTitle}>{t('auth.forgot_password.success_title')}</Text>
          <Text style={styles.modalMessage}>
            {t('auth.forgot_password.success_message')}
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleSuccessConfirm}
          >
            <Text style={styles.modalButtonText}>{t('auth.forgot_password.go_to_login')}</Text>
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
  container: { flex: 1, backgroundColor: Colors.light.white },
  content: { flexGrow: 1 },

  header: {
    alignItems: "flex-start",
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
    padding: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    marginBottom: 8,
    textAlign: "left",
  },
  subtitle: {
    color: Colors.light.gray,
    fontSize: 14,
    textAlign: "left",
    lineHeight: 20,
  },

  form: {
    marginTop: 12,
    paddingHorizontal: 24,
  },
  label: {
    color: Colors.light.brandBlue,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
    paddingVertical: 8,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.textGray,
    paddingVertical: 4,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },

  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.borderGray,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.white,
  },
  // Estilo para el cuadrito activo
  codeInputFocused: {
    borderColor: Colors.light.brandBlue,
    borderWidth: 2,
    backgroundColor: "#F0F8FF",
  },
  codeText: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },

  button: {
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.lightBlue,
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
  },

  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  linkText: {
    color: Colors.light.brandBlue,
    fontSize: 13,
    textDecorationLine: "underline",
    textAlign: "center"
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.white,
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
    color: Colors.light.textGray,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.light.gray,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: Colors.light.lightBlue,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
  },
});