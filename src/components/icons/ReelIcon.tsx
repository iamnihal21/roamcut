import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

export function ReelIcon({ color = '#fff', size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="2" />
      <Circle cx="7.5" cy="9.5" r="2" stroke={color} strokeWidth="2" />
      <Circle cx="16.5" cy="9.5" r="2" stroke={color} strokeWidth="2" />
      <Circle cx="7.5" cy="14.5" r="2" stroke={color} strokeWidth="2" />
      <Circle cx="16.5" cy="14.5" r="2" stroke={color} strokeWidth="2" />
      <Path d="M12 4V20" stroke={color} strokeWidth="2" />
    </Svg>
  );
}