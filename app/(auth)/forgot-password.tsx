import { ForgotPasswordForm } from '@/components/forgot-password-form';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-primary">
      {/* Top Section */}
      <View style={{ paddingTop: insets.top + 16 }} className="px-6 pb-12">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-start justify-center">
            <Icon as={ChevronLeft} className="text-primary-foreground size-6" />
          </Pressable>
          <View className="flex-row items-center">
            <Text className="text-primary-foreground/80 font-sans mr-2">Remembered?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable className="bg-primary-foreground/20 px-3 py-1.5 rounded-full">
                <Text className="text-primary-foreground font-sans font-semibold text-sm">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View className="items-center mt-12 mb-8">
          <Text className="text-primary-foreground text-4xl font-bold font-sans tracking-tight">Osa Service</Text>
        </View>
      </View>

      {/* Bottom Sheet Section */}
      <View className="flex-1 bg-background rounded-t-[40px] px-6 pt-10 shadow-2xl pb-10">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="items-center justify-start pb-8"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive">
          <ForgotPasswordForm />
        </ScrollView>
      </View>
    </View>
  );
}
