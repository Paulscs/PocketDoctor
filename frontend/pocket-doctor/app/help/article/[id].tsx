import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { helpCategories } from '@/data/helpContent';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HelpArticleScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { t } = useTranslation();

    // Find article across all categories to get the category ID
    let article: any;
    let categoryId: string = "";

    for (const cat of helpCategories) {
        const found = cat.articles.find(a => a.id === id);
        if (found) {
            article = found;
            categoryId = cat.id;
            break;
        }
    }

    if (!article) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>{t('help.ui.article_not_found')}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: t('help.ui.title'), headerBackTitle: t('common.back') }} />

            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>{t(`help.categories.${categoryId}.articles.${article.id}.title`)}</ThemedText>

                <ThemedText style={styles.body}>{t(`help.categories.${categoryId}.articles.${article.id}.content`)}</ThemedText>

                {/* Dynamic Steps */}
                {(() => {
                    const steps = t(`help.categories.${categoryId}.articles.${article.id}.steps`, { returnObjects: true }) as string[];
                    if (steps && Array.isArray(steps) && steps.length > 0) {
                        return (
                            <View style={styles.section}>
                                <ThemedText type="subtitle" style={styles.sectionTitle}>{t('help.ui.steps_title')}</ThemedText>
                                {steps.map((step, index) => (
                                    <View key={index} style={styles.stepRow}>
                                        <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
                                            <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
                                        </View>
                                        <ThemedText style={styles.stepText}>{step}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        );
                    }
                    return null;
                })()}

                {/* Dynamic Tips */}
                {(() => {
                    const tips = t(`help.categories.${categoryId}.articles.${article.id}.tips`, { returnObjects: true }) as string[];
                    if (tips && Array.isArray(tips) && tips.length > 0) {
                        return (
                            <View style={[styles.tipContainer, { backgroundColor: colors.tint + '15', borderColor: colors.tint }]}>
                                <View style={styles.tipHeader}>
                                    <Ionicons name="bulb" size={20} color={colors.tint} />
                                    <ThemedText type="defaultSemiBold" style={[styles.tipTitle, { color: colors.tint }]}>{t('help.ui.tip_title')}</ThemedText>
                                </View>
                                {tips.map((tip, index) => (
                                    <ThemedText key={index} style={styles.tipText}>{tip}</ThemedText>
                                ))}
                            </View>
                        );
                    }
                    return null;
                })()}

                {/* Feedback Section Placeholder */}
                <View style={styles.feedbackContainer}>
                    <ThemedText style={styles.feedbackLabel}>{t('help.ui.feedback_question')}</ThemedText>
                    <View style={styles.feedbackButtons}>
                        <View style={[styles.feedbackBtn, { borderColor: colors.icon }]}>
                            <Ionicons name="thumbs-up-outline" size={20} color={colors.text} />
                        </View>
                        <View style={[styles.feedbackBtn, { borderColor: colors.icon }]}>
                            <Ionicons name="thumbs-down-outline" size={20} color={colors.text} />
                        </View>
                    </View>
                </View>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        marginBottom: 16,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
    },
    tipContainer: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipTitle: {
        marginLeft: 8,
    },
    tipText: {
        fontSize: 15,
        lineHeight: 22,
    },
    feedbackContainer: {
        marginTop: 24,
        alignItems: 'center',
        paddingTop: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ccc',
    },
    feedbackLabel: {
        marginBottom: 16,
        opacity: 0.7,
    },
    feedbackButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    feedbackBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
