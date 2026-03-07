import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Camera, Play, Coffee, User, ChevronRight, LogOut } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Alert, Image, Pressable, RefreshControl } from 'react-native';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isActive, setIsActive] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    // Simulate initial fetch
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const currentActivity = "Library Assistance";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  // Data for the 2 completed activities
  const completedActivities = [
    { id: '1', name: 'Cafeteria', hours: 2, date: 'March 07, 2026' },
    { id: '2', name: 'Fitness Gym', hours: 1.5, date: 'March 06, 2026' },
    { id: '3', name: 'Library Assistance', hours: 2, date: 'March 05, 2026' },
    { id: '4', name: 'Cafeteria', hours: 2, date: 'March 04, 2026' },
    { id: '5', name: 'Fitness Gym', hours: 1.5, date: 'March 03, 2026' },
    { id: '6', name: 'Library Assistance', hours: 2, date: 'March 02, 2026' },
  ];

  const totalHoursRendered = completedActivities.reduce((acc, curr) => acc + curr.hours, 0);

  const handleBreak = () => {
    Alert.alert(
      "Take a Break?",
      "Your current progress will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm Break", onPress: () => setIsActive(false), style: "destructive" }
      ]
    );
  };



  return (
    <SafeAreaView className="flex-1 bg-muted" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-5 pt-2 mt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View className="flex-row items-center justify-between mb-8 mt-2 px-1">
          <View>
            <Text className="text-muted-foreground text-[13px] font-semibold font-sans uppercase tracking-wider">{getGreeting()}</Text>
            <Text className="text-foreground font-bold text-3xl font-sans tracking-tight mt-0.5">{user?.firstName ?? 'Neil Dime'}</Text>
          </View>
          <Popover>
            <PopoverTrigger asChild>
              <Pressable
                className="w-12 h-12 rounded-full bg-card items-center justify-center overflow-hidden border border-border/50 shadow-sm"
              >
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="w-full h-full" />
                ) : (
                  <Icon as={User} size={24} className="text-muted-foreground" />
                )}
              </Pressable>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-64 p-0 bg-popover border-border/10 rounded-2xl shadow-xl">
              <View className="p-4 flex-row items-center border-b border-border/10">
                <View className="w-10 h-10 rounded-full bg-accent items-center justify-center overflow-hidden mr-3">
                  {user?.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} className="w-full h-full" />
                  ) : (
                    <Icon as={User} size={20} className="text-muted-foreground" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-popover-foreground font-semibold font-sans">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Neil Dime'}</Text>
                  <Text className="text-muted-foreground text-xs font-sans mt-0.5" numberOfLines={1}>
                    {user?.primaryEmailAddress?.emailAddress ?? 'neildime03@gmail.com'}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => signOut()}
                className="flex-row items-center px-4 py-3.5 rounded-b-2xl"
              >
                <Icon as={LogOut} size={18} className="text-muted-foreground mr-3" />
                <Text className="text-popover-foreground font-medium font-sans text-[15px]">Logout</Text>
              </Pressable>
            </PopoverContent>
          </Popover>
        </View>

        {/* Main Action Card */}
        <View className="bg-card p-6 rounded-[28px] mb-6 shadow-sm border border-border/50">
          {isLoading ? (
            <View className="gap-y-4">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-8 w-48 mb-6" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-14 w-full rounded-[20px]" />
            </View>
          ) : (
            <>
              <View className="mb-4">
                <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1 font-sans">Current Activity</Text>
                <Text className="text-foreground text-2xl font-black font-sans tracking-tight">{currentActivity}</Text>
              </View>

              <View className="flex-row items-center mb-8">
                <View className={`px-3 py-1 rounded-full border ${isActive ? 'bg-primary/10 border-primary/20' : 'bg-muted border-border/50'}`}>
                  <Text className={`text-[10px] font-bold uppercase font-sans tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isActive ? '● Session Active' : 'Waiting for Start'}
                  </Text>
                </View>
                <View className="ml-auto items-end">
                  <Text className="text-muted-foreground text-[10px] uppercase font-bold text-right font-sans">Total Rendered</Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-foreground text-2xl font-black font-sans tracking-tight">{totalHoursRendered}</Text>
                    <Text className="text-muted-foreground text-xs font-bold ml-1 font-sans">hrs</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                {isActive && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-card border-border/50 rounded-[20px] py-4 shadow-sm"
                    onPress={handleBreak}
                  >
                    <Icon as={Coffee} size={20} className="text-foreground" />
                  </Button>
                )}

                {!isActive ? (
                  <Button
                    className="flex-[3] bg-primary rounded-[20px] py-4 shadow-sm"
                    onPress={() => setIsActive(true)}
                  >
                    <Icon as={Play} size={20} className="text-primary-foreground mr-2" />
                    <Text className="text-primary-foreground font-black uppercase tracking-tight font-sans">Check In</Text>
                  </Button>
                ) : (
                  <Button
                    className="flex-[3] bg-destructive rounded-[20px] py-4 shadow-sm"
                    onPress={() => router.push('/camera')}
                  >
                    <Icon as={Camera} size={20} className="text-destructive-foreground mr-2" />
                    <Text className="text-destructive-foreground font-black uppercase tracking-tight font-sans">Check Out</Text>
                  </Button>
                )}
              </View>
            </>
          )}
        </View>

        {/* Recent Logs Section */}
        <View className="flex-row justify-between items-end mb-4 px-2">
          <View>
            <Text className="text-foreground text-xl font-bold font-sans tracking-tight">Recent Logs</Text>
            <Text className="text-muted-foreground text-xs font-sans mt-0.5">Your latest sessions</Text>
          </View>
          <Text className="text-muted-foreground text-sm font-medium font-sans">History <ChevronRight size={14} /></Text>
        </View>

        <View className="bg-card rounded-2xl border border-border/50 overflow-hidden mb-4 shadow-sm">
          {isLoading ? (
            <View className="p-4 gap-y-6">
              {[1, 2, 3].map((i) => (
                <View key={`skeleton-${i}`} className="flex-row items-center border-border/30 pb-4 border-b last:border-0 last:pb-0">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <View className="flex-1 gap-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </View>
                  <View className="items-end gap-y-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            completedActivities.map((activity, index) => (
              <View
                key={activity.id}
                className={`p-4 flex-row justify-between items-center ${index < completedActivities.length - 1 ? 'border-b border-border/30' : ''}`}
              >
                <View className="flex-row items-center">
                  <View className="bg-accent w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Icon as={Calendar} size={20} className="text-primary" />
                  </View>
                  <View>
                    <Text className="text-foreground font-semibold text-[15px] font-sans">{activity.name}</Text>
                    <Text className="text-muted-foreground text-xs font-sans mt-0.5">{activity.date}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-foreground font-bold text-[15px] font-sans">{activity.hours}h</Text>
                  <View className="bg-primary/10 mt-1 px-2 py-0.5 rounded-full">
                    <Text className="text-primary text-[10px] font-bold uppercase font-sans">Finished</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}