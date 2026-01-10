import React, { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

// Create an animated Path component
const AnimatedPath = Animated.createAnimatedComponent(Path);

// The total length of the path (approximate from CSS --dasharray)
const PATH_LENGTH = 814;

export function HeartRateLoader() {
    const progress = useSharedValue(0);

    useEffect(() => {
        // Animate progress from 0 to 1 repeatedly
        // This maps to strokeDashoffset: PATH_LENGTH -> -PATH_LENGTH
        progress.value = withRepeat(
            withTiming(1, { duration: 5000, easing: Easing.linear }),
            -1
        );

        return () => {
            cancelAnimation(progress);
        };
    }, []);

    const animatedProps = useAnimatedProps(() => {
        // CSS Keyframes:
        // from { stroke-dashoffset: 814; }
        // to { stroke-dashoffset: -814; }
        // Total range needed is 814 - (-814) = 1628

        const offset = PATH_LENGTH - (progress.value * (PATH_LENGTH * 2));

        return {
            strokeDashoffset: offset,
        };
    });

    return (
        <View style={styles.container}>
            {/* 
        The SVG width/height and viewBox specific to the path provided.
        The user provided 550x210 in the request.
        We can scale it down if needed given device width constraints, 
        but let's keep aspect ratio.
      */}
            <Svg width={300} height={115} viewBox="0 0 550 210">
                <AnimatedPath
                    d="m0,130.08h44.51c7.08-3.45,11.54-24.65,19.42-24.81s13.23,22.54,21.03,24.81c10.03,2.92,29.69-14.6,39.91-12.4,4.58.98,9.34,12.36,14.02,12.4,3.54.03,7.25-9.31,10.79-9.17,3.24.13,6.17,7.93,9.17,9.17s9.68-1.48,12.4,0c2.4,1.3,3.45,10.3,5.93,9.17,3.23-1.48,2.82-103.01,8.09-103.01,6.96,0,12.35,137.53,16.72,137.53,3.9,0-.09-36.61,8.49-43.69,3.41-2.81,13.69,1.93,17.66,0,7.17-3.49,11.72-24.71,19.69-25.08,8.62-.4,15.39,22.86,23.73,25.08,8.99,2.38,26.51-12.76,35.6-10.79,5.58,1.21,11.46,15.82,17.12,15.1,3.88-.49,4.87-12.59,8.76-12.94,3.01-.28,5.7,7.46,8.49,8.63s9.75-1.43,12.54,0,4.03,9.39,7.01,9.71c4.98.54,2.64-103.55,8.63-103.55,5.16,0,8.8,111.51,12.94,111.64,5.02.16,5.01-15.2,9.3-17.8s15.02,2.06,19.42,0c7.39-3.46,12.74-25.17,20.9-25.08,8.97.09,13.68,25.85,22.38,28.04,9.17,2.31,25.4-15.93,34.79-14.83,4.95.58,11.31,10.3,16.04,11.87h44.51"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    fill="none"
                    stroke="#DE6262"
                    strokeDasharray={PATH_LENGTH}
                    animatedProps={animatedProps}
                />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
