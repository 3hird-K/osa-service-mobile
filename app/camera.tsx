import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X, RefreshCw } from 'lucide-react-native';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraProofScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showVerified, setShowVerified] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black p-6">
        <Text className="text-white text-center text-lg mb-6">Camera permission is required for proof of service.</Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-orange-600 px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold">Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      console.log('Proof captured:', photo.uri);

      // Here you would upload photo.uri to your server/storage
      // and update the Clock Out timestamp in your DB.

      setShowVerified(true);
    }
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
        <View className="flex-1 justify-end" style={{ pointerEvents: 'box-none' }}>

          {/* Bottom controls — Apple Camera style */}
          <View
            className="items-center"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            {/* Label */}
            <Text className="text-white/60 text-[10px] mb-5 uppercase tracking-[3px] font-bold">
              Capture Live Proof
            </Text>

            {/* Three-button row: Close · Shutter · Flip */}
            <View className="flex-row items-center justify-between w-full px-10">
              {/* Close */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-12 h-12 rounded-full bg-black/50 items-center justify-center"
              >
                <X color="white" size={22} />
              </TouchableOpacity>

              {/* Shutter */}
              <TouchableOpacity
                onPress={takePicture}
                activeOpacity={0.7}
                className="w-[76px] h-[76px] rounded-full border-[4px] border-white items-center justify-center"
              >
                <View className="w-[62px] h-[62px] rounded-full bg-white" />
              </TouchableOpacity>

              {/* Flip camera */}
              <TouchableOpacity
                onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
                className="w-12 h-12 rounded-full bg-black/50 items-center justify-center"
              >
                <RefreshCw color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>

      <AlertDialog
        visible={showVerified}
        onClose={() => {
          setShowVerified(false);
          router.replace('/(tabs)');
        }}
        title="Clock-Out Verified"
        message="Your proof of service has been captured successfully."
        actions={[{ text: 'Done', style: 'default' }]}
      />
    </View>
  );
}