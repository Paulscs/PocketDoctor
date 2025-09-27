import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

interface TabItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  tabs: TabItem[];
}

export function BottomNavigation({
  activeTab,
  onTabPress,
  tabs,
}: BottomNavigationProps) {
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1a1a1a" },
    "background"
  );
  const activeColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );
  const inactiveColor = useThemeColor(
    { light: "#8E8E93", dark: "#8E8E93" },
    "icon"
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["bottom"]}
    >
      <View style={styles.navigation}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const color = isActive ? activeColor : inactiveColor;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <IconSymbol name={tab.icon as any} size={24} color={color} />
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color },
                  isActive && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
  },
  navigation: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  activeTabLabel: {
    fontWeight: "600",
  },
});
