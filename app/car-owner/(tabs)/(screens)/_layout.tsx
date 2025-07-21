import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
        <Stack.Screen name='diagnostic-history/diagnostic-history' options={{ headerShown: false, animation: 'none'}} />
        <Stack.Screen name='diagnostic-history/history-detailed-report' options={{ headerShown: false, animation: 'none'}} />
        <Stack.Screen name='profile/profile' options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name='profile/edit-profile' options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name='profile/manage-vehicles' options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name='run-diagnostics/run-diagnostics' options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name='run-diagnostics/diagnosis' options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name='run-diagnostics/detailed-report' options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name='repair-shops/repair-shops' options={{ headerShown: false, animation: 'none' }} />
    </Stack>
  );
}
