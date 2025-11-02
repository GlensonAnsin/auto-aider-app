import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePathname, useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import { showMessage } from 'react-native-flash-message';

interface NetworkContextType {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: null,
  isInternetReachable: null,
  isOffline: false,
});

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const { isConnected, isInternetReachable, isOffline } = useNetworkStatus();
  const router = useRouter();
  const pathname = usePathname();
  const previousConnectionState = useRef<boolean | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Don't redirect if already on offline page
    if (pathname === '/error/offline') {
      return;
    }

    // Handle connection loss
    if (isConnected === false || isInternetReachable === false) {
      // Show immediate feedback
      showMessage({
        message: 'Connection Lost',
        description: 'Checking your internet connection...',
        type: 'warning',
        icon: 'warning',
        color: '#fff',
        floating: true,
        duration: 2000,
      });

      // Add a delay to avoid false positives during quick network switches
      timeoutRef.current = setTimeout(() => {
        router.push('/error/offline');
      }, 3000); // 3 second delay to allow for quick reconnections
    }

    // Handle connection restoration
    if (previousConnectionState.current === false && isConnected === true && isInternetReachable === true) {
      showMessage({
        message: 'Connection Restored',
        description: 'You are back online!',
        type: 'success',
        icon: 'success',
        color: '#fff',
        floating: true,
        duration: 2000,
      });
    }

    // Update previous state
    previousConnectionState.current = isConnected;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isConnected, isInternetReachable, router, pathname]);

  const contextValue: NetworkContextType = {
    isConnected,
    isInternetReachable,
    isOffline,
  };

  return <NetworkContext.Provider value={contextValue}>{children}</NetworkContext.Provider>;
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
