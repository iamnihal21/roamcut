import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export const TrashIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7H20M10 11V17M14 11V17M6 7L7 21H17L18 7M9 7V4H15V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="9" y="11" width="2" height="2" fill={color} />
    <Rect x="13" y="11" width="2" height="2" fill={color} />
  </Svg>
);