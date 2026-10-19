import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { CompassIcon, ShareIcon, ReelIcon } from './icons';

const { width, height } = Dimensions.get('window');
const NUM_PARTICLES = 25;

const PARTICLES = Array.from({ length: NUM_PARTICLES }).map((_, i) => ({
  id: i,
  x: Math.random() * width,
  y: -50 - Math.random() * 100,
  rotation: Math.random() * 360,
  delay: Math.random() * 500,
  type: i % 3, // 0: compass, 1: plane, 2: reel
  size: 16 + Math.random() * 16,
}));

const Particle = ({ x, y, rotation, delay, type, size }: any) => {
  const translateY = useSharedValue(y);
  const translateX = useSharedValue(x);
  const rotate = useSharedValue(rotation);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Fall down with gravity feel
    translateY.value = withDelay(
      delay,
      withTiming(height + 100, { duration: 2500, easing: Easing.in(Easing.quad) })
    );
    // Slight horizontal drift
    translateX.value = withDelay(
      delay,
      withTiming(x + (Math.random() * 100 - 50), { duration: 2500 })
    );
    // Spin
    rotate.value = withDelay(
      delay,
      withTiming(rotation + 720, { duration: 2500 })
    );
    // Fade out near the end
    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
    position: 'absolute',
  }));

  return (
    <Animated.View style={animatedStyle}>
      {type === 0 && <CompassIcon color="#E17055" size={size} />}
      {type === 1 && <ShareIcon color="#00B894" size={size} />}
      {type === 2 && <ReelIcon color="#0F3460" size={size} />}
    </Animated.View>
  );
};

export const Confetti = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PARTICLES.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
};