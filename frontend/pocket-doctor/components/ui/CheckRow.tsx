import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  checked: boolean;
  onToggle: () => void;
  text: string;
  linkText?: string;
  onPressLink?: () => void;
  afterLinkText?: string;
  privacyText?: string;
  onPressPrivacy?: () => void;
};

export default function CheckRow({ checked, onToggle, text, linkText, onPressLink, afterLinkText, privacyText, onPressPrivacy }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.check, styles.roundCheck, checked && styles.checkedRound]} onPress={onToggle}>
        {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </TouchableOpacity>

      <View style={styles.textBlock}>
        <Text style={styles.text}>
          {text}
          {linkText && (
            <Text style={styles.link} onPress={onPressLink}>
              {linkText}
            </Text>
          )}
          {afterLinkText}
          {privacyText && (
            <Text style={styles.link} onPress={onPressPrivacy}>
              {privacyText}
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", marginVertical: 16 },
  check: { marginRight: 12, paddingTop: 2 },
  roundCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedRound: {
    backgroundColor: "#002D73",
    borderColor: "#002D73",
  },
  textBlock: { flex: 1 },
  text: { color: "#6B7280", fontSize: 13, lineHeight: 18 },
  link: { color: "#002D73", fontWeight: "600" },
});
