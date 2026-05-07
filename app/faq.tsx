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
        category: 'Task Management',
        items: [
            {
                question: 'How do I start a task session?',
                answer: 'Simply scan the QR code associated with your assigned task. The app will automatically begin tracking your hours and location.',
            },
            {
                question: 'What if I forget to stop my session?',
                answer: 'If a session is left running, please notify your supervisor immediately. They can manually adjust your time log in the administration portal.',
            },
            {
                question: 'Can I delete or edit a time log?',
                answer: 'You can delete logs that are still "In Progress" or "Finished" but not yet "Verified". Once a supervisor verifies a log, it becomes a permanent record.',
            }
        ]
    },
    {
        category: 'Work Verification',
        items: [
            {
                question: 'Why am I required to take photos?',
                answer: 'Photo proofs are essential for work verification. They provide visual evidence of your progress and help ensure quality standards are met.',
            },
            {
                question: 'How many photos should I capture?',
                answer: 'We recommend capturing at least 2-3 photos per session: one at the start, one during the work, and one upon completion.',
            },
            {
                question: 'Are my location and data secure?',
                answer: 'Yes. We only track location data during active sessions to verify work site presence. Your data is encrypted and used only for administrative auditing.',
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
