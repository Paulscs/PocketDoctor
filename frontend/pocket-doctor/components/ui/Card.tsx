import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({
  children,
  title,
  subtitle,
  onPress,
  style,
  variant = "default",
}: CardProps) {
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1a1a1a" },
    "background"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text"
  );
  const borderColor = useThemeColor(
    { light: "#e0e0e0", dark: "#333333" },
    "icon"
  );

  const cardStyle = useMemo(() => {
    const baseStyle = [styles.card, { backgroundColor }];

    switch (variant) {
      case "elevated":
        return [...baseStyle, styles.elevated];
      case "outlined":
        return [...baseStyle, { borderWidth: 1, borderColor }];
      default:
        return baseStyle;
    }
  }, [variant, backgroundColor, borderColor]);

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[...cardStyle, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <ThemedText style={[styles.title, { color: textColor }]}>
              {title}
            </ThemedText>
          )}
          {subtitle && (
            <ThemedText
              style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>
      )}
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
