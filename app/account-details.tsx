import * as React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AccountDetailsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View className="flex-1 bg-muted">
            {/* Header */}
            <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 bg-muted">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
                        <Icon as={ChevronLeft} className="text-primary size-6" />
                    </Pressable>
                    <Text className="text-foreground font-semibold text-lg font-sans flex-1 text-center mr-10">Account Details</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Profile Information */}
                <View className="gap-y-2 mb-6">
                    <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Profile Information</Text>
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        <View className="px-4 py-3.5 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1">Full Name</Text>
                            <Text className="text-foreground font-medium text-[15px] font-sans">Neil Dime</Text>
                        </View>
                        <View className="px-4 py-3.5">
                            <Text className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1">Email Address</Text>
                            <Text className="text-foreground font-medium text-[15px] font-sans">neildime03@gmail.com</Text>
                        </View>
                    </View>
                </View>

                {/* Linked Accounts */}
                <View className="gap-y-2">
                    <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Linked Accounts</Text>
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        <View className="flex-row items-center justify-between px-4 py-3.5">
                            <Text className="text-foreground font-medium text-[15px] font-sans">Google</Text>
                            <View className="bg-primary/10 px-3 py-1 rounded-full">
                                <Text className="text-primary text-xs font-semibold font-sans">Connected</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
