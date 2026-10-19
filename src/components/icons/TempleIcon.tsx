import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const TempleIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L4 8H20L12 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Path d="M6 8V16M18 8V16M10 8V16M14 8V16" stroke={color} strokeWidth="2" />
    <Path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);