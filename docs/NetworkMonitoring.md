# Network Monitoring System Documentation

## Overview
This system provides comprehensive network monitoring and automatic offline handling for your React Native Expo app. When users lose internet connection during app usage, they will be automatically redirected to the offline screen.

## Components

### 1. `useNetworkStatus` Hook
**Location**: `hooks/useNetworkStatus.ts`

A custom hook that monitors real-time network connectivity using `@react-native-community/netinfo`.

**Returns:**
- `isConnected`: Boolean indicating if device is connected to a network
- `isInternetReachable`: Boolean indicating if internet is actually reachable
- `isOffline`: Boolean combining both states for easy offline detection

### 2. `NetworkProvider` Context
**Location**: `components/NetworkProvider.tsx`

A context provider that wraps your entire app and provides:
- Global network state monitoring
- Automatic redirection to `/error/offline` when connection is lost
- Flash messages for connection status changes
- 3-second delay to avoid false positives during quick network switches

**Features:**
- Shows "Connection Lost" warning message immediately
- Waits 3 seconds before redirecting to avoid false alarms
- Shows "Connection Restored" success message when back online
- Prevents multiple redirects if already on offline page

### 3. `NetworkStatusBar` Component
**Location**: `components/NetworkStatusBar.tsx`

A red banner that appears at the top of screens when offline, providing:
- Visual indication of offline status
- Retry button for manual connection checking
- Auto-hides when connection is restored

### 4. `withNetworkCheck` HOC
**Location**: `components/withNetworkCheck.tsx`

A higher-order component that can wrap screens requiring internet connection:
- `requiresInternet`: If true, hides component when offline
- `redirectOnOffline`: If true, redirects to offline page when connection lost

### 5. Enhanced Offline Screen
**Location**: `app/error/offline.tsx`

Comprehensive offline handler with:
- Real-time connection status monitoring
- Manual retry functionality
- Troubleshooting tips for users
- Auto-detection of connection restoration
- Smooth navigation back to previous screen

## Implementation

### Step 1: Root Layout Setup
The `NetworkProvider` is wrapped around your entire app in `app/_layout.tsx`:

```tsx
<Provider store={store}>
  <NetworkProvider>
    <Stack>
      {/* Your screens */}
      <Stack.Screen name="error/offline" />
    </Stack>
  </NetworkProvider>
</Provider>
```

### Step 2: Automatic Behavior
Once implemented, the system automatically:

1. **Monitors network status** in real-time across all screens
2. **Shows warning message** immediately when connection is lost
3. **Waits 3 seconds** to avoid false alarms during network switches
4. **Redirects to offline screen** if connection is still lost
5. **Shows success message** when connection is restored
6. **Allows navigation back** to the previous screen

## Usage Examples

### Basic Usage (Already Active)
No additional code needed - the system works automatically once `NetworkProvider` is in your root layout.

### Manual Network Status Checking
```tsx
import { useNetwork } from '@/components/NetworkProvider';

const MyScreen = () => {
  const { isOffline, isConnected } = useNetwork();
  
  if (isOffline) {
    // Handle offline state
  }
  
  return <YourScreenContent />;
};
```

### Adding Status Bar to Screens
```tsx
import { NetworkStatusBar } from '@/components/NetworkStatusBar';

const MyScreen = () => {
  return (
    <View>
      <NetworkStatusBar />
      <YourScreenContent />
    </View>
  );
};
```

### Screen-Level Network Requirements
```tsx
import { withNetworkCheck } from '@/components/withNetworkCheck';

const OnlineOnlyScreen = () => {
  return <YourContent />;
};

export default withNetworkCheck(OnlineOnlyScreen, { 
  requiresInternet: true,
  redirectOnOffline: true 
});
```

## Flow Diagram

1. **User is online** → App works normally
2. **Connection lost** → Warning message appears
3. **3 seconds delay** → Checks if still offline
4. **Still offline** → Redirects to `/error/offline`
5. **Connection restored** → Success message + auto-navigation back
6. **Manual retry** → User can manually check connection on offline screen

## Benefits

- **Seamless UX**: Users get immediate feedback about connectivity issues
- **False positive prevention**: 3-second delay prevents unnecessary redirects
- **Comprehensive handling**: Works globally across all screens
- **User-friendly**: Clear instructions and retry options on offline screen
- **Automatic recovery**: Detects and handles connection restoration
- **Flexible**: Multiple ways to implement based on screen requirements

## Dependencies

- `@react-native-community/netinfo` (already installed)
- `react-native-flash-message` (already installed)
- `@expo/vector-icons` (already installed)

The system is now fully integrated and will automatically handle offline scenarios throughout your app!