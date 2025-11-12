import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ServerError = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  const handleRetry = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="server-off" size={100} color="#E0E0E0" />
        </View>

        <Text style={styles.title}>Something Went Wrong</Text>
        <Text style={styles.description}>
          We&apos;re having trouble connecting to our servers. Please try again in a moment.
        </Text>

        <View style={styles.errorCodeContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#F44336" />
          <Text style={styles.errorCodeText}>Server Error</Text>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>What you can do:</Text>
          <Text style={styles.tipItem}>• Wait a moment and try again</Text>
          <Text style={styles.tipItem}>• Check your internet connection</Text>
          <Text style={styles.tipItem}>• Restart the app if the problem persists</Text>
          <Text style={styles.tipItem}>• Contact support if the issue continues</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
            )}
            <Text style={styles.retryButtonText}>{isRetrying ? 'Retrying...' : 'Try Again'}</Text>
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
    fontFamily: 'BodyRegular',
  },
  errorCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
    gap: 8,
  },
  errorCodeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F44336',
    fontFamily: 'BodyBold',
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
    fontFamily: 'HeadingBold',
  },
  tipItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: 'BodyRegular',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
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
    fontFamily: 'BodyBold',
  },
  homeButton: {
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
  homeButtonText: {
    color: '#000B58',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'BodyBold',
  },
});

export default ServerError;
