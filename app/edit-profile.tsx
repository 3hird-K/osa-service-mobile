import * as React from 'react';
import { View, ScrollView, Pressable, Image, TextInput, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import { toast } from 'sonner-native';

export default function EditProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const [firstName, setFirstName] = React.useState(user?.firstName ?? '');
    const [lastName, setLastName] = React.useState(user?.lastName ?? '');
    const [username, setUsername] = React.useState(user?.username ?? '');

    const [avatarUri, setAvatarUri] = React.useState<string | null>(user?.imageUrl ?? null);
    const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [permissionDialog, setPermissionDialog] = React.useState(false);

    // Keep fields in sync if user loads after mount
    React.useEffect(() => {
        if (user) {
            setFirstName(user.firstName ?? '');
            setLastName(user.lastName ?? '');
            setUsername(user.username ?? '');
            setAvatarUri(user.imageUrl ?? null);
        }
    }, [user?.id]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setPermissionDialog(true);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || !result.assets[0]) return;

        const asset = result.assets[0];
        setAvatarUri(asset.uri);
        setUploadingAvatar(true);

        try {
            // Build a URI-based file object that Clerk's SDK accepts on React Native
            const fileName = asset.fileName ?? `avatar_${Date.now()}.jpg`;
            const mimeType = asset.mimeType ?? 'image/jpeg';
            const file = {
                uri: asset.uri,
                name: fileName,
                type: mimeType,
            };

            await user?.setProfileImage({ file: file as any });
            // After upload, refresh from Clerk
            await user?.reload();
            setAvatarUri(user?.imageUrl ?? asset.uri);
        } catch (err: any) {
            console.error('Avatar upload error:', err);
            // Revert preview to Clerk's current image
            setAvatarUri(user?.imageUrl ?? null);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const onSave = async () => {
        if (!user || saving) return;
        setSaving(true);
        try {
            await user.update({ firstName, lastName, username: username || undefined });
            await user.reload();
            toast.success('Profile updated successfully');
            router.back();
        } catch (err: any) {
            const msg =
                err?.errors?.[0]?.message ??
                (err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const email = user?.primaryEmailAddress?.emailAddress ?? '';
    const inputStyle = 'text-foreground font-medium text-[15px] font-sans py-0';

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
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} className="w-24 h-24 rounded-full" />
                        ) : (
                            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
                                <Text className="text-primary font-bold text-3xl font-sans">
                                    {[firstName, lastName]
                                        .filter(Boolean)
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2) || '?'}
                                </Text>
                            </View>
                        )}

                        {/* Upload overlay */}
                        {uploadingAvatar && (
                            <View className="absolute inset-0 rounded-full bg-black/50 items-center justify-center">
                                <ActivityIndicator color="#ffffff" size="small" />
                            </View>
                        )}

                        <Pressable
                            onPress={pickImage}
                            disabled={uploadingAvatar}
                            className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-muted"
                        >
                            <Icon as={Camera} className="text-primary-foreground size-4" />
                        </Pressable>
                    </View>
                    <Text className="text-muted-foreground text-xs font-sans mt-3">Change your photo</Text>
                </View>

                {/* Personal Info */}
                <View className="gap-y-2 mb-6">
                    <Text className="text-muted-foreground text-xs font-semibold px-4 font-sans uppercase tracking-wider">Personal Info</Text>
                    <View className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        <View className="px-4 py-3 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground font-sans mb-1">First Name</Text>
                            <TextInput
                                className={inputStyle}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="First name"
                                placeholderTextColor="hsl(var(--muted-foreground))"
                                autoCapitalize="words"
                            />
                        </View>
                        <View className="px-4 py-3 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground font-sans mb-1">Last Name</Text>
                            <TextInput
                                className={inputStyle}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Last name"
                                placeholderTextColor="hsl(var(--muted-foreground))"
                                autoCapitalize="words"
                            />
                        </View>
                        <View className="px-4 py-3 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground font-sans mb-1">Username</Text>
                            <TextInput
                                className={inputStyle}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="username"
                                placeholderTextColor="hsl(var(--muted-foreground))"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <View className="px-4 py-3">
                            <Text className="text-xs text-muted-foreground font-sans mb-1">Email</Text>
                            <TextInput
                                className="text-foreground/50 font-medium text-[15px] font-sans py-0"
                                value={email}
                                editable={false}
                                selectTextOnFocus={false}
                                placeholderTextColor="hsl(var(--muted-foreground))"
                            />
                            <Text className="text-xs text-muted-foreground/70 font-sans mt-1">Email cannot be changed here</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-0 left-0 right-0 px-4 bg-muted" style={{ paddingBottom: insets.bottom + 16 }}>
                <Pressable
                    className="bg-primary rounded-xl py-4 items-center flex-row justify-center gap-x-2"
                    onPress={onSave}
                    disabled={saving}
                    style={{ opacity: saving ? 0.7 : 1 }}
                >
                    {saving && <ActivityIndicator color="#ffffff" size="small" />}
                    <Text className="text-primary-foreground font-semibold text-[15px] font-sans">
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Text>
                </Pressable>
            </View>

            <AlertDialog
                visible={permissionDialog}
                onClose={() => setPermissionDialog(false)}
                title="Permission Required"
                message="Please allow access to your photo library to update your profile photo."
                actions={[
                    { text: 'OK', style: 'default' },
                ]}
            />
        </View>
    );
}
