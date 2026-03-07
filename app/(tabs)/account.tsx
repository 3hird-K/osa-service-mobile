import * as React from 'react';
import { View, ScrollView, Pressable, Image, Switch } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { User, HelpCircle, ChevronRight, Pencil, QrCode, Moon, FileText, MessageCircleQuestion } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

import { THEME } from '@/lib/theme';

export default function AccountScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colorScheme, toggleColorScheme } = useColorScheme();

    return (
        <ScrollView
            className="flex-1 bg-muted"
            contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 100 }}
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
                        <Image
                            source={{ uri: 'https://github.com/shadcn.png' }}
                            className="w-14 h-14 rounded-full"
                        />
                        <View className="flex-1 ml-4 gap-y-0.5">
                            <Text className="font-semibold text-lg text-foreground font-sans">Neil Dime</Text>
                            <Text className="text-muted-foreground text-sm font-sans">neildime03@gmail.com</Text>
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
