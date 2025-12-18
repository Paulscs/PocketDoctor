import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        // This route is primarily for deep linking to have a valid target.
        // AuthSession or Supabase should handle the session exchange,
        // but if we land here, we can redirect to home/login after a short delay.
        const timer = setTimeout(() => {
            router.replace("/(tabs)"); // Or wherever you want them to go
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 20 }}>Autenticando...</Text>
        </View>
    );
}
