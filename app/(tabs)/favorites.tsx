import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function FavoritesScreen() {
    return (
        <View className="flex-1 items-center justify-center p-4">
            <Text variant="h1" className="text-3xl font-medium">Favorites</Text>
        </View>
    );
}
