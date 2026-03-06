import { SignUpForm } from '@/components/sign-up-form';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 40 }}
        contentContainerClassName="px-6 items-center"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Brand */}
        <View className="items-center mb-12">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-5">
            <Text className="text-primary-foreground text-2xl font-bold font-sans">O</Text>
          </View>
          <Text className="text-foreground text-3xl font-bold font-sans tracking-tight">Create account</Text>
          <Text className="text-muted-foreground mt-2 font-sans text-base">Get started with Osa Service</Text>
        </View>

        {/* Form */}
        <View className="w-full max-w-sm">
          <SignUpForm />
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-center mt-8">
          <Text className="text-muted-foreground font-sans text-sm">Already have an account? </Text>
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
