import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignUp } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { type TextStyle, View } from 'react-native';

const RESEND_CODE_INTERVAL_SECONDS = 30;

const TABULAR_NUMBERS_STYLE: TextStyle = { fontVariant: ['tabular-nums'] };

export function VerifyEmailForm() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const { countdown, restartCountdown } = useCountdown(RESEND_CODE_INTERVAL_SECONDS);

  async function onSubmit() {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        return;
      }
      // TODO: Handle other statuses
      // If the status is not complete, check why. User may need to
      // complete further steps.
      console.error(JSON.stringify(signUpAttempt, null, 2));
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  async function onResendCode() {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      restartCountdown();
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  return (
    <View className="gap-6 w-full">
      <View className="items-center pb-2">
        <Text className="text-2xl font-bold font-sans text-foreground">Verify your email.</Text>
        <Text className="text-muted-foreground mt-2 font-sans font-medium text-center px-4 leading-6">
          Enter the verification code sent to {email || 'your email'}
        </Text>
      </View>

      <View className="gap-5 mt-2">
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
            className="rounded-2xl border-border px-5 py-4 font-sans text-foreground bg-transparent text-center text-sm "
            placeholderTextColor="hsl(var(--muted-foreground))"
          />
          {!error ? null : (
            <Text className="text-sm font-medium text-destructive text-center mt-1">{error}</Text>
          )}
        </View>

        <View className="gap-4 mt-2">
          <Button className="w-full rounded-2xl py-6 bg-primary" onPress={onSubmit}>
            <Text className="text-primary-foreground font-semibold font-sans">Verify Code</Text>
          </Button>

          <View className="flex-row justify-between items-center px-1">
            <Button variant="ghost" className="px-0 py-2 h-auto active:bg-transparent" disabled={countdown > 0} onPress={onResendCode}>
              <Text className="text-center font-sans font-medium text-primary">
                Resend Code {' '}
                {countdown > 0 ? (
                  <Text className="font-sans font-medium text-primary/70" style={TABULAR_NUMBERS_STYLE}>
                    ({countdown}s)
                  </Text>
                ) : null}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

function useCountdown(seconds = 30) {
  const [countdown, setCountdown] = React.useState(seconds);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = React.useCallback(() => {
    setCountdown(seconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  React.useEffect(() => {
    startCountdown();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCountdown]);

  return { countdown, restartCountdown: startCountdown };
}
