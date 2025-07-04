import TabBar from '@/components/TabBar';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          headerShown: false,
          animation: 'none',
        }}
      />
      <Tabs.Screen
        name='inbox'
        options={{
          title: 'Inbox',
          headerShown: false,
          animation: 'none',
        }}
      />
      <Tabs.Screen
        name='notifications'
        options={{
          title: 'Notifications',
          headerShown: false,
          animation: 'none',
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          headerShown: false,
          animation: 'none',
        }}
      />
    </Tabs>
  );
}
