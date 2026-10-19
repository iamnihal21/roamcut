import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

export const WandIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 4V2M15 10V8M12 7H10M20 7H18M5.5 14.5L19 1M19.5 18.5L21 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="14" y1="15" x2="19" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);