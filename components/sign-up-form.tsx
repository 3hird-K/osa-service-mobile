import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
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

  const inputClass = 'rounded-xl border-border/60 bg-muted/50 px-4 py-3.5 font-sans text-[15px] text-foreground';

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

      console.error(JSON.stringify(err, null, 2));
    }
  }

  return (
    <View className="w-full gap-5">
      <View className="gap-1.5">
        <Text className="ml-1 font-sans text-sm text-muted-foreground">Step {activeStep} of 2</Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 items-center gap-1.5">
            <View
              className={`h-9 w-9 items-center justify-center rounded-full border ${
                activeStep === 1 ? 'border-primary bg-primary' : 'border-border bg-muted'
              }`}
            >
              <Text
                className={`font-sans text-sm font-semibold ${
                  activeStep === 1 ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                1
              </Text>
            </View>
            <Text
              className={`font-sans text-xs ${activeStep === 1 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
            >
              Personal
            </Text>
          </View>

          <View className={`h-0.5 flex-1 rounded-full ${activeStep === 2 ? 'bg-primary' : 'bg-border'}`} />

          <View className="flex-1 items-center gap-1.5">
            <View
              className={`h-9 w-9 items-center justify-center rounded-full border ${
                activeStep === 2 ? 'border-primary bg-primary' : 'border-border bg-muted'
              }`}
            >
              <Text
                className={`font-sans text-sm font-semibold ${
                  activeStep === 2 ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                2
              </Text>
            </View>
            <Text
              className={`font-sans text-xs ${activeStep === 2 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
            >
              Credentials
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-4">
        {activeStep === 1 ? (
          <Animated.View key="step-one" entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} className="gap-4">
            <View className="gap-1.5">
              <Text className="ml-1 font-sans text-sm font-medium text-foreground">First Name</Text>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                autoCapitalize="words"
                autoComplete="given-name"
                onChangeText={setFirstName}
                onSubmitEditing={() => lastNameRef.current?.focus()}
                returnKeyType="next"
                submitBehavior="submit"
                className={inputClass}
              />
              {error.firstName ? <Text className="ml-1 text-xs font-medium text-destructive">{error.firstName}</Text> : null}
            </View>

            <View className="gap-1.5">
              <Text className="ml-1 font-sans text-sm font-medium text-foreground">Last Name</Text>
              <Input
                ref={lastNameRef}
                id="lastName"
                placeholder="Doe"
                value={lastName}
                autoCapitalize="words"
                autoComplete="family-name"
                onChangeText={setLastName}
                onSubmitEditing={() => usernameRef.current?.focus()}
                returnKeyType="next"
                submitBehavior="submit"
                className={inputClass}
              />
              {error.lastName ? <Text className="ml-1 text-xs font-medium text-destructive">{error.lastName}</Text> : null}
            </View>

            <View className="gap-1.5">
              <Text className="ml-1 font-sans text-sm font-medium text-foreground">Username</Text>
              <Input
                ref={usernameRef}
                id="username"
                placeholder="johndoe123"
                value={username}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setUsername}
                onSubmitEditing={goToNextStep}
                returnKeyType="next"
                submitBehavior="submit"
                className={inputClass}
              />
              {error.username ? <Text className="ml-1 text-xs font-medium text-destructive">{error.username}</Text> : null}
            </View>

            <Button className="mt-2 w-full rounded-xl bg-primary py-4" onPress={goToNextStep}>
              <Text className="font-sans text-[15px] font-semibold text-primary-foreground">Next</Text>
              <Icon as={ArrowRight} size={18} className="text-primary-foreground" />
            </Button>
          </Animated.View>
        ) : (
          <Animated.View key="step-two" entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} className="gap-4">
            <View className="gap-1.5">
              <Text className="ml-1 font-sans text-sm font-medium text-foreground">Email Address</Text>
              <Input
                ref={emailRef}
                id="email"
                placeholder="john@example.com"
                value={email}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onChangeText={setEmail}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                returnKeyType="next"
                submitBehavior="submit"
                className={inputClass}
              />
              {error.email ? <Text className="ml-1 text-xs font-medium text-destructive">{error.email}</Text> : null}
            </View>

            <View className="gap-1.5">
              <Text className="ml-1 font-sans text-sm font-medium text-foreground">Password</Text>
              <View className="relative flex-row items-center">
                <Input
                  ref={passwordInputRef}
                  id="password"
                  placeholder="Create a password"
                  value={password}
                  secureTextEntry={!passwordVisible}
                  onChangeText={setPassword}
                  onSubmitEditing={onSubmit}
                  returnKeyType="done"
                  className={`flex-1 pr-12 ${inputClass}`}
                />

                <Pressable
                  onPress={() => setPasswordVisible((current) => !current)}
                  className="absolute right-4 h-full justify-center"
                >
                  <Icon as={passwordVisible ? EyeOff : Eye} size={18} className="text-muted-foreground" />
                </Pressable>
              </View>
              {error.password ? <Text className="ml-1 text-xs font-medium text-destructive">{error.password}</Text> : null}
            </View>

            <View className="flex-row gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl py-4" onPress={() => setActiveStep(1)}>
                <Icon as={ArrowLeft} size={18} className="text-foreground" />
                <Text className="font-sans text-[15px] font-semibold text-foreground">Back</Text>
              </Button>

              <Button className="flex-1 rounded-xl bg-primary py-4" onPress={onSubmit}>
                <Text className="font-sans text-[15px] font-semibold text-primary-foreground">Create Account</Text>
              </Button>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

