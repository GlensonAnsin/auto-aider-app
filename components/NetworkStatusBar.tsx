import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useNetwork } from './NetworkProvider';

interface NetworkStatusBarProps {
  onRetry?: () => void;
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ onRetry }) => {
  const { isOffline, isConnected } = useNetwork();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      showMessage({
        message: 'Checking connection...',
        type: 'info',
        icon: 'info',
        color: '#fff',
        floating: true,
        duration: 1500,
      });
    }
  };

  // Don't show anything if we're online or connection status is unknown
  if (!isOffline || isConnected === null) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="wifi-off" size={16} color="#FFF" />
      <Text style={styles.text}>No internet connection</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <MaterialCommunityIcons name="refresh" size={14} color="#FFF" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  retryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
