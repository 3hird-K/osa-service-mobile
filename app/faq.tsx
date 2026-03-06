import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, MessageCircleQuestion } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ_DATA = [
    {
        category: 'Account & Security',
        items: [
            {
                question: 'How do I change my password?',
                answer: 'You can change your password by logging out and using the "Forgot Password?" link on the sign-in screen to securely reset it via email.',
            },
            {
                question: 'Can I update my email address?',
                answer: 'For security purposes, email addresses cannot be changed directly in the app. Please contact our support team if you need to migrate your account.',
            },
            {
                question: 'How is my data protected?',
                answer: 'We use industry-standard encryption protocols. Your data is never sold to third parties, and authentication is handled securely.',
            }
        ]
    },
    {
        category: 'App Usage & Features',
        items: [
            {
                question: 'How do I switch to Dark Mode?',
                answer: 'Navigate to the Account tab and locate the "Preferences" section. You can toggle the Dark Mode switch to immediately change the application theme.',
            },
            {
                question: 'What is the QR Code for?',
                answer: 'Your personal QR Code acts as a quick digital identifier. Other users can scan it to instantly connect with you.',
            },
            {
                question: 'Are there any hidden fees?',
                answer: 'No, creating an account and using the standard features of the Osa Service application is entirely free.',
            }
        ]
    }
];

export default function FAQScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-muted">
            {/* Header */}
            <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 bg-muted">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
                        <Icon as={ChevronLeft} className="text-primary size-6" />
                    </Pressable>
                    <Text className="text-foreground font-semibold text-lg font-sans flex-1 text-center mr-10">FAQ</Text>
                </View>
            </View>

            <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
                <View className="mb-6 px-1">
                    <Text className="text-2xl font-bold text-foreground font-sans mb-2">How can we help?</Text>
                    <Text className="text-muted-foreground font-sans text-sm leading-5">Browse commonly asked questions below.</Text>
                </View>

                {FAQ_DATA.map((section, sectionIdx) => (
                    <View key={sectionIdx} className="mb-6">
                        <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider mb-2">{section.category}</Text>
                        <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                            <Accordion type="multiple" collapsible defaultValue={[]} className="w-full px-4">
                                {section.items.map((item, index) => (
                                    <AccordionItem key={index} value={'item-' + sectionIdx + '-' + index}>
                                        <AccordionTrigger>
                                            <Text className="font-sans font-medium text-foreground text-left flex-1 text-[15px]">{item.question}</Text>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Text className="text-muted-foreground font-sans text-sm leading-5 pb-1">{item.answer}</Text>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </View>
                    </View>
                ))}

                <View className="bg-card rounded-xl border border-border/50 p-6 items-center mt-2 mb-8">
                    <Icon as={MessageCircleQuestion} className="text-primary size-8 mb-3" />
                    <Text className="text-foreground font-semibold text-base font-sans text-center mb-1">Still have questions?</Text>
                    <Text className="text-muted-foreground font-sans text-center text-sm mb-4">Our support team is happy to help.</Text>
                    <Link href="/help-support" asChild>
                        <Pressable className="bg-primary px-6 py-3 rounded-xl">
                            <Text className="text-primary-foreground font-semibold font-sans text-sm">Contact Support</Text>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>
        </View>
    );
}
