import * as React from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [state, setState] = React.useState<NetworkStatus>({
    isOnline: true,
    isConnected: null,
  });

  React.useEffect(() => {
    // Fetch state immediately on mount
    NetInfo.fetch().then((netState: NetInfoState) => {
      setState({
        isConnected: netState.isConnected,
        isOnline: !!(netState.isConnected && netState.isInternetReachable !== false),
      });
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
      setState({
        isConnected: netState.isConnected,
        isOnline: !!(netState.isConnected && netState.isInternetReachable !== false),
      });
    });

    return unsubscribe;
  }, []);

  return state;
}
