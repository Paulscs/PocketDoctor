import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { router } from 'expo-router';

interface UserAvatarProps {
    size?: number;
    style?: ViewStyle;
    textStyle?: TextStyle;
    onPress?: () => void;
}

export function UserAvatar({ size = 32, style, textStyle, onPress }: UserAvatarProps) {
    const { user, userProfile } = useAuthStore();

    const initial = React.useMemo(() => {
        if (userProfile?.nombre) {
            return userProfile.nombre.charAt(0).toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return "A";
    }, [user, userProfile]);

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            // Default navigation to profile
            router.push("/(tabs)/profile");
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { width: size, height: size, borderRadius: size / 2 },
                style
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
            accessibilityLabel="Ir al perfil"
            accessibilityRole="button"
            accessibilityHint="Navega a la pantalla de perfil"
        >
            <ThemedText style={[styles.text, { fontSize: size * 0.45 }, textStyle]}>
                {initial}
            </ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.brandBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontWeight: '700',
        color: Colors.light.white,
    },
});
