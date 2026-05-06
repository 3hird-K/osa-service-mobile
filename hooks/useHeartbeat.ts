import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { AppState, type AppStateStatus } from 'react-native';

const API_BASE_URL = 'https://server-osa-service.onrender.com';
const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

/**
 * useHeartbeat Hook
 * Sends a periodic "ping" to the backend every 30 seconds to mark
 * the user as online (is_online = true, last_active = now).
 *
 * Pauses heartbeats when the app goes to background.
 */
export function useHeartbeat() {
  const { user, isLoaded } = useUser();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isLoaded || !user?.id) {
      console.log('[Heartbeat] Skipping — isLoaded:', isLoaded, 'userId:', user?.id);
      return;
    }

    console.log('[Heartbeat] Starting heartbeat for user:', user.id);

    const sendPing = async () => {
      try {
        const url = `${API_BASE_URL}/users/${user.id}/heartbeat`;
        console.log('[Heartbeat] Sending ping to:', url);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ last_active: new Date().toISOString() }),
        });
        const data = await response.json();
        console.log('[Heartbeat] Response:', response.status, JSON.stringify(data));
      } catch (error: any) {
        console.warn('[Heartbeat] Ping failed:', error?.message || error);
      }
    };

    const startHeartbeat = () => {
      sendPing();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(sendPing, HEARTBEAT_INTERVAL_MS);
    };

    const stopHeartbeat = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Start on mount
    startHeartbeat();

    // Pause/resume based on app state (foreground/background)
    const handleAppState = (nextState: AppStateStatus) => {
      console.log('[Heartbeat] AppState changed to:', nextState);
      if (nextState === 'active') {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      console.log('[Heartbeat] Cleaning up heartbeat');
      stopHeartbeat();
      subscription.remove();
    };
  }, [user?.id, isLoaded]);
}

/**
 * Notify the backend that the user is logging out.
 * Call this BEFORE signOut() from Clerk.
 */
export async function notifyLogout(userId: string) {
  try {
    console.log('[Heartbeat] Notifying logout for user:', userId);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/logout`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log('[Heartbeat] Logout response:', response.status, JSON.stringify(data));
  } catch (error: any) {
    console.warn('[Heartbeat] Logout notify failed:', error?.message || error);
  }
}
