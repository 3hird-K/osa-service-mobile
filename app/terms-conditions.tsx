import * as React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const SECTIONS = [
    {
        number: '1',
        title: 'Acceptance of Terms',
        content: 'By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. Furthermore, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.',
    },
    {
        number: '2',
        title: 'User Account & Security',
        content: 'You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. Osa Service cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements.',
    },
    {
        number: '3',
        title: 'Privacy',
        content: 'Your privacy is very important to us. We designed our Data Management capabilities to make important choices about how you use Osa Service. We encourage you to read the Privacy Policy to understand how your information is handled.',
    },
    {
        number: '4',
        title: 'Termination',
        content: 'We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.',
    },
];

export default function TermsConditionsScreen() {
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
                    <Text className="text-foreground font-semibold text-lg font-sans flex-1 text-center mr-10">Terms & Conditions</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <View className="mb-6 px-1">
                    <Text className="text-2xl font-bold text-foreground font-sans mb-1">Legal Terms</Text>
                    <Text className="text-muted-foreground font-sans text-xs">Last updated: March 6, 2026</Text>
                    <Text className="text-muted-foreground font-sans text-sm leading-5 mt-3">
                        Please read these terms carefully before using the Osa Service application.
                    </Text>
                </View>

                <View className="gap-y-3">
                    {SECTIONS.map((section) => (
                        <View key={section.number} className="bg-card rounded-xl border border-border/50 p-5">
                            <View className="flex-row items-center mb-2">
                                <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center mr-2">
                                    <Text className="text-primary text-xs font-bold font-sans">{section.number}</Text>
                                </View>
                                <Text className="text-foreground font-semibold text-[15px] font-sans">{section.title}</Text>
                            </View>
                            <Text className="text-muted-foreground text-sm font-sans leading-relaxed">{section.content}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
