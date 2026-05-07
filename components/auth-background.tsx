import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  interpolate,
  withSequence,
  withDelay
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export function AuthBackground() {
  const blob1 = useSharedValue(0);
  const blob2 = useSharedValue(0);
  const blob3 = useSharedValue(0);

  React.useEffect(() => {
    blob1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 10000 }),
        withTiming(0, { duration: 10000 })
      ),
      -1,
      true
    );
    blob2.value = withDelay(2000, withRepeat(
      withSequence(
        withTiming(1, { duration: 12000 }),
        withTiming(0, { duration: 12000 })
      ),
      -1,
      true
    ));
    blob3.value = withDelay(4000, withRepeat(
      withSequence(
        withTiming(1, { duration: 15000 }),
        withTiming(0, { duration: 15000 })
      ),
      -1,
      true
    ));
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blob1.value, [0, 1], [-20, 40]) },
      { translateY: interpolate(blob1.value, [0, 1], [-30, 20]) },
      { scale: interpolate(blob1.value, [0, 1], [1, 1.2]) },
    ],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blob2.value, [0, 1], [30, -30]) },
      { translateY: interpolate(blob2.value, [0, 1], [20, -40]) },
      { scale: interpolate(blob2.value, [0, 1], [1, 1.3]) },
    ],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blob3.value, [0, 1], [-10, 20]) },
      { translateY: interpolate(blob3.value, [0, 1], [40, -10]) },
      { scale: interpolate(blob3.value, [0, 1], [1, 1.1]) },
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill} className="bg-background overflow-hidden">
      {/* Soft Blobs */}
      <Animated.View 
        style={[
          { 
            position: 'absolute', 
            top: -100, 
            left: -50, 
            width: width * 0.8, 
            height: width * 0.8, 
            borderRadius: width * 0.4, 
            backgroundColor: '#FF6B00', // Primary orange
            opacity: 0.08,
          },
          animatedStyle1
        ]} 
      />
      <Animated.View 
        style={[
          { 
            position: 'absolute', 
            bottom: height * 0.2, 
            right: -100, 
            width: width * 0.9, 
            height: width * 0.9, 
            borderRadius: width * 0.45, 
            backgroundColor: '#4F46E5', // Indigo for contrast
            opacity: 0.05,
          },
          animatedStyle2
        ]} 
      />
      <Animated.View 
        style={[
          { 
            position: 'absolute', 
            top: height * 0.4, 
            left: -120, 
            width: width * 0.7, 
            height: width * 0.7, 
            borderRadius: width * 0.35, 
            backgroundColor: '#10B981', // Emerald for balance
            opacity: 0.04,
          },
          animatedStyle3
        ]} 
      />

      {/* Decorative patterns could be added here */}
    </View>
  );
}
