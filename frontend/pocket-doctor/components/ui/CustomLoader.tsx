import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay,
    cancelAnimation,
} from 'react-native-reanimated';

export function CustomLoader() {
    const rotation = useSharedValue(0);
    const scale1 = useSharedValue(0);
    const scale2 = useSharedValue(0);

    useEffect(() => {
        // Rotation: 0 -> 360, linear, infinite
        rotation.value = withRepeat(
            withTiming(360, { duration: 1000, easing: Easing.linear }),
            -1
        );

        // Scale Animation: 0 -> 1 -> 0
        // Dot 1 (Top)
        scale1.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
            ),
            -1
        );

        // Dot 2 (Bottom) - starts with delay
        scale2.value = withDelay(
            500,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1
            )
        );

        return () => {
            cancelAnimation(rotation);
            cancelAnimation(scale1);
            cancelAnimation(scale2);
        };
    }, []);

    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    const dot1Style = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale1.value }],
        };
    });

    const dot2Style = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale2.value }],
        };
    });

    return (
        <Animated.View style={[styles.loader, containerStyle]}>
            <Animated.View style={[styles.dot, styles.dotTop, dot1Style]} />
            <Animated.View style={[styles.dot, styles.dotBottom, dot2Style]} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    loader: {
        width: 48,
        height: 48,
        position: 'relative',
        // margin: 15px auto is handled by parent centering
    },
    dot: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12, // 50% of 24
        left: 12, // Centered horizontally: (48 - 24) / 2 = 12
    },
    dotTop: {
        top: 0,
        backgroundColor: '#6ebeff',
    },
    dotBottom: {
        bottom: 0,
        backgroundColor: '#337ab7',
    },
});
