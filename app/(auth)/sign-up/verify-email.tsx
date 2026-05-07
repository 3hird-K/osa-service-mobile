import { VerifyEmailForm } from '@/components/verify-email-form';
import { ScrollView, View, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as React from 'react';
import { AuthBackground } from '@/components/auth-background';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <AuthBackground />
      
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        {/* Header */}
        <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-2 z-10">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white/50 border border-white/50 shadow-sm">
            <Icon as={ChevronLeft} className="text-primary size-6" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 items-center pt-8"
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <Animated.View 
            entering={FadeInDown.duration(800).delay(200).springify()}
            className="items-center mb-10"
          >
            <View className="w-32 h-32 items-center justify-center bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-border/50">
              <Image
                source={require('@/assets/images/image.png')}
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Form Container */}
          <Animated.View 
            entering={FadeInUp.duration(800).delay(400).springify()}
            className="w-full max-w-sm"
          >
            <VerifyEmailForm />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
