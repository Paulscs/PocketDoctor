import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, variant = 'elevated' }: CardProps) {
  const backgroundColor = useThemeColor({ light: Colors.light.card, dark: Colors.dark.card }, 'card');
  const borderColor = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, 'border');

  const cardStyle = [
    styles.card,
    { backgroundColor },
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && [styles.outlined, { borderColor }],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
  },
});
