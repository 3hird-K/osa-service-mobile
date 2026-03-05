import * as React from 'react';
import { View, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export default function EditProfileScreen() {
    const [image, setImage] = useState('https://github.com/shadcn.png');
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <View className="flex-1 bg-muted">
            <View
                style={{ paddingTop: insets.top + 16 }}
                className="px-4 flex-row items-center justify-between"
            >
                <Pressable onPress={() => router.back()} className="bg-background w-10 h-10 rounded-full items-center justify-center shadow-sm">
                    <Icon as={ChevronLeft} className="text-foreground size-5" />
                </Pressable>
                <Text className="text-foreground font-semibold text-lg flex-1 text-center mr-10 relative left-[-4px] font-sans">Edit profile</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                <View className="items-center mt-6 mb-8">
                    <View className="relative">
                        <Image
                            source={{ uri: image }}
                            className="w-24 h-24 rounded-full"
                        />
                        <Pressable onPress={pickImage} className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-muted shadow-sm">
                            <Icon as={Camera} className="text-primary-foreground size-4" />
                        </Pressable>
                    </View>
                </View>

                <View className="bg-card rounded-3xl p-6 shadow-sm gap-y-6">
                    <View className="flex-row gap-x-4">
                        <View className="flex-1 gap-y-2">
                            <Text className="text-muted-foreground text-sm font-medium">First name</Text>
                            <TextInput
                                className="border border-border rounded-2xl px-4 py-3 text-foreground font-medium"
                                defaultValue="Neil"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                        <View className="flex-1 gap-y-2">
                            <Text className="text-muted-foreground text-sm font-medium">Last name</Text>
                            <TextInput
                                className="border border-border rounded-2xl px-4 py-3 text-foreground font-medium"
                                defaultValue="Dime"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>
                    <View className="gap-y-2">
                        <Text className="text-muted-foreground text-sm font-medium">Email</Text>
                        <TextInput
                            className="border border-border rounded-2xl px-4 py-3 text-foreground font-medium opacity-50 bg-background"
                            defaultValue="neildime03@gmail.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#9ca3af"
                            editable={false}
                            selectTextOnFocus={false}
                        />
                    </View>
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
                <Pressable className="bg-primary rounded-full py-4 items-center shadow-md">
                    <Text className="text-primary-foreground font-semibold text-lg">Update</Text>
                </Pressable>
            </View>
        </View>
    );
}
