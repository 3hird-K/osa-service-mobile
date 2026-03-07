import * as React from 'react';
import { View, ScrollView, Pressable, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function AccountDetailsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—';
    const email = user?.primaryEmailAddress?.emailAddress ?? '—';
    const username = user?.username ?? '—';
    const imageUrl = user?.imageUrl;

    const externalAccounts = user?.externalAccounts ?? [];

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
                {/* Avatar */}
                <View className="items-center my-6">
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} className="w-20 h-20 rounded-full" />
                    ) : (
                        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
                            <Text className="text-primary font-bold text-2xl font-sans">
                                {fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </Text>
                        </View>
                    )}
                    <Text className="text-foreground font-semibold text-xl font-sans mt-3">{fullName}</Text>
                    <Text className="text-muted-foreground text-sm font-sans mt-1">{email}</Text>
                </View>

                {/* Profile Information */}
                <View className="gap-y-2 mb-6">
                    <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Profile Information</Text>
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        <DetailRow label="First Name" value={user?.firstName ?? '—'} showBorder />
                        <DetailRow label="Last Name" value={user?.lastName ?? '—'} showBorder />
                        <DetailRow label="Username" value={username} showBorder />
                        <DetailRow label="Email Address" value={email} />
                    </View>
                </View>

                {/* Linked Accounts */}
                <View className="gap-y-2">
                    <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Linked Accounts</Text>
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        {externalAccounts.length === 0 ? (
                            <View className="px-4 py-3.5">
                                <Text className="text-muted-foreground text-[15px] font-sans">No linked accounts</Text>
                            </View>
                        ) : (
                            externalAccounts.map((account, i) => (
                                <View
                                    key={account.id}
                                    className={`flex-row items-center justify-between px-4 py-3.5 ${i < externalAccounts.length - 1 ? 'border-b border-border/30' : ''}`}
                                >
                                    <Text className="text-foreground font-medium text-[15px] font-sans capitalize">
                                        {account.provider}
                                    </Text>
                                    <View className={`px-3 py-1 rounded-full ${account.verification?.status === 'verified' ? 'bg-primary/10' : 'bg-muted'}`}>
                                        <Text className={`text-xs font-semibold font-sans ${account.verification?.status === 'verified' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {account.verification?.status === 'verified' ? 'Connected' : 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function DetailRow({ label, value, showBorder }: { label: string; value: string; showBorder?: boolean }) {
    return (
        <View className={`px-4 py-3.5 ${showBorder ? 'border-b border-border/30' : ''}`}>
            <Text className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1">{label}</Text>
            <Text className="text-foreground font-medium text-[15px] font-sans">{value}</Text>
        </View>
    );
}
