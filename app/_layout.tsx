import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const [loaded] = useFonts({
    LeagueSpartan: require("../assets/fonts/LeagueSpartan-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" options={{ animation: "none" }} />
        <Stack.Screen name="(auth)/signup" options={{ animation: "none" }} />
        <Stack.Screen name="car-owner/co-dashboard" options={{ animation: "none" }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  )
}
