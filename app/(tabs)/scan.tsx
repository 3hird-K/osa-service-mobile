import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, Platform, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { X, QrCode, Image as ImageIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
// Removed crashing BarCodeScanner import
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');
const MASK_DIMENSION = width * 0.7;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const hasScanned = useRef(false);
  const lastToastTimeRef = useRef(0);

  if (!permission) {
    return <View className="flex-1 bg-background" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Icon as={QrCode} size={64} className="text-muted-foreground mb-6" />
        <Text className="text-2xl font-black font-sans text-center text-foreground mb-2">Camera Access</Text>
        <Text className="text-center text-muted-foreground font-sans mb-8 leading-5">
          We need your permission to show the camera to scan activity QR codes.
        </Text>
        <Button className="w-full bg-primary rounded-2xl py-4 shadow-sm" onPress={requestPermission}>
          <Text className="text-primary-foreground font-bold uppercase tracking-wide font-sans">Allow Camera</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (hasScanned.current) return;
    hasScanned.current = true;
    setScanned(true);
    
    try {
      const parsedData = JSON.parse(data);
      const assigneeId = parsedData.assignee_id;
      const currentUserId = user?.id;
      const status = parsedData.status;

      const now = Date.now();
      const throttleToast = (msg: string) => {
        if (now - lastToastTimeRef.current > 3000) {
          toast.error(msg);
          lastToastTimeRef.current = now;
        }
      };

      // 🔐 Check if task is already completed
      if (status?.toLowerCase() === "completed") {
        throttleToast("This task is already completed!");
        hasScanned.current = false;
        setScanned(false);
        return;
      }

      // 🔐 Security Check: Verify ownership
      if (assigneeId && currentUserId && assigneeId !== currentUserId) {
        throttleToast("Access Denied: This task is assigned to another user.");
        hasScanned.current = false;
        setScanned(false);
        return;
      }

      // If verified, proceed to Home Tab
      router.replace({ 
        pathname: '/', 
        params: { scannedTask: data } 
      });

    } catch (e) {
      // Fallback for plain string IDs
      router.replace({ 
        pathname: '/', 
        params: { scannedTask: data } 
      });
    }
    
    // Reset scanned state
    setTimeout(() => {
      hasScanned.current = false;
      setScanned(false);
    }, 2000);
  };



  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      {/* Modern Overlay overlaying the camera */}
      <View style={styles.overlay}>
        <SafeAreaView className="w-full flex-row justify-between items-center px-5 pt-2 z-10 absolute top-0">
          <View className="bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            <Text className="text-white font-bold font-sans tracking-wide">Scan Activity QR</Text>
          </View>
          <View className="flex-row items-center gap-3">

            <Pressable 
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center backdrop-blur-md border border-white/10 active:bg-white/20"
              onPress={() => router.navigate('/(tabs)')}
            >
              <Icon as={X} size={20} className="text-white" />
            </Pressable>
          </View>
        </SafeAreaView>

        <View style={styles.maskContainer}>
          <View style={styles.maskTop} />
          <View style={styles.maskRow}>
            <View style={styles.maskSide} />
            <View style={styles.maskCenter}>
              {/* Corner Accents */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning Line Animation could be added here */}
            </View>
            <View style={styles.maskSide} />
          </View>
          <View style={styles.maskBottom}>
            <View className="items-center px-10 pt-10">
              <Text className="text-white/80 text-center font-sans font-medium leading-5">
                Align the QR code within the frame to start your task session.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskContainer: {
    flex: 1,
    width: '100%',
  },
  maskTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  maskBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  maskRow: {
    flexDirection: 'row',
    height: MASK_DIMENSION,
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  maskCenter: {
    width: MASK_DIMENSION,
    height: MASK_DIMENSION,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#ffffff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
});
