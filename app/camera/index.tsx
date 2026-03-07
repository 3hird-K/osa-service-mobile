import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X, Camera as CameraIcon, RotateCcw } from 'lucide-react-native';

export default function CameraProofScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const cameraRef = useRef<any>(null);
  const router = useRouter();

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
      
      alert("Clock-out verified with proof!");
      router.replace('/(tabs)'); 
    }
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing}>
        <View className="flex-1 bg-transparent justify-between p-10">
          
          {/* Top Controls */}
          <View className="flex-row justify-between mt-10">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="p-3 bg-black/40 rounded-full"
            >
              <X color="white" size={28} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
              className="p-3 bg-black/40 rounded-full"
            >
              <RotateCcw color="white" size={28} />
            </TouchableOpacity>
          </View>

          {/* Shutter Area - No Gallery Picker exists here */}
          <View className="items-center mb-10">
            <Text className="text-white/70 text-xs mb-4 uppercase tracking-widest font-bold">
              Capture Live Proof
            </Text>
            <TouchableOpacity 
              onPress={takePicture}
              className="w-20 h-20 bg-white rounded-full items-center justify-center border-8 border-orange-600/30"
            >
              <View className="w-14 h-14 bg-white border-2 border-black/10 rounded-full items-center justify-center">
                <CameraIcon color="black" size={24} />
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </CameraView>
    </View>
  );
}