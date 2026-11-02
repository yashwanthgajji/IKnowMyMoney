import React from 'react';
import * as Icons from 'lucide-react-native';

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function DynamicIcon({ name, size = 22, color = '#111827' }: DynamicIconProps) {
  // @ts-ignore
  const IconComponent = Icons[name] || Icons.CircleDollarSign || Icons.Tag;
  return <IconComponent size={size} color={color} />;
}
