import * as React from 'react';
import { View, ScrollView, Pressable, Image, Switch } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { User, HelpCircle, ChevronRight, Pencil, QrCode, Moon, FileText, MessageCircleQuestion } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useUser } from '@clerk/clerk-expo';
import { THEME } from '@/lib/theme';
import { loadCache, saveCache } from '@/hooks/useOfflineStorage';

const PROFILE_CACHE_KEY = 'cache:user_profile';
type CachedProfile = { fullName: string; email: string; imageUrl: string | null };

export default function AccountScreen() {
    const router = useRouter();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { user } = useUser();
    const [cachedProfile, setCachedProfile] = React.useState<CachedProfile | null>(null);

    const liveName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || null;
    const liveEmail = user?.primaryEmailAddress?.emailAddress ?? null;
    const liveImageUrl = user?.imageUrl ?? null;

    // Save to cache whenever live data is available
    React.useEffect(() => {
        if (liveName || liveEmail) {
            const profile: CachedProfile = {
                fullName: liveName ?? cachedProfile?.fullName ?? 'No name',
                email: liveEmail ?? cachedProfile?.email ?? '',
                imageUrl: liveImageUrl,
            };
            saveCache(PROFILE_CACHE_KEY, profile);
        }
    }, [liveName, liveEmail, liveImageUrl]);

    // Load cache on mount for offline fallback
    React.useEffect(() => {
        loadCache<CachedProfile>(PROFILE_CACHE_KEY).then((p) => {
            if (p) setCachedProfile(p);
        });
    }, []);

    const fullName = liveName ?? cachedProfile?.fullName ?? 'No name';
    const email = liveEmail ?? cachedProfile?.email ?? '';
    const imageUrl = liveImageUrl ?? cachedProfile?.imageUrl ?? null;

    return (
        <SafeAreaView className="flex-1 bg-muted" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                className="pt-2 mt-2"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-4 gap-y-8">

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-1">
                        <Text className="text-foreground font-bold text-3xl font-sans tracking-tight">Settings</Text>
                        <Link href="/edit-profile" asChild>
                            <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-card border border-border/50">
                                <Icon as={Pencil} className="text-primary size-4" />
                            </Pressable>
                        </Link>
                    </View>

                    {/* Profile Card */}
                    <Link href="/account-details" asChild>
                        <Pressable className="flex-row items-center bg-card rounded-xl p-4 border border-border/50">
                            {imageUrl ? (
                                <Image
                                    source={{ uri: imageUrl }}
                                    className="w-14 h-14 rounded-full"
                                />
                            ) : (
                                <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
                                    <Text className="text-primary font-bold text-xl font-sans">
                                        {fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </Text>
                                </View>
                            )}
                            <View className="flex-1 ml-4 gap-y-0.5">
                                <Text className="font-semibold text-lg text-foreground font-sans">{fullName}</Text>
                                <Text className="text-muted-foreground text-sm font-sans">{email}</Text>
                            </View>
                            <Icon as={ChevronRight} className="text-muted-foreground size-5" />
                        </Pressable>
                    </Link>

                    {/* General */}
                    <View className="gap-y-2">
                        <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">General</Text>
                        <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                            <SettingsItem icon={User} label="Account Details" href="/account-details" />
                            <SettingsItem icon={QrCode} label="My QR Code" href="/qr-code" />
                            <View className="flex-row items-center px-4 py-3.5">
                                <View className="w-8 h-8 rounded-lg bg-accent items-center justify-center mr-3">
                                    <Icon as={Moon} className="size-4 text-primary" />
                                </View>
                                <Text className="flex-1 text-[15px] text-foreground font-sans font-medium">Dark Mode</Text>
                                <Switch
                                    value={colorScheme === 'dark'}
                                    onValueChange={toggleColorScheme}
                                    trackColor={{
                                        true: colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary,
                                        false: colorScheme === 'dark' ? THEME.dark.border : THEME.light.border,
                                    }}
                                    thumbColor={'#ffffff'}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Support & Legal */}
                    <View className="gap-y-2">
                        <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Support & Legal</Text>
                        <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                            <SettingsItem icon={MessageCircleQuestion} label="FAQ" href="/faq" />
                            <SettingsItem icon={HelpCircle} label="Help & Support" href="/help-support" />
                            <SettingsItem icon={FileText} label="Terms & Conditions" href="/terms-conditions" isLast />
                        </View>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function SettingsItem({ icon, label, isLast, href, onPress }: { icon: any; label: string; isLast?: boolean; href?: string; onPress?: () => void }) {
    const borderClass = isLast ? '' : 'border-b border-border/30';
    const content = (
        <Pressable
            onPress={onPress}
            className={'flex-row items-center px-4 py-3.5 ' + borderClass}
        >
            <View className="w-8 h-8 rounded-lg bg-accent items-center justify-center mr-3">
                <Icon as={icon} className="size-4 text-primary" />
            </View>
            <Text className="flex-1 text-[15px] text-foreground font-sans font-medium">{label}</Text>
            <Icon as={ChevronRight} className="text-muted-foreground/50 size-4" />
        </Pressable>
    );

    if (href) {
        return (
            <Link href={href as any} asChild>
                {content}
            </Link>
        );
    }

    return content;
}
