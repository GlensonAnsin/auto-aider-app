import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="diagnostic-history/diagnostic-history" />
      <Stack.Screen name="diagnostic-history/history-detailed-report" />
      <Stack.Screen name="profile/profile" />
      <Stack.Screen name="profile/edit-profile" />
      <Stack.Screen name="profile/manage-vehicles" />
      <Stack.Screen name="profile/recent-scans" />
      <Stack.Screen name="run-diagnostics/run-diagnostics" />
      <Stack.Screen name="run-diagnostics/diagnosis" />
      <Stack.Screen name="run-diagnostics/detailed-report" />
      <Stack.Screen name="repair-shops/repair-shops" />
      <Stack.Screen name="request-status/request-status" />
      <Stack.Screen name="profile/settings-screens/terms-of-service" />
      <Stack.Screen name="profile/settings-screens/privacy-policy" />
    </Stack>
  );
}
