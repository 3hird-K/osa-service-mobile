import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams } from 'expo-router';
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
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        return;
      }
      console.error(JSON.stringify(signUpAttempt, null, 2));
    } catch (err) {
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
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  return (
    <View className="gap-5 w-full">
      <View className="gap-4">
        <View className="gap-1.5">
          <Input
            id="code"
            placeholder="000000"
            autoCapitalize="none"
            onChangeText={setCode}
            returnKeyType="send"
            keyboardType="numeric"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            onSubmitEditing={onSubmit}
            className="rounded-2xl border-border/60 bg-muted/30 px-4 py-4 font-sans text-foreground text-center text-xl tracking-[0.4em]"
          />
          {error ? (
            <Text className="text-xs font-medium text-destructive text-center">{error}</Text>
          ) : null}
        </View>

        <Button className="w-full rounded-2xl py-4 bg-primary shadow-lg shadow-primary/30" onPress={onSubmit}>
          <Text className="text-primary-foreground font-bold font-sans text-[17px]">Verify</Text>
        </Button>

        <View className="items-center mt-2">
          <Button
            variant="ghost"
            className="px-0 py-2 h-auto active:bg-transparent"
            disabled={countdown > 0}
            onPress={onResendCode}
          >
            <Text className="text-center font-sans font-semibold text-primary text-[15px]">
              Resend code{countdown > 0 ? ' ' : ''}
              {countdown > 0 ? (
                <Text className="font-sans font-medium text-primary/60" style={TABULAR_NUMBERS_STYLE}>
                  ({countdown}s)
                </Text>
              ) : null}
            </Text>
          </Button>
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
    if (intervalRef.current) clearInterval(intervalRef.current);
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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCountdown]);

  return { countdown, restartCountdown: startCountdown };
}
