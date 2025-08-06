import TabBar from '@/components/TabBar';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      backBehavior='history'
      initialRouteName='(tabs)/index'
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <Tabs.Screen
        name='(tabs)/index'
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name='(tabs)/inbox'
        options={{ title: 'Inbox' }}
      />
      <Tabs.Screen
        name='(tabs)/notifications'
        options={{ title: 'Notifications' }}
      />
      <Tabs.Screen
        name='(tabs)/settings'
        options={{ title: 'Settings' }}
      />
    </Tabs>
  );
}
