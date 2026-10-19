import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const RoadIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 21L9 3M20 21L15 3" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Path d="M12 6V9M12 12V15M12 18V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);