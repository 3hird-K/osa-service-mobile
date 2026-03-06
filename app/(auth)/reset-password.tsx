import { ResetPasswordForm } from '@/components/reset-password-form';
import * as React from 'react';
import { ScrollView, View, Pressable, Image } from 'react-native';
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
          <ResetPasswordForm />
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-center mt-8">
          <Text className="text-muted-foreground font-sans text-sm">Back to </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="text-primary font-sans font-semibold text-sm">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}
