import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
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
import "@/src/i18n";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGlobalFont } from "@/hooks/useGlobalFont";
import { useAuthStore } from "@/src/store/authStore";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Suppress all logs for demo video
LogBox.ignoreAllLogs(true);

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

  // Auth Guard
  // Auth Guard
  const segments = useSegments();
  const router = useRouter();
  const { session, isInitialized, initialize } = useAuthStore();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loaded || !isInitialized || !rootNavigationState?.key) return;

    // Define public routes that don't require authentication
    // segments[0] for root files like index.tsx, login.tsx etc.
    const inTabsGroup = segments[0] === "(tabs)";
    const currentRoute = segments[0];

    // Routes that are strictly for unauthenticated users (like login/register)
    // "index" maps to app/index.tsx (which we use as login wrapper)
    // "login", "register", "forgot-password" are public
    const isPublicRoute =
      currentRoute === undefined || // root /
      currentRoute === "login" ||
      currentRoute === "register" ||
      currentRoute === "forgot-password";

    console.log("[AuthGuard] Checking...", {
      isInitialized,
      hasSession: !!session,
      segment: currentRoute,
      isPublicRoute,
      inTabsGroup
    });

    if (session && isPublicRoute) {
      // User is logged in but trying to access public auth pages -> Go Home
      console.log("[AuthGuard] Session active, redirecting from public route to Home");
      router.replace("/(tabs)/home");
    } else if (!session && !isPublicRoute) {
      // User is NOT logged in but trying to access protected route (tabs, upload, etc) -> Go Login
      console.log("[AuthGuard] No session, redirecting from protected route to Login");
      router.replace("/");
    }
  }, [session, segments, loaded, isInitialized, rootNavigationState?.key]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="validate-data" options={{ headerShown: false }} />
          <Stack.Screen name="recommendations" options={{ headerShown: false }} />
          <Stack.Screen name="ai-analytics" options={{ headerShown: false }} />
          <Stack.Screen name="upload" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
