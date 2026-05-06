import { Buffer } from 'buffer';
global.Buffer = Buffer;
import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Toaster } from 'sonner-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Stack, Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { Lora_400Regular } from '@expo-google-fonts/lora';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

SplashScreen.preventAutoHideAsync();

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const [fontsLoaded] = useFonts({
    'Plus Jakarta Sans': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'Lora': Lora_400Regular,
    'IBM Plex Mono': IBMPlexMono_400Regular,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <RootLayoutNav colorScheme={colorScheme} />
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav({ colorScheme }: { colorScheme: 'light' | 'dark' | undefined }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, segments, isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <OfflineBanner />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* 🛠️ Conditional Stack: Automatically switches between auth and app screens */}
      <Stack screenOptions={{ headerShown: false }}>
        {!isSignedIn ? (
          // Auth Screens (Only available when logged out)
          <>
            <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
            <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
            <Stack.Screen name="(auth)/reset-password" options={SIGN_IN_SCREEN_OPTIONS} />
            <Stack.Screen name="(auth)/forgot-password" options={SIGN_IN_SCREEN_OPTIONS} />
          </>
        ) : (
          // App Screens (Only available when logged in)
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="account-details" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="faq" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="help-support" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="qr-code" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="terms-conditions" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="camera" options={{ headerShown: false, presentation: 'modal' }} />
          </>
        )}
      </Stack>

      <Toaster position="top-center" />
      <PortalHost />
    </ThemeProvider>
  );
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
};

const SIGN_UP_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerShown: false,
  headerTransparent: true,
  gestureEnabled: false,
} as const;
