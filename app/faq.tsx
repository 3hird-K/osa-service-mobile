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
        <View className="flex-1 bg-background">
            {/* Header */}
            <View style={{ paddingTop: insets.top + 16 }} className="px-5 pb-6 bg-card border-b border-border/40 shadow-sm z-10">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 items-start justify-center">
                        <Icon as={ChevronLeft} className="text-foreground size-7" />
                    </Pressable>
                    <Text className="text-foreground font-semibold text-xl font-sans">FAQ</Text>
                    <View className="w-10 h-10" />
                </View>
            </View>

            <ScrollView contentContainerClassName="p-6 pb-12" showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-3xl font-bold text-foreground font-sans mb-3">How can we help?</Text>
                    <Text className="text-muted-foreground font-sans text-base leading-6">Browse our commonly asked questions below. If you can't find what you need, feel free to contact support.</Text>
                </View>

                {FAQ_DATA.map((section, sectionIdx) => (
                    <View key={sectionIdx} className="mb-8">
                        <Text className="text-primary font-bold text-sm tracking-widest uppercase mb-4 font-sans">{section.category}</Text>
                        <View className="bg-card rounded-3xl overflow-hidden border border-border/50">
                            <Accordion
                                type="multiple"
                                collapsible
                                defaultValue={[]}
                                className="w-full px-4 py-2"
                            >
                                {section.items.map((item, index) => (
                                    <AccordionItem key={index} value={`item-${sectionIdx}-${index}`}>
                                        <AccordionTrigger>
                                            <Text className="font-sans font-semibold text-foreground text-left flex-1 text-[15px]">{item.question}</Text>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Text className="text-muted-foreground font-sans text-[15px] leading-6 py-2 pt-1 opacity-90">
                                                {item.answer}
                                            </Text>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </View>
                    </View>
                ))}

                <View className="mt-4 mb-8 bg-primary/10 rounded-3xl p-6 items-center border border-primary/20">
                    <Icon as={MessageCircleQuestion} className="text-primary size-10 mb-3" />
                    <Text className="text-foreground font-bold text-lg font-sans text-center mb-2">Still have questions?</Text>
                    <Text className="text-muted-foreground font-sans text-center text-sm mb-4">Our support team is just a message away.</Text>
                    <Link href="/help-support" asChild>
                        <Pressable className="bg-primary px-6 py-3 rounded-full">
                            <Text className="text-primary-foreground font-bold font-sans">Contact Support</Text>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>
        </View>
    );
}
