import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  icon: React.ReactNode;
  badgeCount?: number;
};

export default function TabBarItem({ label, isFocused, onPress, onLongPress, icon, badgeCount }: Props) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [isFocused, scale]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const iconScaleValue = interpolate(scale.value, [0, 1], [1, 1.4]);

    const top = interpolate(scale.value, [0, 1], [0, 8]);

    return {
      transform: [{ scale: iconScaleValue }],
      top,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity,
    };
  });

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={styles.tabBarItem}>
      <View style={{ position: 'relative' }}>
        <Animated.View style={animatedIconStyle}>{icon}</Animated.View>

        {badgeCount !== undefined && badgeCount !== 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
          </View>
        )}
      </View>

      <Animated.Text style={[styles.tabLabel, animatedTextStyle, { color: isFocused ? '#FFF' : '#FFF' }]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontFamily: 'BodyRegular',
    fontSize: 11,
  },
  badgeContainer: {
    position: 'absolute',
    top: -3,
    right: -10,
    backgroundColor: '#FF4D4D',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
