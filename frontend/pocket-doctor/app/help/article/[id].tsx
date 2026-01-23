import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { helpCategories } from '@/data/helpContent';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HelpArticleScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const backgroundColor = Colors.light.white;

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
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen
                options={{
                    title: t('help.ui.title'),
                    headerBackTitle: t('common.back'),
                    headerTintColor: Colors.light.brandBlue,
                }}
            />

            <ScrollView
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Article Header */}
                <View style={styles.sectionCard}>
                    <ThemedText style={styles.title}>{t(`help.categories.${categoryId}.articles.${article.id}.title`)}</ThemedText>
                    <ThemedText style={styles.body}>{t(`help.categories.${categoryId}.articles.${article.id}.content`)}</ThemedText>
                </View>

                {/* Dynamic Steps */}
                {(() => {
                    const steps = t(`help.categories.${categoryId}.articles.${article.id}.steps`, { returnObjects: true }) as string[];
                    if (steps && Array.isArray(steps) && steps.length > 0) {
                        return (
                            <View style={styles.sectionCard}>
                                <ThemedText style={styles.sectionTitle}>{t('help.ui.steps_title')}</ThemedText>
                                <View style={styles.stepsContainer}>
                                    {steps.map((step, index) => (
                                        <View key={index} style={styles.stepRow}>
                                            <View style={styles.stepTimelineContainer}>
                                                <View style={styles.stepNumber}>
                                                    <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
                                                </View>
                                                {index < steps.length - 1 && <View style={styles.stepLine} />}
                                            </View>
                                            <ThemedText style={styles.stepText}>{step}</ThemedText>
                                        </View>
                                    ))}
                                </View>
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
                            <View style={styles.tipCard}>
                                <View style={styles.tipHeader}>
                                    <Ionicons name="bulb" size={20} color={Colors.light.medicalBlue} />
                                    <ThemedText style={styles.tipTitle}>{t('help.ui.tip_title')}</ThemedText>
                                </View>
                                {tips.map((tip, index) => (
                                    <ThemedText key={index} style={styles.tipText}>{tip}</ThemedText>
                                ))}
                            </View>
                        );
                    }
                    return null;
                })()}

                {/* Feedback Section */}
                <View style={styles.feedbackContainer}>
                    <ThemedText style={styles.feedbackLabel}>{t('help.ui.feedback_question')}</ThemedText>
                    <View style={styles.feedbackButtons}>
                        <TouchableOpacity style={styles.feedbackBtn} activeOpacity={0.7}>
                            <Ionicons name="thumbs-up-outline" size={22} color={Colors.light.medicalBlue} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.feedbackBtn} activeOpacity={0.7}>
                            <Ionicons name="thumbs-down-outline" size={22} color={Colors.light.medicalBlue} />
                        </TouchableOpacity>
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
    contentContainer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    sectionCard: {
        backgroundColor: Colors.light.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        shadowColor: Colors.light.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.brandBlue,
        marginBottom: Spacing.md,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.light.textGray,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.brandBlue,
        marginBottom: Spacing.lg,
    },
    stepsContainer: {
        paddingLeft: Spacing.xs,
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: 2, // Spacing handled by content
    },
    stepTimelineContainer: {
        alignItems: 'center',
        width: 30,
        marginRight: Spacing.md,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.light.medicalBlue,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    stepNumberText: {
        color: Colors.light.white,
        fontWeight: '700',
        fontSize: 14,
    },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: Colors.light.borderGray,
        marginVertical: 4,
        minHeight: 20,
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: Colors.light.textGray,
        paddingBottom: Spacing.lg, // Add padding here for separation
        marginTop: 2, // Align with number
    },
    tipCard: {
        backgroundColor: Colors.light.friendlyBlueBg,
        borderColor: Colors.light.friendlyBlueBorder,
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.brandBlue,
        marginLeft: Spacing.sm,
    },
    tipText: {
        fontSize: 15,
        lineHeight: 22,
        color: Colors.light.textGray,
    },
    feedbackContainer: {
        alignItems: 'center',
    },
    feedbackLabel: {
        fontSize: 14,
        color: Colors.light.gray,
        marginBottom: Spacing.md,
    },
    feedbackButtons: {
        flexDirection: 'row',
        gap: Spacing.xl,
    },
    feedbackBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.light.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.light.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
});
