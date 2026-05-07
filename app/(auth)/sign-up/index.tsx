import { SignUpForm } from '@/components/sign-up-form';
import { View, Pressable, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthBackground } from '@/components/auth-background';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

export default function SignUpScreen() {
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
          <SignUpForm />
        </Animated.View>

        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.duration(800).delay(600).springify()}
          className="flex-1 justify-end mt-12 mb-4 w-full items-center"
        >
          <Link href="/(auth)/sign-in" asChild>
            <Pressable className="flex-row items-center gap-2">
              <Text className="text-muted-foreground font-sans text-[15px]">
                Already have an account?
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
