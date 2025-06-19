import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  const [loaded] = useFonts({
    LeagueSpartan: require("../assets/fonts/LeagueSpartan-Regular.ttf"),
    LeagueSpartan_Bold : require("../assets/fonts/LeagueSpartan-Bold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: "none"}} />
        <Stack.Screen name="auth/login" options={{ animation: "none" }} />
        <Stack.Screen name="auth/signup" options={{ animation: "none" }} />
        <Stack.Screen name="car-owner/(tabs)" options={{ animation: "none" }} />
      </Stack>
    </>
  );
}
