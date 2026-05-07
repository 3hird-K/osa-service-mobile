import { SignInForm } from '@/components/sign-in-form';
import * as React from 'react';
import { View, Pressable, Image, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthBackground } from '@/components/auth-background';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <AuthBackground />
      
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingTop: insets.top + 60, 
          paddingBottom: insets.bottom + 40 
        }}
        contentContainerClassName="px-6 items-center"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {/* Logo / Brand */}
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
          <SignInForm />
        </Animated.View>

        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.duration(800).delay(600).springify()}
          className="flex-1 justify-end mt-12 mb-4 w-full items-center"
        >
          <Link href="/(auth)/sign-up" asChild>
            <Pressable className="flex-row items-center gap-2">
              <Text className="text-muted-foreground font-sans text-[15px]">
                Don't have an account?
              </Text>
              <Text className="text-primary font-sans font-bold text-[15px]">
                Sign Up
              </Text>
            </Pressable>
          </Link>
        </Animated.View>
      </KeyboardAwareScrollView >
    </View>
  );
}
