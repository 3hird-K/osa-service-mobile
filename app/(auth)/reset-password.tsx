import { ResetPasswordForm } from '@/components/reset-password-form';
import * as React from 'react';
import { View, Pressable, Image, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-2 z-10">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full active:bg-muted">
          <Icon as={ChevronLeft} className="text-foreground size-6" />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-6 items-center pt-8"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {/* Icon */}
        <View className="items-center mb-6">
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
          <ResetPasswordForm />
        </View>

        {/* Footer */}
        <View className="flex-1 justify-end mt-12 mb-4">
          <Link href="/(auth)/sign-in" asChild>
            <Pressable className="border border-border/60 rounded-xl px-10 py-3 active:bg-muted/30 shadow-sm shadow-black/5 bg-background">
              <Text className="text-foreground/80 font-sans font-bold text-[15px]">Back to log in</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
