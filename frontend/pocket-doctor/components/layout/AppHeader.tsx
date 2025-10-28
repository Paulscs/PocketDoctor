import React from "react";
import { View, StyleSheet, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  rightComponent?: React.ReactNode;
}

export function AppHeader({
  title,
  showLogo = true,
  rightComponent,
}: AppHeaderProps) {
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1a1a1a" },
    "background"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text"
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logoBlack.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.logoText, { color: textColor }]}>
              Pocket Doctor
            </ThemedText>
          </View>
        )}

        {title && (
          <ThemedText style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>
        )}

        {rightComponent && (
          <View style={styles.rightContainer}>{rightComponent}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
