import { Tabs } from 'expo-router';
import { View } from 'react-native';
import NotificationIcon from '../../../assets/images/ion_notifications.svg';
import SettingsIcon from '../../../assets/images/material-symbols_settings.svg';
import HomeIcon from '../../../assets/images/typcn_home.svg';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        animation: 'none',
        tabBarStyle: {
          backgroundColor: '#000B58',
          height: 60,
          paddingHorizontal: 10,
          paddingTop: 10,
        }
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <HomeIcon width={30} height={30} color='#fff' />
            </View>
          ),
          animation: 'none',
        }}
      />
      <Tabs.Screen
        name='notifications'
        options={{
          title: 'Notifications',
          tabBarIcon: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <NotificationIcon width={30} height={30} color='#fff' />
            </View>
          ),
          animation: 'none',
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SettingsIcon width={30} height={30} color='#fff' />
            </View>
          ),
          animation: 'none',
        }}
      />
      <Tabs.Screen
        name='(screens)'
        options={{
          href: null,
          animation: 'none',
        }}
      />
    </Tabs>
  );
}
