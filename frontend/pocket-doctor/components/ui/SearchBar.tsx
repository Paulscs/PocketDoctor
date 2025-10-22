import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  style?: ViewStyle;
}

export function SearchBar({
  placeholder = "Buscar...",
  value = "",
  onChangeText,
  onSearch,
  onClear,
  style,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1a1a1a" },
    "background"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text"
  );
  const placeholderColor = useThemeColor(
    { light: "#8E8E93", dark: "#8E8E93" },
    "icon"
  );
  const borderColor = useThemeColor(
    { light: "#e0e0e0", dark: "#333333" },
    "icon"
  );

  const handleTextChange = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
  };

  const handleSearch = () => {
    onSearch?.(internalValue);
  };

  const handleClear = () => {
    setInternalValue("");
    onChangeText?.("");
    onClear?.();
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }, style]}>
      <View style={styles.inputContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={placeholderColor} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={internalValue}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {internalValue.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <IconSymbol
              name="xmark.circle.fill"
              size={20}
              color={placeholderColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
});
