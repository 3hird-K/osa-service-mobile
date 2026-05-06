import * as React from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Bell, CheckCheck, ShieldCheck, Sparkles, Trash2, X, ChevronLeft, Calendar, Info, type LucideIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { Skeleton } from '@/components/ui/skeleton';
import { useColorScheme } from 'nativewind';
import Animated, {
    Layout,
    FadeIn,
    FadeOut,
    FadeInDown,
} from 'react-native-reanimated';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { loadCache, saveCache } from '@/hooks/useOfflineStorage';
import { toast } from 'sonner-native';
import { Stack, useRouter } from 'expo-router';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type Notification = {
    id: string;
    icon: LucideIcon;
    title: string;
    message: string;
    time: string;
    unread: boolean;
    type: string;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        icon: ShieldCheck,
        title: 'Security Update',
        message: 'Your account security has been verified. All systems are secure.',
        time: '2m ago',
        unread: true,
        type: 'system',
    },
    {
        id: '2',
        icon: Sparkles,
        title: 'Welcome to Osa Service',
        message: 'Thanks for joining! Explore the app to discover all available features.',
        time: '1h ago',
        unread: true,
        type: 'system',
    },
    {
        id: '3',
        icon: Bell,
        title: 'Profile Complete',
        message: 'Your profile setup is complete. You can now access all services.',
        time: '3h ago',
        unread: false,
        type: 'system',
    },
];

// Serialisable version of a notification (icon stored as a key string)
type StoredNotification = Omit<Notification, 'icon'> & { iconKey: string };

const ICON_MAP: Record<string, LucideIcon> = {
    ShieldCheck,
    Sparkles,
    Bell,
    Calendar,
    Info,
    task_assigned: Calendar,
    task_completed: CheckCheck,
    system: Bell,
};

const CACHE_KEY = 'cache:notifications';

function toStored(n: Notification): StoredNotification {
    // Find the matching key
    const iconKey = Object.entries(ICON_MAP).find(([, v]) => v === n.icon)?.[0] ?? 'Bell';
    return { ...n, iconKey };
}

function fromStored(s: StoredNotification): Notification {
    return { ...s, icon: ICON_MAP[s.iconKey] ?? Bell };
}

// ─── Notification Row ────────────────────────────────────────────────
// Theme-aware action colors
const ACTION_COLORS = {
    light: { read: '#34C759', delete: '#FF3B30' },
    dark: { read: '#30D158', delete: '#FF453A' },
};

