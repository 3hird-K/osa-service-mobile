import { VerifyEmailForm } from '@/components/verify-email-form';
import { ScrollView, View, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as React from 'react';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior="padding">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
          <Icon as={ChevronLeft} className="text-primary size-6" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 items-center pt-8"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View className="items-center mb-10">
          <Image
            source={require('@/assets/images/image.png')}
            className="w-32 h-32 rounded-2xl mb-5"
            resizeMode="contain"
          />
        </View>

        {/* Form */}
        <View className="w-full max-w-sm">
          <VerifyEmailForm />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
