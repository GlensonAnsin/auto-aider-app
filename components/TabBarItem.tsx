import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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
  const badgePulse = useSharedValue(1);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused, scale]);

  useEffect(() => {
    if (badgeCount && badgeCount > 0) {
      badgePulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [badgeCount, badgePulse]);

  const handlePressIn = () => {
    pressScale.value = withSpring(0.9, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    const iconScaleValue = interpolate(scale.value, [0, 1], [1, 1.15]);
    const top = interpolate(scale.value, [0, 1], [0, 2]);

    return {
      transform: [{ scale: iconScaleValue * pressScale.value }],
      top,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity,
    };
  });

  const animatedBadgeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: badgePulse.value }],
    };
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabBarItem}
      activeOpacity={0.7}
    >
      <View style={{ position: 'relative' }}>
        <Animated.View style={animatedIconStyle}>{icon}</Animated.View>

        {badgeCount !== undefined && badgeCount !== 0 && (
          <Animated.View style={[styles.badgeContainer, animatedBadgeStyle]}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
          </Animated.View>
        )}
      </View>

      <Animated.Text style={[styles.tabLabel, animatedTextStyle, { color: isFocused ? '#000B58' : '#9CA3AF' }]}>
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
    gap: 2,
    paddingVertical: 6,
  },
  tabLabel: {
    fontFamily: 'BodyRegular',
    fontSize: 10,
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF4D4D',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
