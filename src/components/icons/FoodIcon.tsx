import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const FoodIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2V8M12 2V8M10 8V22M6 8H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 6C16 6 18 8 18 11C18 13 16 14 16 14C16 14 14 13 14 11C14 8 16 6 16 6Z" fill="#E17055" />
  </Svg>
);