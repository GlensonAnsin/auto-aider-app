import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
        <Stack.Screen name='edit-shop/edit-shop' options={{ headerShown: false, animation: 'none'}} />
        <Stack.Screen name='repair-history/repair-history' options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name='repair-requests/repair-requests' options={{ headerShown: false, animation: 'none' }} />
    </Stack>
  );
}
