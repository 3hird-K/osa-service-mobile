import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Camera, Play, Coffee, User, ChevronRight, LogOut, WifiOff } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Image, Pressable, RefreshControl, Modal, Alert } from 'react-native';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { notifyLogout } from '@/hooks/useHeartbeat';
import { loadCache, saveCache } from '@/hooks/useOfflineStorage';

type Activity = {
  id: string;
  name: string;
  hours: number;
  date: string;
  description: string;
};

const CACHE_KEY = 'cache:home_activities';

// Default mock data (also used as the first write to cache)
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    name: 'Cafeteria',
    hours: 2,
    date: 'March 07, 2026',
    description: 'Prepared stations for lunch rush and helped restock utensils during peak hours.',
  },
  {
    id: '2',
    name: 'Fitness Gym',
    hours: 1.5,
    date: 'March 06, 2026',
    description: 'Assisted with equipment checks and guided members through machine sanitation flow.',
  },
  {
    id: '3',
    name: 'Library Assistance',
    hours: 2,
    date: 'March 05, 2026',
    description: 'Supported shelving tasks, desk inquiries, and catalog updates in Building 23 - 3rd Floor.',
  },
  {
    id: '4',
    name: 'Cafeteria',
    hours: 2,
    date: 'March 04, 2026',
    description: 'Managed serving line organization and logged end-of-shift inventory counts.',
  },
  {
    id: '5',
    name: 'Fitness Gym',
    hours: 1.5,
    date: 'March 03, 2026',
    description: 'Monitored check-ins and assisted with floor clean-up and weight area arrangement.',
  },
  {
    id: '6',
    name: 'Library Assistance',
    hours: 2,
    date: 'March 02, 2026',
    description: 'Handled circulation desk support and directed students to reserved study sections.',
  },
];

