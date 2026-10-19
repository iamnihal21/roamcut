import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export function CompassIcon({ color = '#fff', size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M16 8L14 14L8 16L10 10L16 8Z" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
    </Svg>
  );
}