import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <>
      <StatusBar barStyle='light-content' />

      <FlashMessage position='top' />

      <SafeAreaProvider>
        <Stack initialRouteName='index'>
          <Stack.Screen name='index' options={{ headerShown: false, animation: 'none'}} />
          <Stack.Screen name='auth/login' options={{ headerShown: false, animation: 'none' }} />
          <Stack.Screen name='auth/signup' options={{ headerShown: false, animation: 'none' }} />
          <Stack.Screen name='car-owner/(tabs)' options={{ headerShown: false, animation: 'none' }} />
          <Stack.Screen name='repair-shop/(tabs)' options={{ headerShown: false, animation: 'none' }} />
        </Stack>
      </SafeAreaProvider>
    </>
  );
}