function NotificationRow({
    item,
    isLast,
    onMarkAsRead,
    onDelete,
}: {
    item: Notification;
    isLast: boolean;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const { colorScheme } = useColorScheme();
    const colors = ACTION_COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
    const [showActions, setShowActions] = React.useState(false);

    return (
        <View style={{ overflow: 'hidden' }}>
            <Pressable
                onPress={() => setShowActions((v) => !v)}
                className={
                    'flex-row px-4 py-4 bg-card ' +
                    (!isLast && !showActions ? 'border-b border-border/30' : '')
                }
            >
                <View
                    className={
                        'w-10 h-10 rounded-full items-center justify-center mr-3 ' +
                        (item.unread ? 'bg-primary/10' : 'bg-muted')
                    }
                >
                    <Icon
                        as={item.icon}
                        className={
                            'size-5 ' +
                            (item.unread ? 'text-primary' : 'text-muted-foreground')
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
            </Pressable>

            {showActions && (
                <Animated.View
                    entering={FadeIn.duration(150)}
                    className={'flex-row ' + (!isLast ? 'border-b border-border/30' : '')}
                >
                    {item.unread && (
                        <Pressable
                            onPress={() => {
                                onMarkAsRead(item.id);
                                setShowActions(false);
                            }}
                            style={{ backgroundColor: colors.read }}
                            className="flex-1 flex-row items-center justify-center py-2.5 gap-x-1.5"
                        >
                            <Icon as={CheckCheck} className="text-white size-4" />
                            <Text className="text-white font-semibold text-xs font-sans">Mark as Read</Text>
                        </Pressable>
                    )}
                    <Pressable
                        onPress={() => {
                            onDelete(item.id);
                            setShowActions(false);
                        }}
                        style={{ backgroundColor: colors.delete }}
                        className="flex-1 flex-row items-center justify-center py-2.5 gap-x-1.5"
                    >
                        <Icon as={Trash2} className="text-white size-4" />
                        <Text className="text-white font-semibold text-xs font-sans">Delete</Text>
                    </Pressable>
                </Animated.View>
            )}
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────
export default function NotificationsScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [confirmClear, setConfirmClear] = React.useState(false);
    const clearTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const { isOnline } = useNetworkStatus();

    const API_URL = 'https://server-osa-service.onrender.com';

    const fetchNotifications = React.useCallback(async (silent = false) => {
        if (!user?.id) return;
        if (!silent) setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/${user.id}/notifications`);
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    unread: !n.is_read,
                    type: n.type,
                    icon: ICON_MAP[n.type] || Bell,
                    time: formatTime(n.created_at)
                }));
                setNotifications(mapped);
                saveCache(CACHE_KEY, mapped.map(toStored));
            }
        } catch (error) {
            console.error('[Notifications] Fetch failed:', error);
            const cached = await loadCache<StoredNotification[]>(CACHE_KEY);
            if (cached) setNotifications(cached.map(fromStored));
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    function formatTime(dateStr: string) {
        if (!dateStr) return 'Recently';
        
        // Ensure the date is parsed as UTC if no timezone is provided
        let date: Date;
        if (dateStr.endsWith('Z') || dateStr.includes('+')) {
            date = new Date(dateStr);
        } else {
            // Neon/FastAPI might return naive ISO strings, append Z to force UTC
            date = new Date(dateStr + 'Z');
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        
        // Use Math.max to avoid "in the future" negative numbers due to clock drift
        const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
        const diffMins = Math.floor(diffSecs / 60);
        const diffHrs = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHrs / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    const unreadCount = notifications.filter((n) => n.unread).length;

    const markAsRead = React.useCallback(async (id: string) => {
        // Optimistic UI
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        );
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
        } catch (e) {
            console.error('[Notifications] Failed to mark as read');
        }
    }, []);

    const deleteNotification = React.useCallback(async (id: string) => {
        // Optimistic UI
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        try {
            await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error('[Notifications] Failed to delete notification');
        }
    }, []);

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
        fetchNotifications(true);
    };

    return (
        <SafeAreaView className="flex-1 bg-muted" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* HEADER */}
            <View className="px-5 py-4 flex-row justify-between items-start">
                <View className="flex-row items-start gap-x-4">
                    <Pressable 
                        onPress={() => router.back()}
                        className="mt-1 w-8 h-8 rounded-full bg-card items-center justify-center border border-border/50 active:opacity-50"
                    >
                        <Icon as={ChevronLeft} size={20} className="text-foreground" />
                    </Pressable>
                    <View>
                        <Text className="text-foreground font-bold text-3xl font-sans tracking-tight">
                            Notifications
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                            {unreadCount} unread
                        </Text>
                    </View>
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
            {notifications.length === 0 && !isLoading ? (
                <Animated.View
                    entering={FadeIn.duration(300)}
                    className="flex-1 items-center justify-center"
                >
                    <Icon as={Bell} className="size-12 text-muted-foreground mb-3" />
                    <Text className="text-muted-foreground font-sans">No notifications yet</Text>
                </Animated.View>
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-4 pb-24"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        {isLoading ? (
                            <View>
                                {[1, 2, 3].map((i, index) => (
                                    <View
                                        key={`skeleton-${i}`}
                                        className={`flex-row px-4 py-4 ${index < 2 ? 'border-b border-border/30' : ''}`}
                                    >
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
                                <Animated.View
                                    key={item.id}
                                    entering={FadeInDown.delay(index * 60).duration(300)}
                                    exiting={FadeOut.duration(200)}
                                    layout={Layout.springify().damping(18).stiffness(150)}
                                >
                                    <NotificationRow
                                        item={item}
                                        isLast={index === notifications.length - 1}
                                        onMarkAsRead={markAsRead}
                                        onDelete={deleteNotification}
                                    />
                                </Animated.View>
                            ))
                        )}
                    </View>

                    {/* Hint text */}
                    {!isLoading && notifications.length > 0 && (
                        <Animated.View entering={FadeIn.delay(300).duration(400)}>
                            <Text className="text-center text-xs text-muted-foreground/60 font-sans mt-4">
                                Tap a notification to reveal archive and delete 
                            </Text>
                        </Animated.View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
