import * as React from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Bell, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/ui/skeleton';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const INITIAL_NOTIFICATIONS = [
    {
        id: 1,
        icon: ShieldCheck,
        title: 'Security Update',
        message: 'Your account security has been verified. All systems are secure.',
        time: '2m ago',
        unread: true,
    },
    {
        id: 2,
        icon: Sparkles,
        title: 'Welcome to Osa Service',
        message: 'Thanks for joining! Explore the app to discover all available features.',
        time: '1h ago',
        unread: true,
    },
    {
        id: 3,
        icon: Bell,
        title: 'Profile Complete',
        message: 'Your profile setup is complete. You can now access all services.',
        time: '3h ago',
        unread: false,
    },
];

export default function NotificationsScreen() {
    const [notifications, setNotifications] = React.useState(INITIAL_NOTIFICATIONS);
    const [refreshing, setRefreshing] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [confirmClear, setConfirmClear] = React.useState(false);
    const clearTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        setTimeout(() => setIsLoading(false), 1500);
        return () => {
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        };
    }, []);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, unread: false } : n
            )
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const handleClearPress = () => {
        if (confirmClear) {
            clearAll();
            setConfirmClear(false);
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        } else {
            setConfirmClear(true);
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
            clearTimerRef.current = setTimeout(() => {
                setConfirmClear(false);
            }, 3000);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setNotifications(INITIAL_NOTIFICATIONS);
            setRefreshing(false);
        }, 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-muted" edges={['top']}>

            {/* HEADER */}
            <View className="px-5 py-4 flex-row justify-between items-center">
                <View>
                    <Text className="text-foreground font-bold text-3xl font-sans tracking-tight">
                        Notifications
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                        {unreadCount} unread
                    </Text>
                </View>

                {notifications.length > 0 && (
                    <AnimatedTouchableOpacity
                        layout={Layout.springify().damping(18).stiffness(150)}
                        onPress={handleClearPress}
                        className="bg-muted items-center justify-center overflow-hidden border border-border/50"
                        style={{ borderRadius: 9999, minWidth: 32, height: 32 }}
                    >
                        {confirmClear ? (
                            <Animated.Text
                                entering={FadeIn.duration(200)}
                                exiting={FadeOut.duration(200)}
                                className="text-foreground text-[13px] font-semibold px-4 font-sans"
                            >
                                Clear
                            </Animated.Text>
                        ) : (
                            <Animated.View
                                entering={FadeIn.duration(200)}
                                exiting={FadeOut.duration(200)}
                                className="p-1.5 px-2"
                            >
                                <Icon as={X} className="size-4 text-muted-foreground" />
                            </Animated.View>
                        )}
                    </AnimatedTouchableOpacity>
                )}
            </View>

            {/* EMPTY STATE */}
            {notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Icon as={Bell} className="size-12 text-muted-foreground mb-3" />
                    <Text className="text-muted-foreground">
                        No notifications yet
                    </Text>
                </View>
            ) : (

                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-4 pb-24"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">

                        {isLoading ? (
                            <View>
                                {[1, 2, 3].map((i, index) => (
                                    <View key={`skeleton-${i}`} className={`flex-row px-4 py-4 ${index < 2 ? 'border-b border-border/30' : ''}`}>
                                        <Skeleton className="w-10 h-10 rounded-full mr-3" />
                                        <View className="flex-1 gap-y-2 mt-1">
                                            <View className="flex-row items-center justify-between">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-10" />
                                            </View>
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-3/4" />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            notifications.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => markAsRead(item.id)}
                                    className={
                                        'flex-row px-4 py-4 ' +
                                        (index < notifications.length - 1
                                            ? 'border-b border-border/30'
                                            : '')
                                    }
                                >
                                    <View
                                        className={
                                            'w-10 h-10 rounded-full items-center justify-center mr-3 ' +
                                            (item.unread
                                                ? 'bg-primary/10'
                                                : 'bg-muted')
                                        }
                                    >
                                        <Icon
                                            as={item.icon}
                                            className={
                                                'size-5 ' +
                                                (item.unread
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground')
                                            }
                                        />
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text
                                                className={
                                                    'text-[15px] font-sans ' +
                                                    (item.unread
                                                        ? 'font-semibold text-foreground'
                                                        : 'font-medium text-foreground/80')
                                                }
                                            >
                                                {item.title}
                                            </Text>

                                            <Text className="text-xs text-muted-foreground font-sans">
                                                {item.time}
                                            </Text>
                                        </View>

                                        <Text className="text-sm text-muted-foreground font-sans leading-5">
                                            {item.message}
                                        </Text>
                                    </View>

                                    {item.unread && (
                                        <View className="w-2 h-2 rounded-full bg-primary ml-2 mt-2" />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}

                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
