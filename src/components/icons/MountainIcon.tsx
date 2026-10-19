import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const MountainIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 20L12 4L21 20H3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Path d="M12 4L15 10H9L12 4Z" fill="#E17055" />
  </Svg>
);