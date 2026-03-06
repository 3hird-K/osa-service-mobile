import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';

export default function NotificationsScreen() {
    return (
        <>
            <View className="flex-1 items-center justify-center p-4">
                <Text variant="h1" className="text-3xl font-medium">Notifications</Text>
                <Button variant={'default'} size={'lg'}>Notifications</Button>
                <Link href="/account" asChild>
                    <Button variant={'default'} size={'lg'}>Account</Button>
                </Link>
            </View>
        </>
    );
}
