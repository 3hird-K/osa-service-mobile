import { SignUpForm } from '@/components/sign-up-form';
import * as React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
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
            <Text className="text-primary-foreground/80 font-sans mr-2">Already have an account?</Text>
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
          <SignUpForm />

          {/* <View className="w-full mt-10 gap-y-6">
            <View className="flex-row items-center justify-center">
              <View className="flex-1 h-[1px] bg-border/50" />
              <Text className="text-muted-foreground font-sans px-4 text-sm">Or sign up with</Text>
              <View className="flex-1 h-[1px] bg-border/50" />
            </View>

            <View className="flex-row gap-x-4 w-full">
              <Pressable className="flex-1 flex-row items-center justify-center bg-transparent border border-border rounded-xl py-4 space-x-2">
                <Text className="font-bold text-lg text-foreground mr-2">G</Text>
                <Text className="text-foreground font-sans font-medium">Google</Text>
              </Pressable>
              <Pressable className="flex-1 flex-row items-center justify-center bg-transparent border border-border rounded-xl py-4 space-x-2">
                <Text className="font-bold text-lg text-[#1877F2] mr-2">f</Text>
                <Text className="text-foreground font-sans font-medium">Facebook</Text>
              </Pressable>
            </View>
          </View> */}
        </ScrollView>
      </View>
    </View>
  );
}
