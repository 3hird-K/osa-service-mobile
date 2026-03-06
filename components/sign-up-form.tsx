import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as React from 'react';
import { type TextInput, View, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export function SignUpForm() {
  const { signUp, isLoaded } = useSignUp();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});

  async function onSubmit() {
    if (!isLoaded) return;
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      router.push(`/(auth)/sign-up/verify-email?email=${email}` as any);
    } catch (err) {
      if (err instanceof Error) {
        const isEmailMessage = err.message.toLowerCase().includes('identifier') || err.message.toLowerCase().includes('email');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-5 w-full">
      <View className="gap-4">
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground font-sans ml-1">Email</Text>
          <Input
            id="email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            onChangeText={setEmail}
            onSubmitEditing={onEmailSubmitEditing}
            returnKeyType="next"
            submitBehavior="submit"
            className="rounded-xl border-border/60 bg-muted/50 px-4 py-3.5 font-sans text-foreground text-[15px]"
          />
          {error.email ? (
            <Text className="text-xs font-medium text-destructive ml-1">{error.email}</Text>
          ) : null}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground font-sans ml-1">Password</Text>
          <View className="relative flex-row items-center">
            <Input
              ref={passwordInputRef}
              id="password"
              placeholder="Create a password"
              secureTextEntry={!passwordVisible}
              onChangeText={setPassword}
              returnKeyType="send"
              onSubmitEditing={onSubmit}
              className="flex-1 rounded-xl border-border/60 bg-muted/50 px-4 py-3.5 font-sans text-foreground text-[15px]"
            />
            <Pressable
              onPress={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-4 h-full justify-center"
            >
              <Icon as={passwordVisible ? EyeOff : Eye} size={18} className="text-muted-foreground" />
            </Pressable>
          </View>
          {error.password ? (
            <Text className="text-xs font-medium text-destructive ml-1">{error.password}</Text>
          ) : null}
        </View>
      </View>

      <Button className="w-full rounded-xl py-4 bg-primary mt-2" onPress={onSubmit}>
        <Text className="text-primary-foreground font-semibold font-sans text-[15px]">Create Account</Text>
      </Button>
    </View>
  );
}
