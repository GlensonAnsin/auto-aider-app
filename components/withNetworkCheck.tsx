import { useNetwork } from '@/components/NetworkProvider';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';

interface WithNetworkCheckProps {
  requiresInternet?: boolean;
  redirectOnOffline?: boolean;
}

export function withNetworkCheck<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: WithNetworkCheckProps = {}
) {
  const { requiresInternet = true, redirectOnOffline = false } = options;

  return function NetworkCheckedComponent(props: T) {
    const { isOffline, isConnected } = useNetwork();
    const router = useRouter();

    useEffect(() => {
      if (requiresInternet && redirectOnOffline && isOffline && isConnected === false) {
        router.push('/error/offline');
      }
    }, [isOffline, isConnected, router]);

    // If component requires internet and we're offline, show nothing
    // (the NetworkProvider will handle the redirect)
    if (requiresInternet && isOffline) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Example usage:
// export default withNetworkCheck(MyComponent, { requiresInternet: true, redirectOnOffline: true });
