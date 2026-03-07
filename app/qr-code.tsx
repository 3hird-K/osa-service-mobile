import * as React from 'react';
import { View, Pressable, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useColorScheme } from 'nativewind';
import QRCode from 'react-native-qrcode-svg';

export default function QrCodeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();
    const { colorScheme } = useColorScheme();

    // Build a unique payload identifying this user
    const qrPayload = JSON.stringify({
        id: user?.id,
        username: user?.username,
        email: user?.primaryEmailAddress?.emailAddress,
    });

    const displayName = user?.firstName
        ? `${user.firstName} ${user.lastName ?? ''}`.trim()
        : user?.username ?? 'User';

    const email = user?.primaryEmailAddress?.emailAddress ?? '';

    return (
        <View className="flex-1 bg-muted">
            {/* Header */}
            <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 flex-row items-center">
                <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
                    <Icon as={ChevronLeft} className="text-primary size-6" />
                </Pressable>
                <Text className="text-foreground font-semibold text-lg font-sans flex-1 text-center mr-10">My QR Code</Text>
            </View>

            <View className="flex-1 items-center justify-center px-8">
                <View className="bg-card w-full rounded-2xl items-center p-8 border border-border/50">
                    {/* Avatar */}
                    {user?.imageUrl ? (
                        <Image source={{ uri: user.imageUrl }} className="w-16 h-16 rounded-full mb-4" />
                    ) : (
                        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                            <Text className="text-primary font-bold text-xl font-sans">
                                {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </Text>
                        </View>
                    )}

                    {/* Name & email */}
                    <Text className="text-foreground font-semibold text-lg font-sans">{displayName}</Text>
                    {email ? (
                        <Text className="text-muted-foreground text-sm font-sans mt-0.5 mb-6">{email}</Text>
                    ) : (
                        <View className="mb-6" />
                    )}

                    {/* QR Code */}
                    <View className="bg-white rounded-2xl p-5">
                        <QRCode
                            value={qrPayload}
                            size={200}
                            backgroundColor="white"
                            color="black"
                        />
                    </View>

                    <Text className="text-muted-foreground text-xs font-sans mt-5">
                        Scan to identify this account
                    </Text>
                </View>
            </View>
        </View>
    );
}
