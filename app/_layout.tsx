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
    LeagueSpartan: require('../assets/fonts/LeagueSpartan-Regular.ttf'),
    LeagueSpartan_Bold : require('../assets/fonts/LeagueSpartan-Bold.ttf'),
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
      <StatusBar style='dark' />

      <FlashMessage position='top' style={{ marginTop: 30 }} />

      <Stack initialRouteName='index' screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name='index' />
        <Stack.Screen name='auth/login' />
        <Stack.Screen name='auth/signup' />
        <Stack.Screen name='car-owner' />
        <Stack.Screen name='repair-shop' />
      </Stack>
    </Provider>
  );
}
