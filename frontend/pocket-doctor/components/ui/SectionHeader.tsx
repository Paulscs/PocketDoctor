import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Colors } from '@/constants/theme';

interface SectionHeaderProps {
    title: string;
    rightElement?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, rightElement, style }: SectionHeaderProps) {
    return (
        <View style={[styles.container, style]}>
            <ThemedText type="subtitle" style={styles.title}>
                {title}
            </ThemedText>
            {rightElement}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.xs, // Slight padding to align with content if needed
    },
    title: {
        color: Colors.light.brandBlue, // Enforcing brand color for headers
        fontSize: 18,
    },
});
