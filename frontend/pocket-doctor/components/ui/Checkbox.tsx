import React from "react";
import { TouchableOpacity, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
  style?: ViewStyle;
}

export function Checkbox({ checked, onPress, label, style }: CheckboxProps) {
  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "primary"
  );
  const borderColor = useThemeColor(
    { light: "#E0E0E0", dark: "#38383A" },
    "border"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text"
  );

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: checked ? primaryColor : borderColor },
          checked && { backgroundColor: primaryColor },
        ]}
      >
        {checked && <IconSymbol name="checkmark" size={16} color="#ffffff" />}
      </View>
      <ThemedText style={[styles.label, { color: textColor }]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
