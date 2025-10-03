import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1a1a1a" },
    "background"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text"
  );

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];

    switch (variant) {
      case "primary":
        return [...baseStyle, { backgroundColor: primaryColor }];
      case "secondary":
        return [
          ...baseStyle,
          {
            backgroundColor: backgroundColor,
            borderWidth: 1,
            borderColor: "#e0e0e0",
          },
        ];
      case "outline":
        return [
          ...baseStyle,
          {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: primaryColor,
          },
        ];
      default:
        return [...baseStyle, { backgroundColor: primaryColor }];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return { color: "#ffffff" };
      case "secondary":
        return { color: textColor };
      case "outline":
        return { color: primaryColor };
      default:
        return { color: "#ffffff" };
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#ffffff" : primaryColor}
        />
      ) : (
        <ThemedText
          style={[styles.buttonText, styles[`${size}Text`], getTextStyle()]}
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
