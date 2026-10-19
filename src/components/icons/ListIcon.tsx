import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export const ListIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="4" rx="1" fill={color} />
    <Rect x="3" y="11" width="18" height="4" rx="1" fill={color} />
    <Rect x="3" y="17" width="18" height="4" rx="1" fill={color} />
  </Svg>
);