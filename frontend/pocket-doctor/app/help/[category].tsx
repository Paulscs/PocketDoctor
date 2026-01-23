import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { helpCategories, HelpArticle } from '@/data/helpContent';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HelpCategoryScreen() {
    const { category: categoryId } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const backgroundColor = Colors.light.white;

    const category = helpCategories.find(c => c.id === categoryId);

    if (!category) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>{t('help.ui.category_not_found')}</ThemedText>
            </ThemedView>
        );
    }

    const renderArticleItem = ({ item }: { item: HelpArticle }) => (
        <TouchableOpacity
            style={styles.item}
            activeOpacity={0.7}
            onPress={() => router.push(`/help/article/${item.id}`)}
        >
            <View style={[styles.itemIcon, { backgroundColor: Colors.light.white }]}>
                <Ionicons name="document-text-outline" size={20} color={Colors.light.medicalBlue} />
            </View>
            <View style={styles.itemContent}>
                <ThemedText style={styles.itemTitle}>{t(`help.categories.${categoryId}.articles.${item.id}.title`)}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.medicalBlue} />
        </TouchableOpacity>
    );

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen
                options={{
                    title: "",
                    headerShadowVisible: false,
                    
                }}
            />

            <View style={styles.header}>
                <View style={[styles.headerIconContainer]}>
                    <Ionicons name={category.icon as any} size={32} color={Colors.light.medicalBlue} />
                </View>
                <ThemedText style={styles.headerTitle}>{t(`help.categories.${categoryId}.title`)}</ThemedText>
                <ThemedText style={styles.description}>{t(`help.categories.${categoryId}.description`)}</ThemedText>
            </View>

            <View style={styles.listContainer}>
                <FlatList
                    data={category.articles}
                    renderItem={renderArticleItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: Spacing.xl,
        alignItems: 'center',
        backgroundColor: Colors.light.white,
        marginBottom: Spacing.md,
    },
    headerIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.light.brandBlue,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        color: Colors.light.gray,
        fontSize: 16,
        paddingHorizontal: Spacing.lg,
        lineHeight: 22,
    },
    listContainer: {
        flex: 1,
        backgroundColor: Colors.light.white,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
    },
    list: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    itemIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.borderGray,
    },
    itemContent: {
        flex: 1,
        marginRight: Spacing.md,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.light.borderGray,
    }
});
