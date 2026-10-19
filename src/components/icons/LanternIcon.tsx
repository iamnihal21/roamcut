import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export const LanternIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="8" y="6" width="8" height="12" rx="4" stroke={color} strokeWidth="2" />
    <Path d="M12 2V6M12 18V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M6 12H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);