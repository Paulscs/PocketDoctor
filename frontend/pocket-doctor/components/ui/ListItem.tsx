import React from 'react';
import { StyleSheet, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';

interface ListItemProps {
    title: string;
    subtitle?: string;
    leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
    leftIconColor?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'danger';
    showChevron?: boolean;
}

export function ListItem({
    title,
    subtitle,
    leftIcon,
    leftIconColor,
    rightElement,
    onPress,
    style,
    variant = 'default',
    showChevron = true,
}: ListItemProps) {
    const backgroundColor = useThemeColor({ light: Colors.light.card, dark: Colors.dark.card }, 'card');
    const textColor = variant === 'danger' ? Colors.light.error : undefined;

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.container, { backgroundColor }, style]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.leftContent}>
                {leftIcon && (
                    <View style={[styles.iconContainer, { backgroundColor: variant === 'danger' ? 'rgba(220, 38, 38, 0.1)' : Colors.light.lightGray }]}>
                        <Ionicons
                            name={leftIcon}
                            size={20}
                            color={variant === 'danger' ? Colors.light.error : (leftIconColor || Colors.light.brandBlue)}
                        />
                    </View>
                )}
                <View style={styles.textContent}>
                    <ThemedText style={[styles.title, textColor && { color: textColor }]}>
                        {title}
                    </ThemedText>
                    {subtitle && (
                        <ThemedText style={styles.subtitle} numberOfLines={1}>
                            {subtitle}
                        </ThemedText>
                    )}
                </View>
            </View>

            <View style={styles.rightContent}>
                {rightElement}
                {onPress && showChevron && !rightElement && (
                    <IconSymbol
                        name="chevron.right"
                        size={20}
                        color={Colors.light.placeholderGray}
                    />
                )}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.circle,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    textContent: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontWeight: '600',
        fontSize: 16,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.light.placeholderGray,
        marginTop: 2,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
});
