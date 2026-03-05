import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { Image, type TextInput, View, Pressable } from 'react-native';
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

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      router.push(`/(auth)/sign-up/verify-email?email=${email}`);
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email');
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
    <View className="gap-6 w-full">
      <View className="items-center pb-2">
        <Text className="text-2xl font-bold font-sans text-foreground">Get started free.</Text>
        <Text className="text-muted-foreground mt-2 font-sans font-medium">Join Osa Service today.</Text>
      </View>
      <View className="gap-5 mt-2">
        <View className="gap-2">
          <Input
            id="email"
            placeholder="Email Address"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            onChangeText={setEmail}
            onSubmitEditing={onEmailSubmitEditing}
            returnKeyType="next"
            submitBehavior="submit"
            className="rounded-2xl border-border px-5 py-4 font-sans text-foreground bg-transparent"
            placeholderTextColor="hsl(var(--muted-foreground))"
          />
          {error.email ? (
            <Text className="text-sm font-medium text-destructive ml-2">{error.email}</Text>
          ) : null}
        </View>
        <View className="gap-2">
          <View className="relative flex-row items-center">
            <Input
              ref={passwordInputRef}
              id="password"
              placeholder="Password"
              secureTextEntry={!passwordVisible}
              onChangeText={setPassword}
              returnKeyType="send"
              onSubmitEditing={onSubmit}
              className="flex-1 rounded-2xl border-border px-5 py-4 font-sans text-foreground bg-transparent"
              placeholderTextColor="hsl(var(--muted-foreground))"
            />
            <Pressable
              onPress={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-4 h-full justify-center">
              <Icon
                as={passwordVisible ? EyeOff : Eye}
                size={20}
                className="text-muted-foreground"
              />
            </Pressable>
          </View>
          {error.password ? (
            <Text className="text-sm font-medium text-destructive ml-2">{error.password}</Text>
          ) : null}
        </View>

        <View className="mt-2">
          <Button className="w-full rounded-2xl py-6 bg-primary" onPress={onSubmit}>
            <Text className="text-primary-foreground font-semibold font-sans">Sign up</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
