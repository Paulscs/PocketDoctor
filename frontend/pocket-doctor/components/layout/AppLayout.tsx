import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { AppHeader } from "./AppHeader";
import { BottomNavigation } from "./BottomNavigation";
import { useThemeColor } from "@/hooks/use-theme-color";

interface TabItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  showHeader?: boolean;
  showBottomNavigation?: boolean;
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
  tabs?: TabItem[];
  scrollable?: boolean;
  headerRightComponent?: React.ReactNode;
}

export function AppLayout({
  children,
  headerTitle,
  showHeader = true,
  showBottomNavigation = true,
  activeTab,
  onTabPress,
  tabs = [],
  scrollable = true,
  headerRightComponent,
}: AppLayoutProps) {
  const backgroundColor = useThemeColor(
    { light: "#f8f9fa", dark: "#000000" },
    "background"
  );

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? {
        style: styles.scrollContent,
        contentContainerStyle: styles.scrollContentContainer,
        showsVerticalScrollIndicator: false,
      }
    : { style: styles.content };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showHeader && (
        <AppHeader title={headerTitle} rightComponent={headerRightComponent} />
      )}

      <ContentWrapper {...contentProps}>{children}</ContentWrapper>

      {showBottomNavigation && tabs.length > 0 && (
        <BottomNavigation
          activeTab={activeTab || ""}
          onTabPress={onTabPress || (() => {})}
          tabs={tabs}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
});