const formatDuration = (totalSeconds: number) => {
  const hrs = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const [isActive, setIsActive] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [completedActivities, setCompletedActivities] = React.useState<Activity[]>([]);
  const [fromCache, setFromCache] = React.useState(false);
  const [sessionStartedAt, setSessionStartedAt] = React.useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [proofImages, setProofImages] = React.useState<string[]>([]);
  const [isTakingProof, setIsTakingProof] = React.useState(false);
  const [permissionDialog, setPermissionDialog] = React.useState(false);
  const [showAllProofs, setShowAllProofs] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [logDetailsDialog, setLogDetailsDialog] = React.useState(false);
  const [heartbeatStatus, setHeartbeatStatus] = React.useState<'idle' | 'sending' | 'ok' | 'fail'>('idle');
  const [lastPing, setLastPing] = React.useState<string>('Never');

  const API_URL = 'https://server-osa-service.onrender.com';

  const sendHeartbeat = React.useCallback(async () => {
    if (!user?.id) {
      console.log('[Heartbeat] No user ID yet');
      return;
    }
    setHeartbeatStatus('sending');
    try {
      console.log(`[Heartbeat] Pinging ${API_URL}/users/${user.id}/heartbeat`);
      const res = await fetch(`${API_URL}/users/${user.id}/heartbeat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (res.ok) {
        setHeartbeatStatus('ok');
        setLastPing(new Date().toLocaleTimeString());
      } else {
        const errorData = await res.text();
        setHeartbeatStatus('fail');
        console.error(`[Heartbeat] Server Error (${res.status}):`, errorData);
        Alert.alert('Status Sync Error', `Server returned ${res.status}. Your user ID might not be registered yet.`);
      }
    } catch (err: any) {
      setHeartbeatStatus('fail');
      console.error(`[Heartbeat] Network Error:`, err?.message);
      // Only show alert once to avoid spamming
      Alert.alert('Connection Error', 'Could not sync your online status. Check your internet connection.');
    }
  }, [user?.id]);

  // ─── Heartbeat: mark user as online every 30s ───
  React.useEffect(() => {
    if (!user?.id) return;

    // Fire immediately on login
    sendHeartbeat();

    // Then every 30 seconds
    const interval = setInterval(sendHeartbeat, 30_000);
    return () => clearInterval(interval);
  }, [sendHeartbeat, user?.id]);

  const fetchActivities = React.useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);

    if (!isOnline) {
      // Offline: try to restore from cache
      const cached = await loadCache<Activity[]>(CACHE_KEY);
      if (cached) {
        setCompletedActivities(cached);
        setFromCache(true);
      } else {
        // No cache yet, show mock data
        setCompletedActivities(MOCK_ACTIVITIES);
        setFromCache(true);
      }
      setIsLoading(false);
      if (isRefresh) setRefreshing(false);
      return;
    }

    // Online: simulate fetch then cache result
    await new Promise((r) => setTimeout(r, 1500));
    setCompletedActivities(MOCK_ACTIVITIES);
    setFromCache(false);
    await saveCache(CACHE_KEY, MOCK_ACTIVITIES);
    setIsLoading(false);
    if (isRefresh) setRefreshing(false);
  }, [isOnline]);

  React.useEffect(() => {
    // On mount: try cache first, then fetch
    (async () => {
      const cached = await loadCache<Activity[]>(CACHE_KEY);
      if (cached) {
        setCompletedActivities(cached);
        setFromCache(!isOnline);
        setIsLoading(false);
        // Still refresh in background if online
        if (isOnline) fetchActivities();
      } else {
        fetchActivities();
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!isActive || !sessionStartedAt) {
      setElapsedSeconds(0);
      return;
    }

    setElapsedSeconds(Math.floor((Date.now() - sessionStartedAt) / 1000));
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, sessionStartedAt]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchActivities(true);
  }, [fetchActivities]);


  const currentActivity = "Library Assistance";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const totalHoursRendered = completedActivities.reduce((acc, curr) => acc + curr.hours, 0);
  const [breakDialog, setBreakDialog] = React.useState(false);

  const handleCheckIn = () => {
    setIsActive(true);
    setSessionStartedAt(Date.now());
    setProofImages([]);
  };

  const handleSessionStop = () => {
    setIsActive(false);
    setSessionStartedAt(null);
    setElapsedSeconds(0);
  };

  const handleBreak = () => {
    setBreakDialog(true);
  };

  const handleCaptureProof = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDialog(true);
      return;
    }

    setIsTakingProof(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setProofImages((prev) => [result.assets[0].uri, ...prev].slice(0, 6));
      }
    } finally {
      setIsTakingProof(false);
    }
  };

  const openLogDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setLogDetailsDialog(true);
  };

  const previewProofImages = proofImages.slice(0, 3);
  const hiddenProofCount = Math.max(proofImages.length - 3, 0);

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
          <View className="flex-1 pr-3">
            <Text className="text-muted-foreground text-[13px] font-semibold font-sans uppercase tracking-wider">{getGreeting()}</Text>
            <Text className="text-foreground font-bold text-3xl font-sans tracking-tight mt-0.5" numberOfLines={1}>
              {user?.username ?? 'Neil Dime'}
            </Text>
            <Pressable 
              onPress={sendHeartbeat}
              className="flex-row items-center gap-2 mt-1 active:opacity-50"
            >
              <View className={`w-2 h-2 rounded-full ${heartbeatStatus === 'ok' ? 'bg-green-500' : heartbeatStatus === 'sending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
              <Text className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                Status: {heartbeatStatus === 'ok' ? `Active (Last: ${lastPing})` : heartbeatStatus === 'sending' ? 'Syncing...' : 'Sync Failed (Tap to retry)'}
              </Text>
            </Pressable>
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
                onPress={async () => {
                  if (user?.id) await notifyLogout(user.id);
                  signOut();
                }}
                className="flex-row items-center px-4 py-3.5 rounded-b-2xl"
              >
                <Icon as={LogOut} size={18} className="text-muted-foreground mr-3" />
                <Text className="text-popover-foreground font-medium font-sans text-[15px]">Logout</Text>
              </Pressable>
            </PopoverContent>
          </Popover>
        </View>

        {/* Main Action Card */}
        <View className="bg-card p-6 rounded-2xl mb-6 shadow-sm border border-border/50">
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
                <Text className="text-foreground text-2xl font-black font-sans tracking-tight" numberOfLines={1}>
                  {currentActivity}
                </Text>
                <Text className="text-muted-foreground text-xs font-sans mt-0.5">Started: {sessionStartedAt ? new Date(sessionStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not checked in'}</Text>
                <Text className="text-muted-foreground">Building 23 - 3rd Floor</Text>
              </View>

              <View className="flex-row items-center mb-8">
                <View className={`px-3 py-1 rounded-full border ${isActive ? 'bg-primary/10 border-primary/20' : 'bg-muted border-border/50'}`}>
                  <Text className={`text-[10px] font-bold uppercase font-sans tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isActive ? '● Session Active' : 'Waiting for Start'}
                  </Text>
                </View>
                <View className="ml-auto items-end">
                  <Text className="text-muted-foreground text-[10px] uppercase font-bold text-right font-sans">
                    {isActive ? 'Live Timer' : 'Total Rendered'}
                  </Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-foreground text-2xl font-black font-sans tracking-tight">
                      {isActive ? formatDuration(elapsedSeconds) : totalHoursRendered}
                    </Text>
                    {!isActive && <Text className="text-muted-foreground text-xs font-bold ml-1 font-sans">hrs</Text>}
                  </View>
                </View>
              </View>

              {isActive && (
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider font-sans">Proof Captures</Text>
                    <Text className="text-muted-foreground text-[11px] font-semibold font-sans">{proofImages.length} image{proofImages.length === 1 ? '' : 's'}</Text>
                  </View>

                  {proofImages.length === 0 ? (
                    <View className="rounded-xl border border-dashed border-border/60 px-3 py-3 bg-muted/40">
                      <Text className="text-muted-foreground text-xs font-sans">No proof image yet. Capture one while the session is active.</Text>
                    </View>
                  ) : (
                    <View className="flex-row">
                      {previewProofImages.map((uri, index) => {
                        const isOverflowTile = index === 2 && hiddenProofCount > 0;

                        if (isOverflowTile) {
                          return (
                            <Pressable
                              key={`${uri}-${index}`}
                              onPress={() => setShowAllProofs(true)}
                              className="w-16 h-16 rounded-lg mr-2 overflow-hidden border border-border/50"
                            >
                              <Image source={{ uri }} className="w-full h-full" />
                              <View className="absolute inset-0 bg-black/55 items-center justify-center">
                                <Text className="text-white font-black text-sm font-sans">+{hiddenProofCount}</Text>
                              </View>
                            </Pressable>
                          );
                        }

                        return (
                          <Image
                            key={`${uri}-${index}`}
                            source={{ uri }}
                            className="w-16 h-16 rounded-lg mr-2 border border-border/50"
                          />
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {!isActive ? (
                <View className="flex-row gap-3">
                  <Button
                    className="flex-1 bg-primary rounded-[20px] py-4 shadow-sm"
                    onPress={handleCheckIn}
                  >
                    <Icon as={Play} size={20} className="text-primary-foreground mr-2" />
                    <Text className="text-primary-foreground font-black uppercase tracking-tight font-sans">Check In</Text>
                  </Button>
                </View>
              ) : (
                <View className="gap-3">
                  <View className="flex-row gap-3">
                    <Button
                      variant="outline"
                      className="w-14 bg-card border-border/50 rounded-[18px] py-4 shadow-sm"
                      onPress={handleBreak}
                    >
                      <Icon as={Coffee} size={20} className="text-foreground" />
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 bg-card border-border/50 rounded-[18px] py-4 shadow-sm"
                      onPress={handleCaptureProof}
                      disabled={isTakingProof}
                    >
                      <Icon as={Camera} size={18} className="text-foreground mr-2" />
                      <Text className="text-foreground font-bold uppercase tracking-tight font-sans text-[13px]" numberOfLines={1}>
                        {isTakingProof ? 'Opening Camera...' : 'Capture Proof'}
                      </Text>
                    </Button>
                  </View>

                  <Button
                    className="bg-destructive rounded-[18px] py-4 shadow-sm"
                    onPress={() => {
                      handleSessionStop();
                      router.push('/camera');
                    }}
                  >
                    <Icon as={Camera} size={20} className="text-destructive-foreground mr-2" />
                    <Text className="text-destructive-foreground font-black uppercase tracking-tight font-sans">Check Out</Text>
                  </Button>
                </View>
              )}
            </>
          )}
        </View>

        {/* Recent Logs Section */}
        <View className="flex-row justify-between items-end mb-4 px-2">
          <View>
            <View className="flex-row items-center gap-x-2">
              <Text className="text-foreground text-xl font-bold font-sans tracking-tight">Recent Logs</Text>
              {fromCache && (
                <View className="flex-row items-center gap-x-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Icon as={WifiOff} size={10} className="text-amber-600" />
                  <Text className="text-amber-600 text-[10px] font-bold font-sans uppercase">Cached</Text>
                </View>
              )}
            </View>
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
              <Pressable
                key={activity.id}
                onPress={() => openLogDetails(activity)}
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
              </Pressable>
            ))
          )}
        </View>

      </ScrollView>

      <Modal visible={showAllProofs} transparent animationType="fade" onRequestClose={() => setShowAllProofs(false)}>
        <View className="flex-1 bg-black/55 justify-end">
          <Pressable className="absolute inset-0" onPress={() => setShowAllProofs(false)} />
          <View className="bg-card rounded-t-3xl px-5 pt-5 pb-6 max-h-[75%] border border-border/30">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground text-lg font-black font-sans">All Proof Images</Text>
              <Pressable
                onPress={() => setShowAllProofs(false)}
                className="px-3 py-1.5 rounded-full bg-muted"
              >
                <Text className="text-muted-foreground text-xs font-bold uppercase font-sans">Close</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {proofImages.map((uri, index) => (
                  <Image
                    key={`${uri}-full-${index}`}
                    source={{ uri }}
                    className="h-40 rounded-xl border border-border/50"
                    style={{ width: '48.5%' }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AlertDialog
        visible={breakDialog}
        onClose={() => setBreakDialog(false)}
        title="Take a Break?"
        message="Your current progress will be saved."
        actions={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm Break', style: 'destructive', onPress: handleSessionStop },
        ]}
      />

      <AlertDialog
        visible={permissionDialog}
        onClose={() => setPermissionDialog(false)}
        title="Camera Permission Required"
        message="Please allow camera access so you can capture proof images during your active session."
        actions={[{ text: 'OK', style: 'default' }]}
      />

      <AlertDialog
        visible={logDetailsDialog}
        onClose={() => setLogDetailsDialog(false)}
        title={selectedActivity?.name ?? 'Log Details'}
        message={
          selectedActivity
            ? `${selectedActivity.date}\nRendered: ${selectedActivity.hours}h\n\n${selectedActivity.description}`
            : 'No details available.'
        }
        actions={[{ text: 'Close', style: 'default' }]}
      />
    </SafeAreaView>
  );
}