import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const WaveIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 12C5 8 8 16 12 12C16 8 19 16 22 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M2 17C5 13 8 21 12 17C16 13 19 21 22 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);