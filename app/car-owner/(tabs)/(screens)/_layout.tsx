import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='diagnostic-history/diagnostic-history' options={{ animation: 'none'}} />
        <Stack.Screen name='profile/profile' options={{ animation: 'none' }} />
        <Stack.Screen name='profile/edit-profile' options={{ animation: 'none' }} />
        <Stack.Screen name='profile/manage-vehicles' options={{ animation: 'none' }} />
        <Stack.Screen name='run-diagnostics/run-diagnostics' options={{ animation: 'none' }} />
        <Stack.Screen name='run-diagnostics/diagnosis' options={{ animation: 'none' }} />
        <Stack.Screen name='run-diagnostics/detailed-report' options={{ animation: 'none' }} />
    </Stack>
  );
}
