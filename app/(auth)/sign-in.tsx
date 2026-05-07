import { SignInForm } from '@/components/sign-in-form';
import * as React from 'react';
import { View, Pressable, Image, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 80, paddingBottom: 40 }}
      contentContainerClassName="px-6 items-center"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      {/* Logo / Brand */}
      <View className="items-center mb-10">
        <View className="w-32 h-32 items-center justify-center overflow-hidden">
          <Image
            source={require('@/assets/images/image.png')}
            className="w-24 h-24"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Form */}
      <View className="w-full max-w-sm">
        <SignInForm />
      </View>

      {/* Footer */}
      <View className="flex-1 justify-end mt-12 mb-4">
        <Link href="/(auth)/sign-up" asChild>
          <Pressable className="border border-primary/30 rounded-xl px-10 py-3 active:bg-primary/5 shadow-sm shadow-primary/10 bg-background">
            <Text className="text-primary font-sans font-bold text-[15px]">Create new account</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAwareScrollView >
  );
}
