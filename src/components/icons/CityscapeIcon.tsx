import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const CityscapeIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 21V9L8 6V21M8 21V3L14 6V21M14 21V10L21 13V21" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
);