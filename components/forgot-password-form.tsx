import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

export function ForgotPasswordForm() {
  const { email: emailParam = '' } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = React.useState(emailParam);
  const { signIn, isLoaded } = useSignIn();
  const [error, setError] = React.useState<{ email?: string }>({});

  const onSubmit = async () => {
    if (!email) {
      setError({ email: 'Email is required' });
      return;
    }
    if (!isLoaded) return;
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      router.push(`/(auth)/reset-password?email=${email}` as any);
    } catch (err) {
      if (err instanceof Error) {
        setError({ email: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="gap-5 w-full">
      <View className="items-center mb-2">
        <Text className="text-2xl font-bold font-sans text-foreground">Forgot password?</Text>
        <Text className="text-muted-foreground mt-2 font-sans text-sm text-center leading-5">
          Enter your email and we'll send you a code to reset your password.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground font-sans ml-1">Email</Text>
          <Input
            id="email"
            defaultValue={email}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            onChangeText={setEmail}
            onSubmitEditing={onSubmit}
            returnKeyType="send"
            className="rounded-xl border-border/60 bg-muted/50 px-4 py-3.5 font-sans text-foreground text-[15px]"
          />
          {error.email ? (
            <Text className="text-xs font-medium text-destructive ml-1">{error.email}</Text>
          ) : null}
        </View>

        <Button className="w-full rounded-xl py-4 bg-primary" onPress={onSubmit}>
          <Text className="text-primary-foreground font-semibold font-sans text-[15px]">Send Reset Code</Text>
        </Button>
      </View>
    </View>
  );
}
