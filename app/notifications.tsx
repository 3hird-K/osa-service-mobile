import * as React from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Pressable, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Bell, CheckCheck, ShieldCheck, Sparkles, Trash2, X, ChevronLeft, Calendar, Info, ExternalLink, type LucideIcon } from 'lucide-react-native';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    url?: string;
    taskId?: string;
};

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
const API_URL = 'https://server-osa-service.onrender.com';

// ─── Notification Row ────────────────────────────────────────────────
const ACTION_COLORS = {
    light: { read: '#34C759', delete: '#FF3B30' },
    dark: { read: '#30D158', delete: '#FF453A' },
};

function NotificationRow({
    item,
    isLast,
    onMarkAsRead,
    onDelete,
    onPress,
}: {
    item: Notification;
    isLast: boolean;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onPress: (item: Notification) => void;
}) {
    const { colorScheme } = useColorScheme();
    const colors = ACTION_COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
    const [showActions, setShowActions] = React.useState(false);

    return (
        <View style={{ overflow: 'hidden' }}>
            <Pressable
                onPress={() => onPress(item)}
                onLongPress={() => setShowActions((v) => !v)}
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
                        <View className="flex-row items-center gap-x-1.5 flex-1 pr-2">
                            <Text
                                numberOfLines={1}
                                className={
                                    'text-[15px] font-sans ' +
                                    (item.unread
                                        ? 'font-semibold text-foreground'
                                        : 'font-medium text-foreground/80')
                                }
                            >
                                {item.title}
                            </Text>
                            {item.url && (
                                <Icon as={ExternalLink} size={12} className="text-primary/50" />
                            )}
                        </View>
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
    const queryClient = useQueryClient();
    const [confirmClear, setConfirmClear] = React.useState(false);
    const clearTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const { isOnline } = useNetworkStatus();

    // ─── Fetching Logic ───────────────────────────────────────────
    const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const res = await fetch(`${API_URL}/users/${user.id}/notifications`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();

            const mapped = data.map((n: any) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                unread: !n.is_read,
                type: n.type,
                icon: ICON_MAP[n.type] || Bell,
                time: formatTime(n.created_at),
                url: n.url,
                taskId: n.task_id
            }));

            saveCache(CACHE_KEY, mapped);
            return mapped;
        },
        enabled: !!user?.id,
        refetchInterval: 10000, // Auto-refresh every 10 seconds
        initialData: () => {
            // Optional: return cached data here if available synchronously
            return [];
        }
    });

    // ─── Actions (Mutations) ──────────────────────────────────────
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
            if (!res.ok) throw new Error('Mark as read failed');
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
            const previous = queryClient.getQueryData(['notifications', user?.id]);
            queryClient.setQueryData(['notifications', user?.id], (old: any) =>
                old?.map((n: any) => n.id === id ? { ...n, unread: false } : n)
            );
            return { previous };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['notifications', user?.id], context?.previous);
            toast.error('Failed to update notification');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
            const previous = queryClient.getQueryData(['notifications', user?.id]);
            queryClient.setQueryData(['notifications', user?.id], (old: any) =>
                old?.filter((n: any) => n.id !== id)
            );
            return { previous };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['notifications', user?.id], context?.previous);
            toast.error('Failed to delete notification');
        }
    });

    // ─── Interaction Handlers ─────────────────────────────────────
    const handleNotificationPress = async (item: Notification) => {
        // Mark as read when clicked
        if (item.unread) {
            markAsReadMutation.mutate(item.id);
        }

        // Deep link to web portal tracking page using Task ID
        const targetId = item.taskId;
        const trackingUrl = `https://osaserviceportal.vercel.app/track?id=${targetId}`;

        try {
            const supported = await Linking.canOpenURL(trackingUrl);
            if (supported) {
                await Linking.openURL(trackingUrl);
            } else {
                toast.error('Cannot open web portal');
            }
        } catch (error) {
            console.error('[Linking] Failed to open URL:', error);
            toast.error('Browser error');
        }
    };

    function formatTime(dateStr: string) {
        if (!dateStr) return 'Recently';
        let date = new Date(dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z');
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
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

    const unreadCount = notifications.filter((n: any) => n.unread).length;

    const handleClearPress = () => {
        if (confirmClear) {
            // Logic to clear all on backend if needed, or just UI
            setConfirmClear(false);
            toast.success('Notifications cleared');
        } else {
            setConfirmClear(true);
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
            clearTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
        }
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

                {/* {notifications.length > 0 && (
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
                )} */}
            </View>

            {/* CONTENT */}
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
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
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
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            notifications.map((item: any, index: number) => (
                                <Animated.View
                                    key={item.id}
                                    entering={FadeInDown.delay(index * 60).duration(300)}
                                    exiting={FadeOut.duration(200)}
                                    layout={Layout.springify().damping(18).stiffness(150)}
                                >
                                    <NotificationRow
                                        item={item}
                                        isLast={index === notifications.length - 1}
                                        onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                                        onDelete={(id) => deleteMutation.mutate(id)}
                                        onPress={handleNotificationPress}
                                    />
                                </Animated.View>
                            ))
                        )}
                    </View>

                    {/* Hint text */}
                    {!isLoading && notifications.length > 0 && (
                        <Animated.View entering={FadeIn.delay(300).duration(400)}>
                            <Text className="text-center text-xs text-muted-foreground/60 font-sans mt-4">
                                Tap to open details • Long press for actions
                            </Text>
                        </Animated.View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
