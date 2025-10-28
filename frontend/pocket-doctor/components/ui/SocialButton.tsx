import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  provider: "google" | "microsoft" | "apple";
  onPress?: () => void;
};

const iconMap: Record<
  string,
  { name: keyof typeof Ionicons.glyphMap; color: string }
> = {
  google: { name: "logo-google", color: "#DB4437" },
  microsoft: { name: "logo-windows", color: "#0078D6" },
  apple: { name: "logo-apple", color: "#000000" },
};

export default function SocialButton({ provider, onPress }: Props) {
  const info = iconMap[provider];
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.circle}>
        <Ionicons name={info.name} size={22} color={info.color} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECEFF5",
  },
});
