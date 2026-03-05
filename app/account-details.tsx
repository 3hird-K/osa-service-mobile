import * as React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, Crown } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AccountDetailsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View style={{ paddingTop: insets.top + 16 }} className="px-5 pb-6 bg-card border-b border-border/40 shadow-sm z-10">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 items-start justify-center">
                        <Icon as={ChevronLeft} className="text-foreground size-7" />
                    </Pressable>
                    <Text className="text-foreground font-semibold text-xl font-sans">Account Details</Text>
                    <View className="w-10 h-10" />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* Membership Status Box */}
                {/* <View className="bg-primary/10 border border-primary/20 rounded-3xl p-6 mb-8 items-center">
                    <View className="bg-primary w-16 h-16 rounded-full items-center justify-center mb-3 shadow-sm">
                        <Icon as={Crown} className="text-primary-foreground size-8" />
                    </View>
                    <Text className="text-foreground font-bold text-2xl font-sans mb-1">Premium Member</Text>
                    <Text className="text-muted-foreground font-sans text-sm">Active since October 2023</Text>
                </View> */}

                {/* Details List */}
                <View className="gap-y-6">
                    <View className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <Text className="text-primary font-bold text-sm tracking-widest uppercase mb-4 font-sans">Profile Information</Text>

                        <View className="mb-4">
                            <Text className="text-muted-foreground text-[13px] font-sans mb-1 uppercase tracking-wider">Full Name</Text>
                            <Text className="text-foreground font-semibold text-base font-sans">Neil Dime</Text>
                        </View>

                        <View className="h-[1px] bg-border/40 my-2" />

                        <View className="mt-4">
                            <Text className="text-muted-foreground text-[13px] font-sans mb-1 uppercase tracking-wider">Email Address</Text>
                            <Text className="text-foreground font-semibold text-base font-sans">neildime03@gmail.com</Text>
                        </View>
                    </View>

                    <View className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <Text className="text-primary font-bold text-sm tracking-widest uppercase mb-4 font-sans">Linked Accounts</Text>

                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-foreground font-medium text-base font-sans">Google</Text>
                            <Text className="text-muted-foreground text-sm font-sans italic">Connected</Text>
                        </View>

                        {/* <View className="h-[1px] bg-border/40 my-2" /> */}

                        {/* <View className="flex-row items-center justify-between mt-4">
                            <Text className="text-foreground font-medium text-base font-sans">Facebook</Text>
                            <Text className="text-muted-foreground text-sm font-sans">Not Connected</Text>
                        </View> */}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
