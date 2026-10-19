import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const LeafIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 4C20 4 14 4 10 8C6 12 4 20 4 20C4 20 12 18 16 14C20 10 20 4 20 4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
);