import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import * as React from 'react';
import { View } from 'react-native';

export function ForgotPasswordForm() {
  const { email: emailParam = '' } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = React.useState(emailParam);
  const { signIn, isLoaded } = useSignIn();
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});

  const onSubmit = async () => {
    if (!email) {
      setError({ email: 'Email is required' });
      return;
    }
    if (!isLoaded) {
      return;
    }

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      router.push(`/(auth)/reset-password?email=${email}`);
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError({ email: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="gap-6 w-full">
      <View className="items-center pb-2">
        <Text className="text-2xl font-bold font-sans text-foreground">Forgot password?</Text>
        <Text className="text-muted-foreground mt-2 font-sans font-medium text-center px-4">Enter your email to reset your password</Text>
      </View>
      <View className="gap-5 mt-2">
        <View className="gap-2">
          <Input
            id="email"
            defaultValue={email}
            placeholder="Email Address"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            onChangeText={setEmail}
            onSubmitEditing={onSubmit}
            returnKeyType="send"
            className="rounded-2xl border-border px-5 py-4 font-sans text-foreground bg-transparent"
            placeholderTextColor="hsl(var(--muted-foreground))"
          />
          {error.email ? (
            <Text className="text-sm font-medium text-destructive ml-2">{error.email}</Text>
          ) : null}
        </View>
        <View className="mt-2">
          <Button className="w-full rounded-2xl py-6 bg-primary" onPress={onSubmit}>
            <Text className="text-primary-foreground font-semibold font-sans">Reset your password</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
