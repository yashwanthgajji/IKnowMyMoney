import React from 'react';
import * as Icons from 'lucide-react-native';

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
}

const ICON_ALIASES: Record<string, string> = {
  Home: 'House',
  Train: 'TrainFront',
  AlertCircle: 'CircleAlert',
  HelpCircle: 'CircleHelp',
  Edit: 'Pencil',
  Building2: 'Building',
};

export function DynamicIcon({ name, size = 22, color = '#111827' }: DynamicIconProps) {
  const resolvedName = ICON_ALIASES[name] || name;
  // @ts-ignore
  const IconComponent = Icons[resolvedName] || Icons[name] || Icons.CircleDollarSign || Icons.Tag;
  return <IconComponent size={size} color={color} />;
}
