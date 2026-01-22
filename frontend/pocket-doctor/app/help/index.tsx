import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { helpCategories, HelpCategory } from '@/data/helpContent';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HelpCenterScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const backgroundColor = Colors.light.white;

    const renderCategory = ({ item }: { item: HelpCategory }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(`/help/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer]}>
                    <Ionicons name={item.icon as any} size={28} color={Colors.light.medicalBlue} />
                </View>
                <View style={styles.cardTextContent}>
                    <ThemedText style={styles.cardTitle}>{t(`help.categories.${item.id}.title`)}</ThemedText>
                    <ThemedText style={styles.cardDesc} numberOfLines={2}>
                        {t(`help.categories.${item.id}.description`)}
                    </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.medicalBlue} style={styles.chevron} />
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen
                options={{
                    title: "",
                    headerBackTitle: t('common.back'),
                    headerStyle: { backgroundColor: Colors.light.white },
                    headerShadowVisible: false,
                    headerTintColor: Colors.light.brandBlue,
                    headerTitleStyle: {
                        color: Colors.light.brandBlue,
                        fontWeight: '700',
                    }
                }}
            />

            <View style={styles.header}>
                <ThemedText style={styles.title}>{t('help.ui.subtitle')}</ThemedText>
                <ThemedText style={styles.subtitle}>
                    {t('help.ui.description')}
                </ThemedText>
            </View>

            <FlatList
                data={helpCategories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
                showsVerticalScrollIndicator={false}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
        backgroundColor: Colors.light.white,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: Colors.light.brandBlue,
        letterSpacing: -0.5,
        paddingBottom: 8,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.gray,
        lineHeight: 22,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
    },
    card: {
        backgroundColor: Colors.light.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        shadowColor: Colors.light.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.light.borderGray,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    cardTextContent: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.brandBlue,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        color: Colors.light.gray,
        lineHeight: 20,
    },
    chevron: {
        marginLeft: 4,
    }
});
