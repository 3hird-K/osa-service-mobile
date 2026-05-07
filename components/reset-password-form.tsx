import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import * as React from 'react';
import { TextInput, View } from 'react-native';

export function ResetPasswordForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const codeInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState({ code: '', password: '' });

  async function onSubmit() {
    if (!isLoaded) return;
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      if (result.status === 'complete') {
        setActive({ session: result.createdSessionId });
        return;
      }
    } catch (err) {
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
    <View className="gap-5 w-full">
      <View className="items-center mb-2">
        <Text className="text-2xl font-bold font-sans text-foreground">Reset password</Text>
        <Text className="text-muted-foreground mt-2 font-sans text-sm text-center leading-5">
          Enter the code from your email and choose a new password.
        </Text>
      </View>

      <View className="gap-4">
        <View className="gap-1.5">
          <FloatingLabelInput
            id="password"
            label="New password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            returnKeyType="next"
            onSubmitEditing={onPasswordSubmitEditing}
          />
          {error.password ? (
            <Text className="text-xs font-medium text-destructive ml-1">{error.password}</Text>
          ) : null}
        </View>

        <View className="gap-1.5">
          <FloatingLabelInput
            ref={codeInputRef}
            id="code"
            label="Verification code"
            value={code}
            autoCapitalize="none"
            onChangeText={setCode}
            returnKeyType="send"
            keyboardType="numeric"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            onSubmitEditing={onSubmit}
            className="text-center text-lg tracking-[0.3em]"
          />
          {error.code ? (
            <Text className="text-xs font-medium text-destructive ml-1">{error.code}</Text>
          ) : null}
        </View>

        <Button className="w-full rounded-xl py-3.5 bg-primary shadow-md shadow-primary/20 mt-2" onPress={onSubmit}>
          <Text className="text-primary-foreground font-bold font-sans text-[16px]">Reset Password</Text>
        </Button>
      </View>
    </View>
  );
}
