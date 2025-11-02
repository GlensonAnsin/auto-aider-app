import { BackHandlerManager } from '@/components/BackHandlerManager';
import { NetworkProvider } from '@/components/NetworkProvider';
import { store } from '@/redux/store';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import FlashMessage from 'react-native-flash-message';
import { Provider } from 'react-redux';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    HeaderRegular: require('../assets/fonts/Montserrat-Regular.ttf'),
    HeaderItalic: require('../assets/fonts/Montserrat-Italic.ttf'),
    HeaderBold: require('../assets/fonts/Montserrat-Bold.ttf'),
    HeaderBoldItalic: require('../assets/fonts/Inter_18pt-BoldItalic.ttf'),
    BodyRegular: require('../assets/fonts/Inter_18pt-Regular.ttf'),
    BodyItalic: require('../assets/fonts/Inter_18pt-Italic.ttf'),
    BodyBold: require('../assets/fonts/Inter_18pt-Bold.ttf'),
    BodyBoldItalic: require('../assets/fonts/Inter_18pt-BoldItalic.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <NetworkProvider>
        <StatusBar style="dark" />

        <FlashMessage position="top" style={{ marginTop: 40 }} />

        <BackHandlerManager />

        <Stack initialRouteName="index" screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="car-owner" />
          <Stack.Screen name="repair-shop" />
          <Stack.Screen name="chat-room/chat-room" />
          <Stack.Screen name="forgot-pass/forgot-pass" />
          <Stack.Screen name="error/offline" />
        </Stack>
      </NetworkProvider>
    </Provider>
  );
}
