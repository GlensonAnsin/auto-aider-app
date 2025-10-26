import { useBackRoute } from '@/hooks/useBackRoute';
import { RootState } from '@/redux/store';
import { getNotificationsCO } from '@/services/backendApi';
import socket from '@/services/socket';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import TabBarItem from './TabBarItem';

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const [notification, setNotification] = useState<{ notificationID: number; isRead: boolean }[]>([]);

  const icons = {
    '(tabs)/index': (color: string) => <Entypo name="home" size={22} color={color} />,
    '(tabs)/inbox': (color: string) => <Entypo name="chat" size={22} color={color} />,
    '(tabs)/notifications': (color: string) => <Ionicons name="notifications" size={22} color={color} />,
  };

  const userID = useSelector((state: RootState) => state.role.ID);
  const tabVisible = useSelector((state: RootState) => state.tab.tabVisible);
  const role = useSelector((state: RootState) => state.role.role);

  const backRoute = useBackRoute(`/${role}`);

  useEffect(() => {
    (async () => {
      try {
        const notificationData: {
          notificationID: number;
          isRead: boolean;
        }[] = [];

        const res = await getNotificationsCO();

        res.forEach((item: any) => {
          notificationData.push({
            notificationID: item.notification_id,
            isRead: item.is_read,
          });
        });

        setNotification(notificationData);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(`newNotif-CO-${userID}`, ({ newNotif }) => {
      const newNotifData = {
        notificationID: newNotif.notification_id,
        isRead: newNotif.is_read,
      };
      setNotification((prev) => [...prev, newNotifData]);
    });

    return () => {
      socket.off(`newNotif-CO-${userID}`);
    };
  }, [userID]);

  return (
    <>
      {tabVisible && (
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;

            if (['(screens)', '_sitemap', '+not-found'].includes(route.name)) return null;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
                backRoute();
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabBarItem
                key={route.key}
                label={typeof label === 'string' ? label : route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                icon={icons[route.name as keyof typeof icons](isFocused ? '#FFF' : '#FFF')}
                badgeCount={route.name === '(tabs)/notifications' ? notification.filter((n) => !n.isRead).length : 0}
              />
            );
          })}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000B58',
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default memo(TabBar);
