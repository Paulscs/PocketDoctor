import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import 'react-native-url-polyfill/auto';
import {
  Pridi_400Regular,
  Pridi_500Medium,
  Pridi_700Bold,
} from "@expo-google-fonts/pridi";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGlobalFont } from "@/hooks/useGlobalFont";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useGlobalFont(); // Apply Pridi font globally

  const [loaded] = useFonts({
    Pridi_400Regular,
    Pridi_500Medium,
    Pridi_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="validate-data" options={{ headerShown: false }} />
        <Stack.Screen name="recommendations" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
