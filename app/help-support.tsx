import * as React from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, Mail, PhoneCall, ChevronRight, MessageCircle, Send } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HelpSupportScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View className="flex-1 bg-background">
            <View style={{ paddingTop: insets.top + 16 }} className="px-5 pb-6 bg-card border-b border-border/40 shadow-sm z-10">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 items-start justify-center">
                        <Icon as={ChevronLeft} className="text-foreground size-7" />
                    </Pressable>
                    <Text className="text-foreground font-semibold text-xl font-sans">Help & Support</Text>
                    <View className="w-10 h-10" />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                <View className="mb-8 items-center mt-4">
                    <View className="bg-primary/10 w-20 h-20 rounded-full items-center justify-center mb-4">
                        <Icon as={MessageCircle} className="text-primary size-10" />
                    </View>
                    <Text className="text-2xl font-bold text-foreground font-sans text-center">We're here to help</Text>
                    <Text className="text-muted-foreground font-sans text-center mt-2 px-4 leading-6">Choose how you would like to get in touch with our support team.</Text>
                </View>

                <View className="gap-y-4">
                    <Pressable className="bg-card border border-border/50 rounded-3xl p-5 flex-row items-center shadow-sm">
                        <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mr-4">
                            <Icon as={Mail} className="text-primary size-6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground font-bold text-base font-sans">Email Support</Text>
                            <Text className="text-muted-foreground text-sm font-sans mt-0.5">Response within 24 hours</Text>
                        </View>
                        <Icon as={ChevronRight} className="text-muted-foreground size-5" />
                    </Pressable>

                    <Pressable className="bg-card border border-border/50 rounded-3xl p-5 flex-row items-center shadow-sm">
                        <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mr-4">
                            <Icon as={PhoneCall} className="text-primary size-6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground font-bold text-base font-sans">Call Us</Text>
                            <Text className="text-muted-foreground text-sm font-sans mt-0.5">Mon-Fri, 9am-5pm EST</Text>
                        </View>
                        <Icon as={ChevronRight} className="text-muted-foreground size-5" />
                    </Pressable>
                </View>

                <View className="mt-8">
                    <Text className="text-foreground font-bold text-lg font-sans mb-4">Send us a message</Text>
                    <View className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
                        <TextInput
                            className="bg-transparent text-foreground border border-border p-4 rounded-xl min-h-[120px] pt-4 font-sans text-[15px]"
                            placeholder="Describe your issue here..."
                            placeholderTextColor="hsl(var(--muted-foreground))"
                            multiline
                            textAlignVertical="top"
                        />
                        <Pressable className="bg-primary py-4 rounded-full flex-row justify-center items-center mt-4 shadow-sm">
                            <Icon as={Send} className="text-primary-foreground size-5 mr-2" />
                            <Text className="text-primary-foreground font-bold text-base font-sans">Submit Request</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
