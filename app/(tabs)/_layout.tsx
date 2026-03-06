import * as React from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Home, UserRound, Bell } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    interpolate,
} from 'react-native-reanimated';

/* ── Tab config ─────────────────────────────────────── */
const TAB_ITEMS: Record<string, { icon: any }> = {
    notifications: { icon: Bell },
    index: { icon: Home },
    account: { icon: UserRound },
};

const CIRCLE_SIZE = 56;
const BAR_HEIGHT = 65;
const CIRCLE_RAISE = 10; 
const SPRING = { damping: 16, stiffness: 140, mass: 0.85 };

/* ── Floating circle tab bar ────────────────────────── */
function FloatingCircleTabBar({ state, descriptors, navigation }: any) {
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Measure each tab center-x so the circle can slide there
    const tabCenters = React.useRef<number[]>([]);
    const circleX = useSharedValue(0);
    const isInit = React.useRef(false);

    const handleTabLayout = React.useCallback(
        (index: number) => (e: any) => {
            const { x, width } = e.nativeEvent.layout;
            tabCenters.current[index] = x + width / 2;
            // first layout ‑ snap (no animation)
            if (index === state.index && !isInit.current) {
                circleX.value = tabCenters.current[index];
                isInit.current = true;
            }
        },
        [state.index],
    );

    // Animate circle to active tab
    React.useEffect(() => {
        const cx = tabCenters.current[state.index];
        if (cx !== undefined) {
            circleX.value = withSpring(cx, SPRING);
        }
    }, [state.index]);

    // Animated circle style (centered on tab)
    const circleAnimStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: circleX.value - CIRCLE_SIZE / 2 },
        ],
    }));

    // Theme colors
    const primaryLight = 'hsl(211, 100%, 50%)';
    const primaryDark = 'hsl(211, 100%, 64%)';
    const circleBg = isDark ? primaryDark : primaryLight;
    const inactiveIcon = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
    const barBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const shadowColor = isDark ? '#000' : 'rgba(0,0,0,0.12)';

    return (
        <View
            style={[styles.outerContainer, { bottom: Math.max(insets.bottom, 12) }]}
            pointerEvents="box-none"
        >
            {/* ─── Floating circle (above bar) ─── */}
            <Animated.View
                style={[
                    styles.circle,
                    circleAnimStyle,
                    {
                        backgroundColor: circleBg,
                        shadowColor: circleBg,
                        shadowOpacity: 0.45,
                        shadowRadius: 14,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 12,
                    },
                ]}
            >
                {/* Render the active icon white inside the circle */}
                {state.routes[state.index] && (
                    <Icon
                        as={TAB_ITEMS[state.routes[state.index].name]?.icon ?? Home}
                        size={24}
                        color="#ffffff"
                    />
                )}
            </Animated.View>

            {/* ─── Translucent bar ─── */}
            <View
                style={[
                    styles.barOuter,
                    {
                        borderColor: barBorder,
                        shadowColor,
                        shadowOpacity: isDark ? 0.5 : 0.15,
                        shadowRadius: 20,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 8,
                    },
                ]}
            >
                <BlurView
                    intensity={isDark ? 60 : 80}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
                {/* Translucent overlay */}
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: isDark
                                ? 'rgba(28, 28, 30, 0.72)'
                                : 'rgba(255, 255, 255, 0.78)',
                        },
                    ]}
                />

                <View style={styles.barInner}>
                    {state.routes.map((route: any, index: number) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        return (
                            <TabIcon
                                key={route.key}
                                route={route}
                                isFocused={isFocused}
                                options={options}
                                onPress={onPress}
                                onLayout={handleTabLayout(index)}
                                inactiveColor={inactiveIcon}
                            />
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

/* ── Individual tab icon (inactive state visible, active hidden behind circle) ── */
function TabIcon({
    route,
    isFocused,
    options,
    onPress,
    onLayout,
    inactiveColor,
}: {
    route: any;
    isFocused: boolean;
    options: any;
    onPress: () => void;
    onLayout: (e: any) => void;
    inactiveColor: string;
}) {
    const tabItem = TAB_ITEMS[route.name] || { icon: Home };
    const focusAnim = useSharedValue(isFocused ? 1 : 0);

    React.useEffect(() => {
        focusAnim.value = withSpring(isFocused ? 1 : 0, SPRING);
    }, [isFocused]);

    // When active, push icon down so it's hidden (circle shows the icon above)
    const iconContainerStyle = useAnimatedStyle(() => ({
        opacity: interpolate(focusAnim.value, [0, 0.5, 1], [1, 0.3, 0]),
        transform: [
            { translateY: interpolate(focusAnim.value, [0, 1], [0, 6]) },
            { scale: interpolate(focusAnim.value, [0, 1], [1, 0.85]) },
        ],
    }));

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLayout={onLayout}
            style={styles.tabButton}
        >
            <Animated.View style={iconContainerStyle}>
                <Icon as={tabItem.icon} size={22} color={inactiveColor} />
            </Animated.View>
        </Pressable>
    );
}

/* ── Styles ──────────────────────────────────────────── */
const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        left: 24,
        right: 24,
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        top: -CIRCLE_RAISE,
        left: 0,
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    barOuter: {
        width: '100%',
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
    },
    barInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: BAR_HEIGHT,
    },
});

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <FloatingCircleTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="account" options={{ title: 'Account' }} />
        </Tabs>
    );
}
