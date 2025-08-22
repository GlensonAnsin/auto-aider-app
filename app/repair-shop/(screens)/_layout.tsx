import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="edit-shop/edit-shop" />
      <Stack.Screen name="repair-history/repair-history" />
      <Stack.Screen name="repair-requests/repair-requests" />
    </Stack>
  );
}
