import { useBackRoute } from '@/hooks/useBackRoute';
import { RootState } from '@/redux/store';
import { countUnreadChatCO, countUnreadChatRS, countUnreadNotifCO, countUnreadNotifRS } from '@/services/backendApi';
import socket from '@/services/socket';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import TabBarItem from './TabBarItem';

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  const [unreadNotifs, setUnreadNotifs] = useState<number | null>(null);
  const [unreadChats, setUnreadChats] = useState<number | null>(null);

  const icons = {
    '(tabs)/index': (color: string, isFocused: boolean) => (
      <Entypo name="home" size={isFocused ? 24 : 22} color={color} />
    ),
    '(tabs)/inbox': (color: string, isFocused: boolean) => (
      <Entypo name="chat" size={isFocused ? 24 : 22} color={color} />
    ),
    '(tabs)/notifications': (color: string, isFocused: boolean) => (
      <Ionicons name="notifications" size={isFocused ? 24 : 22} color={color} />
    ),
  };

  const userID = useSelector((state: RootState) => state.role.ID);
  const tabVisible = useSelector((state: RootState) => state.tab.tabVisible);
  const role = useSelector((state: RootState) => state.role.role);

  const backRoute = useBackRoute(`/${role}`);

  useEffect(() => {
    if (!userID || !role) return;

    (async () => {
      try {
        if (role === 'car-owner') {
          const res1 = await countUnreadNotifCO();
          const res2 = await countUnreadChatCO();
          setUnreadNotifs(res1);
          setUnreadChats(res2);
        } else {
          const res1 = await countUnreadNotifRS();
          const res2 = await countUnreadChatRS();
          setUnreadNotifs(res1);
          setUnreadChats(res2);
        }
      } catch {}
    })();
  }, [role, userID]);

  useEffect(() => {
    if (!socket) return;

    if (role === 'car-owner') {
      socket.on(`newUnreadNotif-CO-${userID}`, ({ unreadNotifs }) => setUnreadNotifs(unreadNotifs));
      socket.on(`newUnreadChat-CO-${userID}`, ({ unreadChatsCO }) => setUnreadChats(unreadChatsCO));
    } else {
      socket.on(`newUnreadNotif-RS-${userID}`, ({ unreadNotifs }) => setUnreadNotifs(unreadNotifs));
      socket.on(`newUnreadChat-RS-${userID}`, ({ unreadChatsRS }) => setUnreadChats(unreadChatsRS));
    }

    return () => {
      socket.off(`newUnreadNotif-CO-${userID}`);
      socket.off(`newUnreadChat-CO-${userID}`);
      socket.off(`newUnreadNotif-RS-${userID}`);
      socket.off(`newUnreadChat-RS-${userID}`);
    };
  }, [role, userID]);

  return (
    <>
      {tabVisible && (
        <Animated.View
          entering={FadeInDown.duration(300).springify()}
          exiting={FadeOutDown.duration(300).springify()}
          style={[styles.tabBar, { paddingBottom: insets.bottom }]}
        >
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

            let badgeCount = 0;
            if (route.name === '(tabs)/notifications') {
              badgeCount = unreadNotifs ?? 0;
            } else if (route.name === '(tabs)/inbox') {
              badgeCount = unreadChats ?? 0;
            }

            return (
              <TabBarItem
                key={route.key}
                label={typeof label === 'string' ? label : route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                icon={icons[route.name as keyof typeof icons](isFocused ? '#000B58' : '#9CA3AF', isFocused)}
                badgeCount={badgeCount}
              />
            );
          })}
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default memo(TabBar);
