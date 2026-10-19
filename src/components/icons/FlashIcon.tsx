import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const FlashIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
);  