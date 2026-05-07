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
        title: 'Work Tracking Compliance',
        content: 'By using Osa Service, you agree to accurately track your work sessions using the provided QR scanning system. Deliberate falsification of time logs or bypassing the verification process is strictly prohibited.',
    },
    {
        number: '2',
        title: 'Evidence & Verification',
        content: 'Users are required to upload photo proofs during active sessions as evidence of work performed. By uploading these images, you consent to their storage and review by authorized OSA administrators for auditing purposes.',
    },
    {
        number: '3',
        title: 'Location Services',
        content: 'This application requires access to location services to verify that work is performed at the designated sites. Location data is only recorded during active task sessions and is protected under our data privacy standards.',
    },
    {
        number: '4',
        title: 'Account Integrity',
        content: 'You are responsible for maintaining the security of your credentials. Any logs recorded under your account are considered your responsibility. Osa Service reserves the right to suspend accounts found in violation of these standards.',
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
