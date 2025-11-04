import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

interface CheckRowProps {
  checked: boolean;
  onToggle: () => void;
  text: string;
  linkText?: string;
  onPressLink?: () => void;
  afterLinkText?: string;
  privacyText?: string;
  onPressPrivacy?: () => void;
}

export default function CheckRow({
  checked,
  onToggle,
  text,
  linkText,
  onPressLink,
  afterLinkText,
  privacyText,
  onPressPrivacy,
}: CheckRowProps) {
  const primaryColor = useThemeColor(
    { light: "#002D73", dark: "#0A84FF" },
    "primary"
  );
  const textColor = useThemeColor(
    { light: "#6B7280", dark: "#A0A0A0" },
    "text"
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggle} style={styles.checkboxContainer}>
        <View
          style={[
            styles.checkbox,
            checked && { backgroundColor: primaryColor, borderColor: primaryColor },
          ]}
        >
          {checked && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>

      {/* 👇 Todo el copy en UN solo <Text> para evitar strings sueltos */}
      <Text style={[styles.text, { color: textColor, flex: 1 }]}>
        {text}
        {linkText ? (
          <Text style={styles.link} onPress={onPressLink}>
            {linkText}
          </Text>
        ) : null}
        {afterLinkText ?? ""}
        {privacyText ? (
          <Text style={styles.link} onPress={onPressPrivacy}>
            {privacyText}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-start", marginVertical: 12 },
  checkboxContainer: { marginRight: 10, marginTop: 2 },
  checkbox: {
    width: 18, height: 18, borderRadius: 50, borderWidth: 1, borderColor: "#D1D5DB",
    justifyContent: "center", alignItems: "center",
  },
  text: { fontSize: 12, lineHeight: 18 },
  link: { color: "#002D73", fontWeight: "600", textDecorationLine: "underline" },
});
