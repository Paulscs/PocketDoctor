import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { helpCategories, HelpCategory } from '@/data/helpContent';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HelpCenterScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const renderCategory = ({ item }: { item: HelpCategory }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.background, borderColor: colors.icon }]}
            onPress={() => router.push(`/help/${item.id}`)}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name={item.icon as any} size={32} color={colors.tint} />
            </View>
            <ThemedText type="subtitle" style={styles.cardTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.cardDesc} numberOfLines={2}>{item.description}</ThemedText>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Centro de Ayuda', headerBackTitle: 'Atrás' }} />

            <View style={styles.header}>
                <ThemedText type="title">¿Cómo podemos ayudarte?</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Encuentra guías, respuestas y consejos para usar Pocket Doctor.
                </ThemedText>
            </View>

            <FlatList
                data={helpCategories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                numColumns={1}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    subtitle: {
        marginTop: 8,
        opacity: 0.7,
    },
    listContent: {
        paddingBottom: 32,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        opacity: 0.9,
        flexDirection: 'column',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        opacity: 0.7,
    },
});
