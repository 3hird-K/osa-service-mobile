import * as React from 'react';
import { View, ScrollView, Pressable, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Crown, User, Smartphone, Dumbbell, HelpCircle, LogOut, ChevronRight, ChevronLeft, Pencil, QrCode, Moon, FileText, Bell, Globe, ShieldAlert, MessageCircleQuestion } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Switch } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

export default function AccountScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { signOut } = useAuth();

    return (
        <ScrollView
            className="flex-1 bg-muted"
            contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="px-5 gap-y-6">

                {/* Header */}
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="bg-background w-12 h-12 rounded-full items-center justify-center shadow-sm">
                        <Icon as={ChevronLeft} className="text-foreground size-5 pl-1" />
                    </Pressable>
                    {/* <Text className="text-foreground font-semibold text-xl flex-1 text-center font-sans">Settings</Text> */}
                    <Link href="/edit-profile" asChild>
                        <Pressable className="bg-background w-12 h-12 rounded-full items-center justify-center shadow-sm">
                            <Icon as={Pencil} className="text-foreground size-5" />
                        </Pressable>
                    </Link>
                </View>

                {/* Profile Image & Info */}
                <View className="flex-row items-center mt-4 bg-card rounded-[32px] p-4 shadow-sm">
                    <View className="rounded-full bg-primary/20 mr-4">
                        <Image
                            source={{ uri: 'https://github.com/shadcn.png' }}
                            className="w-16 h-16 rounded-full"
                        />
                    </View>
                    <View className="flex-1 justify-center gap-y-1">
                        <Text className="font-bold text-xl text-foreground font-sans">Neil Dime</Text>
                        <Text className="text-muted-foreground font-medium text-sm font-sans">neildime03@gmail.com</Text>
                    </View>
                </View>

                {/* General Settings */}
                <View className="gap-y-3 pt-4">
                    <Text className="text-foreground text-sm font-medium px-2 font-sans tracking-wide uppercase opacity-70">General</Text>
                    <View className="bg-card rounded-3xl py-1 shadow-sm">
                        <SettingsItem icon={User} label="Account Details" href="/account-details" />
                        <SettingsItem icon={QrCode} label="My QR Code" href="/qr-code" />
                        {/* <View className="bg-card rounded-3xl py-1 shadow-sm"> */}
                        <View className="flex-row items-center px-5 py-4">
                            <View className="mr-5">
                                <Icon as={Moon} className={`size-5 ${colorScheme === 'dark' ? 'text-primary' : 'text-foreground'}`} />
                            </View>
                            <Text className="flex-1 font-medium text-[15px] text-foreground font-sans">Dark Mode</Text>
                            <Switch
                                value={colorScheme === 'dark'}
                                onValueChange={toggleColorScheme}
                                trackColor={{ true: 'hsl(var(--primary))', false: 'hsl(var(--border))' }}
                                thumbColor={'hsl(var(--background))'}
                            />
                        </View>
                        {/* </View> */}
                    </View>
                </View>

                {/* Support & Legal */}
                <View className="gap-y-3 pt-4 mb-4">
                    <Text className="text-foreground text-sm font-medium px-2 font-sans tracking-wide uppercase opacity-70">Support & Legal</Text>
                    <View className="bg-card rounded-3xl py-1 shadow-sm">
                        <SettingsItem icon={MessageCircleQuestion} label="FAQ" href="/faq" />
                        <SettingsItem icon={HelpCircle} label="Help & Support" href="/help-support" />
                        <SettingsItem icon={FileText} label="Terms & Conditions" href="/terms-conditions" isLast />
                    </View>
                </View>

                <View className="mb-10 mt-4">
                    <Pressable onPress={() => signOut()} className="bg-destructive/10 rounded-2xl py-4 flex-row justify-center items-center shadow-sm">
                        <Icon as={LogOut} className="text-destructive size-5 mr-3" />
                        <Text className="text-destructive font-bold text-base font-sans">Log Out</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

function SettingsItem({ icon, label, isLast, href, onPress }: { icon: any, label: string, isLast?: boolean, href?: string, onPress?: () => void }) {
    const content = (
        <Pressable onPress={onPress} className={`flex-row items-center px-5 py-4 ${isLast ? '' : 'border-b border-border/40'}`}>
            <View className="mr-5">
                <Icon as={icon} className="text-foreground size-5" />
            </View>
            <Text className="flex-1 font-medium text-[15px] text-foreground font-sans">{label}</Text>
            <Icon as={ChevronRight} className="text-foreground size-5 opacity-70" />
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
