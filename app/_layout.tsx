import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  const [loaded] = useFonts({
    LeagueSpartan: require("../assets/fonts/LeagueSpartan-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" options={{ animation: "none" }} />
        <Stack.Screen name="(auth)/signup" options={{ animation: "none" }} />
        <Stack.Screen name="car-owner/(tabs)" options={{ animation: "none" }} />
      </Stack>
    </>
  );
}
