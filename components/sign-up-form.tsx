import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Text } from '@/components/ui/text';
import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { type TextInput, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export function SignUpForm() {
  const { signUp, isLoaded } = useSignUp();
  const [activeStep, setActiveStep] = React.useState<1 | 2>(1);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  const lastNameRef = React.useRef<TextInput>(null);
  const usernameRef = React.useRef<TextInput>(null);
  const emailRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);

  const [error, setError] = React.useState<{
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    password?: string;
  }>({});

  function validateStepOne() {
    const nextError: typeof error = {};

    if (!firstName.trim()) nextError.firstName = 'First name is required.';
    if (!lastName.trim()) nextError.lastName = 'Last name is required.';
    if (!username.trim()) nextError.username = 'Username is required.';

    setError((current) => ({
      ...current,
      firstName: nextError.firstName,
      lastName: nextError.lastName,
      username: nextError.username,
    }));

    return Object.keys(nextError).length === 0;
  }

  function validateStepTwo() {
    const nextError: typeof error = {};

    if (!email.trim()) nextError.email = 'Email is required.';
    if (!password.trim()) nextError.password = 'Password is required.';

    setError((current) => ({
      ...current,
      email: nextError.email,
      password: nextError.password,
    }));

    return Object.keys(nextError).length === 0;
  }

  function goToNextStep() {
    if (!validateStepOne()) return;
    setActiveStep(2);
  }

  async function onSubmit() {
    if (!isLoaded) return;

    if (!validateStepOne()) {
      setActiveStep(1);
      return;
    }

    if (!validateStepTwo()) {
      setActiveStep(2);
      return;
    }

    try {
      await signUp.create({
        firstName,
        lastName,
        username,
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      router.push(`/(auth)/sign-up/verify-email?email=${email}` as any);
    } catch (err: any) {
      if (err?.errors) {
        const nextError: typeof error = {};
        for (const e of err.errors) {
          const message: string = e.message ?? '';
          const param: string = e.meta?.paramName ?? '';
          if (param === 'first_name') nextError.firstName = message;
          else if (param === 'last_name') nextError.lastName = message;
          else if (param === 'username') nextError.username = message;
          else if (param === 'email_address') nextError.email = message;
          else if (param === 'password') nextError.password = message;
          else nextError.email = message;
        }
        setError(nextError);
        return;
      }

      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') || err.message.toLowerCase().includes('email');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
        return;
      }
    }
  }

  return (
    <View className="w-full gap-4">
      <View className="gap-4">
        {activeStep === 1 ? (
          <Animated.View key="step-one" entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} className="gap-3.5">
            <View className="gap-1.5">
              <FloatingLabelInput
                id="firstName"
                label="First name"
                value={firstName}
                autoCapitalize="words"
                autoComplete="given-name"
                onChangeText={setFirstName}
                onSubmitEditing={() => lastNameRef.current?.focus()}
                returnKeyType="next"
              />
              {error.firstName ? <Text className="ml-1 text-xs font-medium text-destructive">{error.firstName}</Text> : null}
            </View>

            <View className="gap-1.5">
              <FloatingLabelInput
                ref={lastNameRef}
                id="lastName"
                label="Last name"
                value={lastName}
                autoCapitalize="words"
                autoComplete="family-name"
                onChangeText={setLastName}
                onSubmitEditing={() => usernameRef.current?.focus()}
                returnKeyType="next"
              />
              {error.lastName ? <Text className="ml-1 text-xs font-medium text-destructive">{error.lastName}</Text> : null}
            </View>

            <View className="gap-1.5">
              <FloatingLabelInput
                ref={usernameRef}
                id="username"
                label="Username"
                value={username}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setUsername}
                onSubmitEditing={goToNextStep}
                returnKeyType="next"
              />
              {error.username ? <Text className="ml-1 text-xs font-medium text-destructive">{error.username}</Text> : null}
            </View>

            <Button className="mt-6 w-full rounded-2xl bg-primary py-4 shadow-lg shadow-primary/30 active:scale-[0.98]" onPress={goToNextStep}>
              <Text className="font-sans text-[17px] font-bold text-primary-foreground">Next</Text>
              <Icon as={ArrowRight} size={18} className="text-primary-foreground" />
            </Button>
          </Animated.View>
        ) : (
          <Animated.View key="step-two" entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} className="gap-3.5">
            <View className="gap-1.5">
              <FloatingLabelInput
                ref={emailRef}
                id="email"
                label="Email address"
                value={email}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onChangeText={setEmail}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                returnKeyType="next"
              />
              {error.email ? <Text className="ml-1 text-xs font-medium text-destructive">{error.email}</Text> : null}
            </View>

            <View className="gap-1.5">
              <FloatingLabelInput
                ref={passwordInputRef}
                id="password"
                label="Create a password"
                value={password}
                secureTextEntry={!passwordVisible}
                onChangeText={setPassword}
                onSubmitEditing={onSubmit}
                returnKeyType="done"
                rightElement={
                  <Pressable
                    onPress={() => setPasswordVisible((current) => !current)}
                    className="h-full justify-center"
                  >
                    <Icon as={passwordVisible ? EyeOff : Eye} size={20} className="text-muted-foreground/40" />
                  </Pressable>
                }
              />
              {error.password ? <Text className="ml-1 text-xs font-medium text-destructive">{error.password}</Text> : null}
            </View>

            <View className="flex-row gap-3 pt-6">
              <Button variant="outline" className="flex-1 rounded-2xl py-4 border-border bg-white active:bg-muted" onPress={() => setActiveStep(1)}>
                <Icon as={ArrowLeft} size={18} className="text-muted-foreground" />
                <Text className="font-sans text-[15px] font-bold text-muted-foreground">Back</Text>
              </Button>

              <Button className="flex-1 rounded-2xl bg-primary py-4 shadow-lg shadow-primary/30 active:scale-[0.98]" onPress={onSubmit}>
                <Text className="font-sans text-[15px] font-bold text-primary-foreground">Create Account</Text>
              </Button>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

