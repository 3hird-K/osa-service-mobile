import * as React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function TermsConditionsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View className="flex-1 bg-background">
            <View style={{ paddingTop: insets.top + 16 }} className="px-5 pb-6 bg-card border-b border-border/40 shadow-sm z-10">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 items-start justify-center">
                        <Icon as={ChevronLeft} className="text-foreground size-7" />
                    </Pressable>
                    <Text className="text-foreground font-semibold text-xl font-sans">Terms & Conditions</Text>
                    <View className="w-10 h-10" />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-foreground font-sans mb-3">Legal Terms</Text>
                    <Text className="text-muted-foreground font-sans text-sm">Last updated: March 6, 2026</Text>
                    <Text className="text-muted-foreground font-sans text-base leading-6 mt-4 opacity-90">
                        Please read these terms and conditions carefully before using the Osa Service mobile application. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                    </Text>
                </View>

                <View className="gap-y-6">
                    <View className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <Text className="text-primary font-bold text-sm tracking-widest uppercase mb-2 font-sans">Section 1</Text>
                        <Text className="text-foreground font-bold text-lg font-sans mb-3">Acceptance of Terms</Text>
                        <Text className="text-muted-foreground text-[15px] font-sans leading-relaxed">
                            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. Furthermore, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </Text>
                    </View>

                    <View className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <Text className="text-primary font-bold text-sm tracking-widest uppercase mb-2 font-sans">Section 2</Text>
                        <Text className="text-foreground font-bold text-lg font-sans mb-3">User Account & Security</Text>
                        <Text className="text-muted-foreground text-[15px] font-sans leading-relaxed">
                            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. Osa Service cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements.
                        </Text>
                    </View>

                    <View className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <Text className="text-primary font-bold text-sm tracking-widest uppercase mb-2 font-sans">Section 3</Text>
                        <Text className="text-foreground font-bold text-lg font-sans mb-3">Privacy</Text>
                        <Text className="text-muted-foreground text-[15px] font-sans leading-relaxed">
                            Your privacy is very important to us. We designed our Data Management capabilities to make important choices about how you use Osa Service. We encourage you to read the Privacy Policy to understand how your information is handled.
                        </Text>
                    </View>

                    <View className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <Text className="text-primary font-bold text-sm tracking-widest uppercase mb-2 font-sans">Section 4</Text>
                        <Text className="text-foreground font-bold text-lg font-sans mb-3">Termination</Text>
                        <Text className="text-muted-foreground text-[15px] font-sans leading-relaxed">
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
