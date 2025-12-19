import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { helpCategories, HelpArticle } from '@/data/helpContent';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HelpCategoryScreen() {
    const { category: categoryId } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const category = helpCategories.find(c => c.id === categoryId);

    if (!category) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Categoría no encontrada.</ThemedText>
            </ThemedView>
        );
    }

    const renderArticleItem = ({ item }: { item: HelpArticle }) => (
        <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.icon + '20' }]}
            onPress={() => router.push(`/help/article/${item.id}`)}
        >
            <View style={styles.itemContent}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                {/* Preview of content could go here if desired */}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: category.title }} />

            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
                    <Ionicons name={category.icon as any} size={40} color={colors.tint} />
                </View>
                <ThemedText type="subtitle" style={styles.description}>{category.description}</ThemedText>
            </View>

            <FlatList
                data={category.articles}
                renderItem={renderArticleItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    description: {
        textAlign: 'center',
        opacity: 0.8,
    },
    list: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    itemContent: {
        flex: 1,
        paddingRight: 16,
    },
});
