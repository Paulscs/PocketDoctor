import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

interface BottomNavigationProps {
  readonly activeTab: string;
  readonly onTabPress: (tabId: string) => void;
  readonly tabs: readonly TabItem[];
}

export function BottomNavigation({
  activeTab,
  onTabPress,
  tabs,
}: BottomNavigationProps) {
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.surface },
    "background"
  );
  const activeColor = useThemeColor(
    { light: Colors.light.brandBlue, dark: Colors.dark.brandBlue },
    "tint"
  );
  const inactiveColor = useThemeColor(
    { light: Colors.light.muted, dark: Colors.dark.muted },
    "icon"
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
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
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityHint={`Navegar a ${tab.label}`}
            >
              <IconSymbol
                name={tab.icon as keyof typeof IconSymbol}
                size={24}
                color={color}
              />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  navigation: {
    flexDirection: "row",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.light.friendlyBlueBg,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
    fontWeight: "500",
  },
  activeTabLabel: {
    fontWeight: "600",
  },
});
