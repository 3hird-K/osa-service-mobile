import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Camera, Play, Coffee, User, ChevronRight, LogOut, WifiOff, Bell, Plus, QrCode, X, Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Image, Pressable, RefreshControl, Modal, Alert } from 'react-native';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { notifyLogout } from '@/hooks/useHeartbeat';
import { loadCache, saveCache } from '@/hooks/useOfflineStorage';
import { toast } from 'sonner-native';

type Activity = {
  id: string;
  name: string;
  hours: number;
  date: string;
  description: string;
  taskStatus?: string;
};

type ScannedTask = {
  id: string;
  title: string;
  description: string;
  location: string;
  hours: string | number;
  status?: string;
  assignee_id: string;
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

  const [currentActivity, setCurrentActivity] = React.useState<ScannedTask | null>(null);
  const [activeLogId, setActiveLogId] = React.useState<string | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const params = useLocalSearchParams<{ scannedTask?: string }>();

  React.useEffect(() => {
    if (params.scannedTask) {
      try {
        const parsed = JSON.parse(params.scannedTask);

        if (parsed.status?.toLowerCase() === 'completed') {
          setCurrentActivity(null);
          toast.error("This task is already completed!");
        } else {
          setCurrentActivity(parsed);
          toast.success("Task scanned!");
        }
      } catch (e) {
        // Fallback for legacy ID-only QR codes
        setCurrentActivity({
          id: params.scannedTask,
          title: "General Task",
          description: "No description provided.",
          location: "Unknown Location",
          hours: "0",
          assignee_id: user?.id || ""
        });
      }
      setIsActive(false);
      setSessionStartedAt(null);
      setProofImages([]);
    }
  }, [params.scannedTask, user?.id]);

  const API_URL = 'https://server-osa-service.onrender.com';

  const fetchActivities = React.useCallback(async (silent = false) => {
    if (!user?.id) return;
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${user.id}/logs`);
      if (res.ok) {
        const data = await res.json();
        const mappedLogs = data.map((log: any) => ({
          id: log.id,
          name: log.task?.title || "Unknown Task",
          date: new Date(log.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
          hours: parseFloat(log.hours || "0"),
          description: log.task?.description || "",
          taskStatus: log.task?.status || "In Progress"
        }));
        console.log("[History] Loaded logs:", mappedLogs.length, "Task statuses:", mappedLogs.map((l: any) => l.taskStatus));
        setCompletedActivities(mappedLogs);
        setFromCache(false);
        await saveCache(CACHE_KEY, mappedLogs);
      }
    } catch (error) {
      console.error('[History] Fetch failed:', error);
      const cached = await loadCache<Activity[]>(CACHE_KEY);
      if (cached) {
        setCompletedActivities(cached);
        setFromCache(true);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const sendHeartbeat = React.useCallback(async () => {
    if (!user?.id) return;
    setHeartbeatStatus('sending');
    try {
      const res = await fetch(`${API_URL}/users/${user.id}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setHeartbeatStatus('ok');
        setLastPing(new Date().toLocaleTimeString());
      } else {
        setHeartbeatStatus('fail');
      }
    } catch (err: any) {
      setHeartbeatStatus('fail');
    }
  }, [user?.id]);

  // ─── Initial Load & History ───
  React.useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // ─── Heartbeat: mark user as online every 30s ───
  React.useEffect(() => {
    if (!user?.id) return;
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30_000);
    return () => clearInterval(interval);
  }, [sendHeartbeat, user?.id]);

  // ─── Session Timer ───
  React.useEffect(() => {
    if (!isActive || !sessionStartedAt) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, sessionStartedAt]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchActivities(true);
  }, [fetchActivities]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const totalHoursRendered = completedActivities.reduce((acc, curr) => acc + curr.hours, 0);
  const [breakDialog, setBreakDialog] = React.useState(false);

  const handleCheckIn = async () => {
    if (!user?.id || !currentActivity) return;

    try {
      const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const res = await fetch(`${API_URL}/timelogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: currentActivity.id,
          user_id: user.id,
          start_time: startTime
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveLogId(data.id);
        setIsActive(true);
        setSessionStartedAt(Date.now());
        setProofImages([]);
        toast.success("Check-in successful!");
      } else {
        toast.error("Failed to start session on the server.");
      }
    } catch (e) {
      console.error("Check-in error:", e);
      toast.error("Connection Error: Check your internet.");
    }
  };

  const handleSessionStop = async () => {
    if (!activeLogId) return;

    try {
      const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const hoursWorked = (elapsedSeconds / 3600).toFixed(2);

      const res = await fetch(`${API_URL}/timelogs/${activeLogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          end_time: endTime,
          hours: hoursWorked
        })
      });

      if (res.ok) {
        toast.success("Session saved successfully!");
        setIsActive(false);
        setSessionStartedAt(null);
        setElapsedSeconds(0);
        setActiveLogId(null);
        fetchActivities(true); // Refresh history
      }
    } catch (e) {
      console.error("Stop error:", e);
      toast.error("Failed to save session to the server.");
    }
  };

  const handleBreak = async () => {
    if (!activeLogId) return;
    try {
      const breakTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const res = await fetch(`${API_URL}/timelogs/${activeLogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ break_time: breakTime })
      });
      if (res.ok) {
        setIsPaused(true);
        toast.success("On Break");
      }
    } catch (e) {
      toast.error("Failed to log break.");
    }
  };

  const handleResume = async () => {
    if (!activeLogId) return;
    try {
      const backTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const res = await fetch(`${API_URL}/timelogs/${activeLogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ back_time: backTime })
      });
      if (res.ok) {
        setIsPaused(false);
        toast.success("Back to Work");
      }
    } catch (e) {
      toast.error("Failed to log resume.");
    }
  };

  const handleDeleteLog = async (logId: string, taskStatus: string = "In Progress") => {
    if (taskStatus.toLowerCase() === 'completed') {
      toast.error("Completed tasks are locked.");
      return;
    }

    Alert.alert(
      "Delete Log",
      "Are you sure you want to remove this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/timelogs/${logId}?user_id=${user?.id}`, {
                method: 'DELETE'
              });
              if (res.ok) {
                toast.success("Log removed");
                fetchActivities(true);
              } else {
                const err = await res.json();
                toast.error(err.detail || "Failed to delete");
              }
            } catch (e) {
              toast.error("Connection error");
            }
          }
        }
      ]
    );
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
              {user?.username ?? user?.firstName ?? 'Student'}
            </Text>
            <Pressable
              onPress={sendHeartbeat}
              className="flex-row items-center gap-2 mt-1 active:opacity-50"
            >
              <View
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: heartbeatStatus === 'ok' ? '#22c55e' : heartbeatStatus === 'sending' ? '#f59e0b' : '#ef4444',
                  opacity: heartbeatStatus === 'sending' ? 0.5 : 1
                }}
              />
              <Text className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                Status: {heartbeatStatus === 'ok' ? `Active (Last: ${lastPing})` : heartbeatStatus === 'sending' ? 'Syncing...' : 'Sync Failed (Tap to retry)'}
              </Text>
            </Pressable>
          </View>
          <View className="flex-row items-center gap-x-3">
            <Pressable
              className="w-12 h-12 rounded-full bg-card items-center justify-center border border-border/50 shadow-sm"
              onPress={() => router.push('/notifications')}
            >
              <Icon as={Bell} size={22} className="text-foreground" />
              {/* Notification Badge */}
              <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />
            </Pressable>
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
                    <Text className="text-popover-foreground font-semibold font-sans">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student'}</Text>
                    <Text className="text-muted-foreground text-xs font-sans mt-0.5" numberOfLines={1}>
                      {user?.primaryEmailAddress?.emailAddress ?? 'Account details...'}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={async () => {
                    console.log("[Logout] Button pressed");
                    if (user?.id) notifyLogout(user.id); // Don't await, just fire and forget
                    try {
                      await signOut();
                      console.log("[Logout] SignOut successful");
                    } catch (e) {
                      console.error("[Logout] SignOut failed:", e);
                      toast.error("Logout failed");
                    }
                  }}
                  className="flex-row items-center px-4 py-3.5 m-2 rounded-xl bg-destructive/10 active:bg-destructive/20 border border-destructive/20"
                >
                  <Icon as={LogOut} size={18} className="text-destructive mr-3" />
                  <Text className="text-destructive font-bold font-sans text-[15px]">Logout</Text>
                </Pressable>
              </PopoverContent>
            </Popover>
          </View>
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
          ) : (currentActivity && currentActivity.status?.toLowerCase() !== 'completed') ? (
            <>
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1 font-sans">Current Activity</Text>
                  <Text className="text-foreground text-2xl font-black font-sans tracking-tight" numberOfLines={1}>
                    {currentActivity.title}
                  </Text>
                </View>
                {!isActive && (
                  <Pressable
                    onPress={() => {
                      setCurrentActivity(null);
                      toast.success("Task cleared");
                    }}
                    className="w-8 h-8 rounded-full bg-accent items-center justify-center -mr-2"
                  >
                    <Icon as={X} size={16} className="text-muted-foreground" />
                  </Pressable>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-muted-foreground text-xs font-sans" numberOfLines={2}>
                  {currentActivity.description}
                </Text>
                <View className="flex-row items-center mt-3">
                  <View className="bg-primary/10 px-2 py-0.5 rounded-md mr-2">
                    <Text className="text-primary text-[10px] font-bold font-sans uppercase">{currentActivity.id}</Text>
                  </View>
                  <Text className="text-muted-foreground text-xs font-sans">Started: {sessionStartedAt ? new Date(sessionStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not checked in'}</Text>
                </View>
                <Text className="text-muted-foreground text-xs font-sans mt-1 font-medium">{currentActivity.location}</Text>
              </View>

              <View className="flex-row items-center mb-8">
                <View className={`px-3 py-1 rounded-full border ${isActive ? 'bg-primary/10 border-primary/20' : 'bg-muted border-border/50'}`}>
                  <Text className={`text-[10px] font-bold uppercase font-sans tracking-wider ${isActive ? (isPaused ? 'text-amber-500' : 'text-primary') : 'text-muted-foreground'}`}>
                    {isActive ? (isPaused ? '● On Break' : '● Session Active') : 'Waiting for Start'}
                  </Text>
                </View>
                <View className="ml-auto items-end">
                  <Text className="text-muted-foreground text-[10px] uppercase font-bold text-right font-sans">
                    {isActive ? 'Live Timer' : 'Must be Rendered'}
                  </Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-foreground text-2xl font-black font-sans tracking-tight">
                      {isActive ? formatDuration(elapsedSeconds) : currentActivity.hours}
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
                      className={`w-14 rounded-[18px] py-4 shadow-sm ${isPaused ? 'bg-amber-500/10 border-amber-500/20' : 'bg-card border-border/50'}`}
                      onPress={isPaused ? handleResume : handleBreak}
                    >
                      <Icon as={isPaused ? Play : Coffee} size={20} className={isPaused ? 'text-amber-600' : 'text-foreground'} />
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
                    onPress={handleSessionStop}
                  >
                    <Icon as={LogOut} size={20} className="text-destructive-foreground mr-2" />
                    <Text className="text-destructive-foreground font-black uppercase tracking-tight font-sans">Check Out</Text>
                  </Button>
                </View>
              )}
            </>
          ) : (
            <View className="py-12 items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-accent/30 items-center justify-center mb-4 border border-border/20">
                <Icon as={QrCode} size={32} className="text-muted-foreground opacity-40" />
              </View>
              <Text className="text-foreground text-xl font-black font-sans text-center tracking-tight">No Active Session</Text>
              <Text className="text-muted-foreground text-center font-sans text-[13px] px-12 leading-5 mt-2">
                Scan an activity QR code to start tracking your community service hours.
              </Text>
            </View>
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
                <View className="flex-row items-center gap-x-3">
                  <View className="items-end">
                    <Text className="text-foreground font-bold text-[15px] font-sans">{activity.hours}h</Text>
                    <View className="bg-primary/10 mt-1 px-2 py-0.5 rounded-full">
                      <Text className="text-primary text-[10px] font-bold uppercase font-sans">
                        {activity.taskStatus?.toLowerCase() === 'completed' ? 'Verified' : 'Finished'}
                      </Text>
                    </View>
                  </View>

                  {activity.taskStatus?.toLowerCase() !== 'completed' && (
                    <Pressable
                      onPress={() => handleDeleteLog(activity.id, activity.taskStatus)}
                      className="w-10 h-10 rounded-full bg-destructive/10 active:bg-destructive/20 items-center justify-center"
                    >
                      <Icon as={Trash2} size={18} className="text-destructive" />
                    </Pressable>
                  )}
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