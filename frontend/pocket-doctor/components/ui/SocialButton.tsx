import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  style?: any;
}

export function SocialButton({
  title,
  onPress,
  icon,
  style,
}: SocialButtonProps) {
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1a1a1a" },
    "background"
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
      style={[styles.button, { backgroundColor, borderColor }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <IconSymbol name={icon as any} size={20} color={textColor} />}
      <ThemedText style={[styles.buttonText, { color: textColor }]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
