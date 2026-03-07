import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useUser } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Camera, Play, Coffee, User, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, SafeAreaView, Alert, Image } from 'react-native';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [isActive, setIsActive] = React.useState(false);
  
  const currentActivity = "Library Assistance";

  // Data for the 2 completed activities
  const completedActivities = [
    { id: '1', name: 'Cafeteria', hours: 2, date: 'March 07, 2026' },
    { id: '2', name: 'Fitness Gym', hours: 1.5, date: 'March 06, 2026' },
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
    <SafeAreaView className="flex-1 bg-muted"> 
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }} 
        className="px-5" 
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="flex-row items-center mb-8 mt-4">
          <View className="w-14 h-14 rounded-full bg-[#1C1C1E] items-center justify-center overflow-hidden border border-white/5">
             {user?.imageUrl ? (
               <Image source={{ uri: user.imageUrl }} className="w-full h-full" />
             ) : (
               <Icon as={User} size={28} className="text-gray-400" />
             )}
          </View>
          <View className="ml-4">
            <Text className="text-gray-500 text-sm font-medium">Hello,</Text>
            <Text className="text-white text-2xl font-bold">{user?.firstName ?? 'Neil!'}</Text>
          </View>
        </View>

        {/* Main Action Card - Charcoal/Dark Background */}
        <View className="bg-[#1A1A1A] p-6 rounded-[35px] mb-6 shadow-2xl border border-white/5">
            <View className="mb-4">
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Current Activity</Text>
                <Text className="text-white text-2xl font-black">{currentActivity}</Text>
            </View>

            <View className="flex-row items-center mb-8">
                <View className={`px-3 py-1 rounded-full border ${isActive ? 'bg-orange-500/20 border-orange-400' : 'bg-white/5 border-white/10'}`}>
                    <Text className={`text-[10px] font-bold uppercase ${isActive ? 'text-orange-400' : 'text-gray-600'}`}>
                        {isActive ? '● Session Active' : 'Waiting for Start'}
                    </Text>
                </View>
                <View className="ml-auto items-end">
                    <Text className="text-gray-500 text-[10px] uppercase font-bold text-right">Total Rendered</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-white text-2xl font-black">{totalHoursRendered}</Text>
                        <Text className="text-gray-400 text-xs font-bold ml-1">hrs</Text>
                    </View>
                </View>
            </View>
            
            <View className="flex-row gap-3">
                {isActive && (
                    <Button 
                        variant="outline"
                        className="flex-1 bg-white/5 border-white/10 rounded-2xl py-4" 
                        onPress={handleBreak}
                    >
                        <Icon as={Coffee} size={20} className="text-white" />
                    </Button>
                )}

                {!isActive ? (
                    <Button 
                        className="flex-[3] bg-[#7CFF67] rounded-2xl py-4" 
                        onPress={() => setIsActive(true)}
                    >
                        <Icon as={Play} size={20} className="text-black mr-2" />
                        <Text className="text-black font-black uppercase tracking-tight">Check In</Text>
                    </Button>
                ) : (
                    <Button 
                        className="flex-[3] bg-orange-600 rounded-2xl py-4" 
                        onPress={() => router.push('/camera')}
                    >
                        <Icon as={Camera} size={20} className="text-white mr-2" />
                        <Text className="text-white font-black uppercase tracking-tight">Check Out</Text>
                    </Button>
                )}
            </View>
        </View>

        {/* Recent Logs Section */}
        <View className="flex-row justify-between items-end mb-5 px-2">
          <View>
             <Text className="text-white text-xl font-bold">Recent Logs</Text>
             <Text className="text-gray-500 text-xs italic">Your latest sessions</Text>
          </View>
          <Text className="text-gray-500 text-sm font-medium">History <ChevronRight size={14} /></Text>
        </View>

        {completedActivities.map((activity) => (
          <View key={activity.id} className="bg-[#1A1A1A]/60 border border-white/5 p-5 rounded-[30px] flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="bg- p-3 rounded-2xl mr-4 border border-white/5">
                <Icon as={Calendar} size={22} className="text-gray-500" />
              </View>
              <View>
                <Text className="text-white font-bold text-lg">{activity.name}</Text>
                <Text className="text-gray-500 text-[10px] uppercase font-medium">{activity.date}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-white font-black text-lg">{activity.hours}h</Text>
              <View className="bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                <Text className="text-orange-600 text-[8px] font-bold uppercase">Finished</Text>
              </View>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}