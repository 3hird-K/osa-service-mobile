import { ResetPasswordForm } from '@/components/reset-password-form';
import * as React from 'react';
import { View, Pressable, Image, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthBackground } from '@/components/auth-background';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <AuthBackground />
      
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-2 z-10">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white/50 border border-white/50 shadow-sm">
          <Icon as={ChevronLeft} className="text-primary size-6" />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-6 items-center pt-8"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {/* Icon */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(200).springify()}
          className="items-center mb-12"
        >
          <View className="relative">
            {/* Subtle background glow behind the logo */}
            <View className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />
            
            <BlurView 
              intensity={40} 
              tint="light"
              className="w-36 h-36 items-center justify-center rounded-[3.5rem] border border-white/50 overflow-hidden shadow-xl shadow-black/5"
            >
              <Image
                source={require('@/assets/images/image.png')}
                className="w-28 h-28"
                resizeMode="contain"
              />
            </BlurView>
          </View>
        </Animated.View>

        {/* Form Container */}
        <Animated.View 
          entering={FadeInUp.duration(800).delay(400).springify()}
          className="w-full max-w-sm"
        >
          <ResetPasswordForm />
        </Animated.View>

        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.duration(800).delay(600).springify()}
          className="flex-1 justify-end mt-12 mb-4 w-full items-center"
        >
          <Link href="/(auth)/sign-in" asChild>
            <Pressable className="flex-row items-center gap-2">
              <Text className="text-muted-foreground font-sans text-[15px]">
                Suddenly remembered it?
              </Text>
              <Text className="text-primary font-sans font-bold text-[15px]">
                Log In
              </Text>
            </Pressable>
          </Link>
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}
