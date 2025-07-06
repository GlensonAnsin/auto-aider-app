import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import TabBarItem from './TabBarItem';

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const icons = {
    index: (color: string) => <Entypo name='home' size={22} color={color} />,
    inbox: (color: string) => <Entypo name='chat' size={22} color={color} />,
    notifications: (color: string) => <Ionicons name='notifications' size={22} color={color} />,
    settings: (color: string) => <Ionicons name='settings' size={22} color={color} />,
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel ??
          options.title ??
          route.name;

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
            icon={
              icons[route.name as keyof typeof icons](
                isFocused ? '#FFF' : '#FFF'
              )
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 5,
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