import React from "react";
import { View, TextInput, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

interface InputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  icon?: string;
  error?: string;
  style?: ViewStyle;
  rightComponent?: React.ReactNode;
}

export function Input({
  label,
  placeholder,
  value = "",
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  icon,
  error,
  style,
  rightComponent,
}: InputProps) {
  const backgroundColor = useThemeColor(
    { light: "#FFFFFF", dark: "#1a1a1a" },
    "card"
  );
  const textColor = useThemeColor(
    { light: "#2D3748", dark: "#ffffff" },
    "text"
  );
  const placeholderColor = useThemeColor(
    { light: "#999", dark: "#8E8E93" },
    "icon"
  );
  const borderColor = useThemeColor(
    { light: "#E2E8F0", dark: "#38383A" },
    "border"
  );
  const errorColor = useThemeColor(
    { light: "#FF3B30", dark: "#FF453A" },
    "danger"
  );

  return (
    <View style={[styles.container, style]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
        {icon && (
          <IconSymbol
            name={icon as keyof typeof IconSymbol}
            size={20}
            color={placeholderColor}
          />
        )}
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
        {rightComponent ? (
          <View style={styles.rightWrapper}>{rightComponent}</View>
        ) : null}
      </View>
      {error && (
        <ThemedText style={[styles.error, { color: errorColor }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  rightWrapper: {
    marginLeft: 8,
    alignSelf: "center",
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
});
