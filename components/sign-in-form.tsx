import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useSignIn } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import * as React from 'react';
import { type TextInput, View, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [needs2FA, setNeeds2FA] = React.useState(false);
  const [code, setCode] = React.useState('');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string; code?: string }>({});

  async function onSubmit() {
    if (!isLoaded) return;
    try {
      const signInAttempt = await signIn.create({ identifier: email, password });
      if (signInAttempt.status === 'complete') {
        setError({});
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }
      if (signInAttempt.status === 'needs_second_factor') {
        // Prepare email code 2FA
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
        setNeeds2FA(true);
        setError({});
        return;
      }
      console.error(JSON.stringify(signInAttempt, null, 2));
    } catch (err) {
      if (err instanceof Error) {
        const isEmailMessage = err.message.toLowerCase().includes('identifier') || err.message.toLowerCase().includes('email');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  async function onVerify2FA() {
    if (!isLoaded) return;
    try {
      const result = await signIn.attemptSecondFactor({ strategy: 'email_code', code });
      if (result.status === 'complete') {
        setError({});
        await setActive({ session: result.createdSessionId });
        return;
      }
      console.error(JSON.stringify(result, null, 2));
    } catch (err) {
      if (err instanceof Error) {
        setError({ code: err.message });
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
      {needs2FA ? (
        <>
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground font-sans ml-1">
              Verification Code
            </Text>
            <Text className="text-xs text-muted-foreground font-sans ml-1 mb-1">
              A code was sent to your email
            </Text>
            <Input
              placeholder="Enter code"
              keyboardType="number-pad"
              onChangeText={setCode}
              returnKeyType="send"
              onSubmitEditing={onVerify2FA}
              className="rounded-xl border-border/60 bg-muted/50 px-4 py-3.5 font-sans text-foreground text-[15px] text-center"
            />
            {error.code ? (
              <Text className="text-xs font-medium text-destructive ml-1">{error.code}</Text>
            ) : null}
          </View>
          <Button className="w-full rounded-xl py-4 bg-primary" onPress={onVerify2FA}>
            <Text className="text-primary-foreground font-semibold font-sans text-[15px]">Verify</Text>
          </Button>
          <Pressable onPress={() => { setNeeds2FA(false); setCode(''); setError({}); }}>
            <Text className="text-sm text-primary font-sans font-medium text-center">Back to sign in</Text>
          </Pressable>
        </>
      ) : (
        <>
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
                  placeholder="Enter your password"
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

          <View className="items-end">
            <Link asChild href={`/(auth)/forgot-password?email=${email}` as any}>
              <Pressable>
                <Text className="text-sm text-primary font-sans font-medium">Forgot password?</Text>
              </Pressable>
            </Link>
          </View>

          <Button className="w-full rounded-xl py-4 bg-primary" onPress={onSubmit}>
            <Text className="text-primary-foreground font-semibold font-sans text-[15px]">Sign In</Text>
          </Button>
        </>
      )}
    </View>
  );
}
