import * as React from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Home, Heart, UserRound, LucideLayoutDashboard, Bell } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

function CustomTabBar({ state, descriptors, navigation }: any) {
    return (
        <View className="absolute bottom-6 left-5 right-5 flex-row items-center justify-between rounded-[40px] bg-background px-6 py-4 shadow-2xl border border-border">
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                let IconComponent = Home;
                if (route.name === 'notifications') IconComponent = Bell;
                // if (route.name === 'favorites') IconComponent = Heart;
                if (route.name === 'account') IconComponent = UserRound;

                // When focused, background is 'background' (white-ish) and text is 'foreground' (dark-ish)
                // When inactive, background is transparent and text is 'background' (white-ish, since the bar is dark)
                return (
                    <Pressable
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        className={`flex items-center justify-center rounded-full p-3 transition-colors ${isFocused ? 'bg-primary' : 'bg-transparent'
                            }`}
                    >
                        <Icon
                            as={IconComponent}
                            className={`size-6 ${isFocused ? 'text-primary-foreground' : 'text-primary'}`}
                        />
                    </Pressable>
                );
            })}
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            {/* <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} /> */}
            <Tabs.Screen name="account" options={{ title: 'Account' }} />
        </Tabs>
    );
}
