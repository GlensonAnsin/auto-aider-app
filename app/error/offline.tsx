import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Offline = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);

      // If connection is restored, show success message and navigate back
      if (state.isConnected && isConnected === false) {
        Alert.alert('Connection Restored', 'Your internet connection has been restored!', [
          {
            text: 'Continue',
            onPress: () => router.back(),
          },
        ]);
      }
    });

    // Get initial network state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, [isConnected, router]);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      const state = await NetInfo.fetch();

      setTimeout(() => {
        setIsRetrying(false);

        if (state.isConnected) {
          Alert.alert('Connection Restored', 'Your internet connection has been restored!', [
            {
              text: 'Continue',
              onPress: () => router.back(),
            },
          ]);
        } else {
          Alert.alert('Still Offline', 'Please check your internet connection and try again.', [{ text: 'OK' }]);
        }
      }, 2000); // Add a small delay to show the loading state
    } catch {
      setIsRetrying(false);
      Alert.alert('Error', 'Unable to check connection status. Please try again.', [{ text: 'OK' }]);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="wifi-off" size={100} color="#E0E0E0" />
        </View>

        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.description}>
          Oops! It looks like you&apos;re not connected to the internet. Please check your connection and try again.
        </Text>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            {isConnected === null ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick fixes:</Text>
          <Text style={styles.tipItem}>• Check your Wi-Fi connection</Text>
          <Text style={styles.tipItem}>• Turn off Airplane Mode</Text>
          <Text style={styles.tipItem}>• Check your mobile data</Text>
          <Text style={styles.tipItem}>• Move to an area with better signal</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
            )}
            <Text style={styles.retryButtonText}>{isRetrying ? 'Checking...' : 'Try Again'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#000B58" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'HeaderBold',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 320,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    maxWidth: 320,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#000B58',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#000B58',
  },
  backButtonText: {
    color: '#000B58',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Offline;
