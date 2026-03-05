import * as React from 'react';
import { View, Pressable, Image } from 'react-native';
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
            <View style={{ paddingTop: insets.top + 16 }} className="px-4 flex-row items-center justify-between pb-4">
                <Pressable onPress={() => router.back()} className="bg-background w-10 h-10 rounded-full items-center justify-center shadow-sm">
                    <Icon as={ChevronLeft} className="text-foreground size-5" />
                </Pressable>
                <Text className="text-foreground font-semibold text-lg flex-1 text-center mr-10 relative left-[-4px] font-sans">My QR Code</Text>
            </View>
            <View className="flex-1 items-center justify-center px-6">
                <View className="bg-background w-full aspect-square rounded-[40px] items-center justify-center shadow-2xl p-8 border border-border">
                    <Icon as={QrCode} className="text-foreground" size={200} />
                    <Text className="text-muted-foreground text-center mt-8 font-sans">Accounts' QR Code</Text>
                </View>
            </View>
        </View>
    );
}
