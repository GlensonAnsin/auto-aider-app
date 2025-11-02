// Example usage of the network monitoring system

// Method 1: Using the NetworkStatusBar component in any screen
import { NetworkStatusBar } from '@/components/NetworkStatusBar';
import React from 'react';
import { Text, View } from 'react-native';

// Method 2: Using the useNetwork hook for custom logic
import { useNetwork } from '@/components/NetworkProvider';

// Method 3: Using the HOC for automatic redirection
import { withNetworkCheck } from '@/components/withNetworkCheck';
import { showMessage } from 'react-native-flash-message';

const ExampleScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* This will show a red bar when offline */}
      <NetworkStatusBar />

      <View style={{ flex: 1, padding: 20 }}>
        <Text>Your screen content here</Text>
      </View>
    </View>
  );
};

const AnotherScreen = () => {
  const { isOffline, isConnected } = useNetwork();

  if (isOffline) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You are offline. Some features may not work.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Online content here</Text>
    </View>
  );
};

const NetworkRequiredScreen = () => {
  return (
    <View>
      <Text>This screen requires internet</Text>
    </View>
  );
};

export default withNetworkCheck(NetworkRequiredScreen, {
  requiresInternet: true,
  redirectOnOffline: true,
});

// Method 4: Using network status in API calls
const ApiScreen = () => {
  const { isOffline } = useNetwork();

  const handleApiCall = async () => {
    if (isOffline) {
      showMessage({
        message: 'No internet connection',
        description: 'Please check your connection and try again',
        type: 'warning',
      });
      return;
    }

    // Proceed with API call
    try {
      // Your API call here
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View>
      <NetworkStatusBar onRetry={handleApiCall} />
      {/* Your screen content */}
    </View>
  );
};
