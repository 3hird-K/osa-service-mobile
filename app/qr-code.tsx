import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, QrCode } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function QrCodeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

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
                <View className="bg-card w-full rounded-2xl items-center justify-center p-10 border border-border/50">
                    <View className="bg-muted rounded-2xl p-6 mb-6">
                        <Icon as={QrCode} className="text-foreground" size={160} />
                    </View>
                    <Text className="text-foreground font-semibold text-lg font-sans mb-1">Neil Dime</Text>
                    <Text className="text-muted-foreground text-sm font-sans">Scan to connect</Text>
                </View>
            </View>
        </View>
    );
}
