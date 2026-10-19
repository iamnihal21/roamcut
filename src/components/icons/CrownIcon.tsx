import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export const CrownIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 18L2 6L7 10L12 4L17 10L22 6L20 18H4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="1.5" fill="#E17055" />
  </Svg>
);