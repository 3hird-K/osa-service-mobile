import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useUser } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = { headerShown: false };

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View>
            <Text className="text-muted-foreground text-sm font-sans font-medium">{greeting}</Text>
            <Text className="text-foreground text-2xl font-bold font-sans tracking-tight">
              {user?.firstName || 'Welcome'}
            </Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Content */}
        <View className="flex-1 px-5 pt-4">
          {/* Welcome Card */}
          <View className="bg-primary rounded-2xl p-6 mb-6">
            <Text className="text-primary-foreground text-xl font-bold font-sans mb-2">
              Osa Service
            </Text>
            <Text className="text-primary-foreground/80 font-sans text-sm leading-relaxed">
              Your premium service companion. Explore features and manage your account with ease.
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-card rounded-2xl p-5 border border-border/50">
              <Text className="text-muted-foreground text-xs font-sans font-medium uppercase tracking-wider mb-2">Status</Text>
              <Text className="text-foreground text-lg font-bold font-sans">Active</Text>
            </View>
            <View className="flex-1 bg-card rounded-2xl p-5 border border-border/50">
              <Text className="text-muted-foreground text-xs font-sans font-medium uppercase tracking-wider mb-2">Plan</Text>
              <Text className="text-foreground text-lg font-bold font-sans">Premium</Text>
            </View>
          </View>

          {/* Recent Section */}
          <View className="bg-card rounded-2xl p-5 border border-border/50">
            <Text className="text-foreground font-semibold text-base font-sans mb-3">Recent Activity</Text>
            <View className="gap-y-4">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-primary mr-3" />
                <Text className="text-muted-foreground font-sans text-sm flex-1">Account verified successfully</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-primary/40 mr-3" />
                <Text className="text-muted-foreground font-sans text-sm flex-1">Profile updated</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-primary/20 mr-3" />
                <Text className="text-muted-foreground font-sans text-sm flex-1">Logged in from new device</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button onPress={toggleColorScheme} size="icon" variant="ghost" className="rounded-full h-10 w-10">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5 text-muted-foreground" />
    </Button>
  );
}
