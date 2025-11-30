import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="edit-shop/edit-shop" />
      <Stack.Screen name="repair-requests/repair-requests" />
      <Stack.Screen name="repair-requests/recent-scans" />
      <Stack.Screen name="repair-requests/scan-detailed-report" />
      <Stack.Screen name="settings/settings" />
      <Stack.Screen name="settings/settings-screens/terms-of-service" />
      <Stack.Screen name="settings/settings-screens/privacy-policy" />
    </Stack>
  );
}
