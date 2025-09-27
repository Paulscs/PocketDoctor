import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("ejemplo@gmail.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("0");
  const [gender, setGender] = useState("");

  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "primary"
  );
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1a1a1a" },
    "background"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text"
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.brandText}>POCKET DOCTOR</ThemedText>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Crear Cuenta
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Únete al futuro de asistencia médica IA
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nombres"
              placeholder="Introduzca sus nombres"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Input
              label="Apellidos"
              placeholder="Introduzca sus apellidos"
              value={lastName}
              onChangeText={setLastName}
            />

            <Input
              label="Correo Electrónico"
              placeholder="ejemplo@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="envelope"
            />

            <Input
              label="Contraseña"
              placeholder="Escriba su contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock"
            />

            <Input
              label="Confirmar contraseña"
              placeholder="Confirme su contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon="lock"
            />

            <Input
              label="Edad"
              placeholder="0"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />

            <Input
              label="Género"
              placeholder="Seleccione su género"
              value={gender}
              onChangeText={setGender}
            />

            <Button
              title="Registrarme"
              onPress={() => router.push("/(tabs)")}
              style={styles.registerButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 64,
    marginBottom: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    marginBottom: 32,
  },
  registerButton: {
    marginTop: 16,
  },
});
