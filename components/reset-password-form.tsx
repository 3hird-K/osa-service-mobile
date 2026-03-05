import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as React from 'react';
import { TextInput, View } from 'react-native';

export function ResetPasswordForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const codeInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState({ code: '', password: '' });

  async function onSubmit() {
    if (!isLoaded) {
      return;
    }
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        // Set the active session to
        // the newly created session (user is now signed in)
        setActive({ session: result.createdSessionId });
        return;
      }
      // TODO: Handle other statuses
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isPasswordMessage = err.message.toLowerCase().includes('password');
        setError({ code: '', password: isPasswordMessage ? err.message : '' });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onPasswordSubmitEditing() {
    codeInputRef.current?.focus();
  }

  return (
    <View className="gap-6 w-full">
      <View className="items-center pb-2">
        <Text className="text-2xl font-bold font-sans text-foreground">Reset password</Text>
        <Text className="text-muted-foreground mt-2 font-sans font-medium text-center px-4">Enter the code sent to your email and set a new password</Text>
      </View>
      <View className="gap-5 mt-2">
        <View className="gap-2">
          <Input
            id="password"
            placeholder="New Password"
            secureTextEntry
            onChangeText={setPassword}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={onPasswordSubmitEditing}
            className="rounded-2xl border-border px-5 py-4 font-sans text-foreground bg-transparent"
            placeholderTextColor="hsl(var(--muted-foreground))"
          />
          {error.password ? (
            <Text className="text-sm font-medium text-destructive ml-2">{error.password}</Text>
          ) : null}
        </View>
        <View className="gap-2">
          <Input
            id="code"
            placeholder="Verification code"
            autoCapitalize="none"
            onChangeText={setCode}
            returnKeyType="send"
            keyboardType="numeric"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            onSubmitEditing={onSubmit}
            className="rounded-2xl border-border px-5 py-4 font-sans text-foreground bg-transparent"
            placeholderTextColor="hsl(var(--muted-foreground))"
          />
          {error.code ? (
            <Text className="text-sm font-medium text-destructive ml-2">{error.code}</Text>
          ) : null}
        </View>
        <View className="mt-2">
          <Button className="w-full rounded-2xl py-6 bg-primary" onPress={onSubmit}>
            <Text className="text-primary-foreground font-semibold font-sans">Reset Password</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
