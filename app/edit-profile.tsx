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
            {/* Header */}
            <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 flex-row items-center">
                <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
                    <Icon as={ChevronLeft} className="text-primary size-6" />
                </Pressable>
                <Text className="text-foreground font-semibold text-lg font-sans flex-1 text-center mr-10">Edit Profile</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View className="items-center mt-4 mb-8">
                    <View className="relative">
                        <Image source={{ uri: image }} className="w-24 h-24 rounded-full" />
                        <Pressable
                            onPress={pickImage}
                            className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-muted"
                        >
                            <Icon as={Camera} className="text-primary-foreground size-4" />
                        </Pressable>
                    </View>
                </View>

                {/* Form */}
                <View className="gap-y-2 mb-6">
                    <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Personal Info</Text>
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        <View className="px-4 py-3 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground font-sans mb-1">First Name</Text>
                            <TextInput
                                className="text-foreground font-medium text-[15px] font-sans py-0"
                                defaultValue="Neil"
                                placeholderTextColor="hsl(var(--muted-foreground))"
                            />
                        </View>
                        <View className="px-4 py-3 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground font-sans mb-1">Last Name</Text>
                            <TextInput
                                className="text-foreground font-medium text-[15px] font-sans py-0"
                                defaultValue="Dime"
                                placeholderTextColor="hsl(var(--muted-foreground))"
                            />
                        </View>
                        <View className="px-4 py-3">
                            <Text className="text-xs text-muted-foreground font-sans mb-1">Email</Text>
                            <TextInput
                                className="text-foreground/50 font-medium text-[15px] font-sans py-0"
                                defaultValue="neildime03@gmail.com"
                                editable={false}
                                selectTextOnFocus={false}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-0 left-0 right-0 px-4 bg-muted" style={{ paddingBottom: insets.bottom + 16 }}>
                <Pressable className="bg-primary rounded-xl py-4 items-center">
                    <Text className="text-primary-foreground font-semibold text-[15px] font-sans">Save Changes</Text>
                </Pressable>
            </View>
        </View>
    );
}
