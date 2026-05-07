import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useSignIn } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import * as React from 'react';
import { type TextInput, View, Pressable } from 'react-native';
import { Eye, EyeOff, Info } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [needs2FA, setNeeds2FA] = React.useState(false);
  const [code, setCode] = React.useState('');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string; code?: string }>({});
  const { isOnline } = useNetworkStatus();

  async function onSubmit() {
    if (!isLoaded) return;
    if (!isOnline) {
      setError({ email: 'You are offline. Please check your connection and try again.' });
      return;
    }
    try {
      const signInAttempt = await signIn.create({ identifier, password });
      if (signInAttempt.status === 'complete') {
        setError({});
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }
      if (signInAttempt.status === 'needs_second_factor') {
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
        setNeeds2FA(true);
        setError({});
        return;
      }
    } catch (err: any) {
      if (err?.errors) {
        const e = err.errors[0];
        const msg: string = e?.message ?? '';
        const param: string = e?.meta?.paramName ?? '';
        setError(param === 'password' ? { password: msg } : { email: msg });
        return;
      }
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email') ||
          err.message.toLowerCase().includes('username');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
        return;
      }
    }
  }

  async function onVerify2FA() {
    if (!isLoaded) return;
    if (!isOnline) {
      setError({ code: 'You are offline. Please check your connection and try again.' });
      return;
    }
    try {
      const result = await signIn.attemptSecondFactor({ strategy: 'email_code', code });
      if (result.status === 'complete') {
        setError({});
        await setActive({ session: result.createdSessionId });
        return;
      }
    } catch (err) {
      if (err instanceof Error) {
        setError({ code: err.message });
        return;
      }
    }
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-4 w-full">
      {needs2FA ? (
        <>
          <View className="gap-1.5">
            <Text className="text-[13px] font-semibold text-foreground/70 font-sans ml-1">
              Verification Code
            </Text>
            <Text className="text-xs text-muted-foreground/60 font-sans ml-1 mb-1">
              A code was sent to your email
            </Text>
            <FloatingLabelInput
              label="Enter code"
              keyboardType="number-pad"
              onChangeText={setCode}
              value={code}
              returnKeyType="send"
              onSubmitEditing={onVerify2FA}
              className="text-center text-lg"
            />
            {error.code ? (
              <Text className="text-xs font-medium text-destructive ml-1">{error.code}</Text>
            ) : null}
          </View>
          <Button className="w-full rounded-xl py-3 bg-primary shadow-sm shadow-primary/20" onPress={onVerify2FA}>
            <Text className="text-primary-foreground font-bold font-sans text-[16px]">Verify</Text>
          </Button>
          <Pressable onPress={() => { setNeeds2FA(false); setCode(''); setError({}); }}>
            <Text className="text-sm text-primary/80 font-sans font-semibold text-center">Back to sign in</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View className="gap-3">
            <View className="gap-1.5">
              <FloatingLabelInput
                id="identifier"
                label="Username or email"
                keyboardType="default"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect={false}
                value={identifier}
                onChangeText={setIdentifier}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
              />
              {error.email ? (
                <Text className="text-xs font-medium text-destructive ml-1">{error.email}</Text>
              ) : null}
            </View>

            <View className="gap-1.5">
              <FloatingLabelInput
                ref={passwordInputRef}
                id="password"
                label="Password"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                rightElement={
                  <Pressable
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    className="h-full justify-center"
                  >
                    <Icon as={passwordVisible ? EyeOff : Eye} size={20} className="text-muted-foreground/40" />
                  </Pressable>
                }
              />
              {error.password ? (
                <Text className="text-xs font-medium text-destructive ml-1">{error.password}</Text>
              ) : null}
            </View>
          </View>

          <Button
            className="w-full rounded-2xl py-4 bg-primary shadow-lg shadow-primary/30 mt-4 active:scale-[0.98]"
            onPress={onSubmit}
          >
            <Text className="text-primary-foreground font-bold font-sans text-[17px]">Log in</Text>
          </Button>

          <View className="items-center mt-6">
            <Link asChild href={`/(auth)/forgot-password?email=${identifier}` as any}>
              <Pressable className="active:opacity-60 py-2">
                <Text className="text-[15px] text-muted-foreground font-sans font-medium">
                  Forgot password?
                </Text>
              </Pressable>
            </Link>
          </View>
        </>
      )}
    </View>
  );
}
