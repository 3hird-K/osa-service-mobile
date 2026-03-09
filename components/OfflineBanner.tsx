import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  // -60 = hidden above screen; 0 = visible
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (!isOnline) {
      // Slide down
      translateY.value = withSpring(0, { damping: 18, stiffness: 140 });
      opacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
    } else {
      // Slide back up
      translateY.value = withSpring(-80, { damping: 18, stiffness: 140 });
      opacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) });
    }
  }, [isOnline]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        animStyle,
        { top: insets.top + 8 },
      ]}
      pointerEvents="none"
    >
      <View style={styles.pill}>
        {/* Wi-Fi off indicator dot */}
        <View style={styles.dot} />
        <Text style={styles.text}>No Internet Connection</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B45309', // amber-700
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDE68A', // amber-200
  },
  text: {
    color: '#FEF3C7', // amber-50
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
