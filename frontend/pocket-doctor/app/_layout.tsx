import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="upload"
          options={{ presentation: "modal", title: "Cargar Resultados" }}
        />
        <Stack.Screen
          name="analytics"
          options={{ presentation: "modal", title: "Analíticas AI" }}
        />
        <Stack.Screen
          name="recommendations"
          options={{ presentation: "modal", title: "Recomendaciones" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
