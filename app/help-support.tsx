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
        <View className="flex-1 bg-muted">
            {/* Header */}
            <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 bg-muted">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
                        <Icon as={ChevronLeft} className="text-primary size-6" />
                    </Pressable>
                    <Text className="text-foreground font-semibold text-lg font-sans flex-1 text-center mr-10">Help & Support</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View className="items-center mt-4 mb-8">
                    <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
                        <Icon as={MessageCircle} className="text-primary size-8" />
                    </View>
                    <Text className="text-xl font-bold text-foreground font-sans text-center">We're here to help</Text>
                    <Text className="text-muted-foreground font-sans text-center mt-1 text-sm leading-5">Choose how to reach our support team.</Text>
                </View>

                {/* Contact Options */}
                <View className="gap-y-2 mb-8">
                    <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Contact</Text>
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        <Pressable className="flex-row items-center px-4 py-3.5 border-b border-border/30">
                            <View className="w-8 h-8 rounded-lg bg-accent items-center justify-center mr-3">
                                <Icon as={Mail} className="text-primary size-4" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-foreground font-medium text-[15px] font-sans">Email Support</Text>
                                <Text className="text-muted-foreground text-xs font-sans mt-0.5">Response within 24 hours</Text>
                            </View>
                            <Icon as={ChevronRight} className="text-muted-foreground/50 size-4" />
                        </Pressable>
                        <Pressable className="flex-row items-center px-4 py-3.5">
                            <View className="w-8 h-8 rounded-lg bg-accent items-center justify-center mr-3">
                                <Icon as={PhoneCall} className="text-primary size-4" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-foreground font-medium text-[15px] font-sans">Call Us</Text>
                                <Text className="text-muted-foreground text-xs font-sans mt-0.5">Mon-Fri, 9am-5pm EST</Text>
                            </View>
                            <Icon as={ChevronRight} className="text-muted-foreground/50 size-4" />
                        </Pressable>
                    </View>
                </View>

                {/* Message Form */}
                <View className="gap-y-2">
                    <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Send a Message</Text>
                    <View className="bg-card rounded-xl border border-border/50 p-4">
                        <TextInput
                            className="bg-muted/50 text-foreground border border-border/60 p-4 rounded-xl min-h-[120px] font-sans text-[15px]"
                            placeholder="Describe your issue..."
                            placeholderTextColor="hsl(var(--muted-foreground))"
                            multiline
                            textAlignVertical="top"
                        />
                        <Pressable className="bg-primary py-3.5 rounded-xl flex-row justify-center items-center mt-4">
                            <Icon as={Send} className="text-primary-foreground size-4 mr-2" />
                            <Text className="text-primary-foreground font-semibold text-[15px] font-sans">Submit</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
