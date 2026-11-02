import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

interface TagChipProps {
  name: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function TagChip({
  name,
  color,
  selected = false,
  onPress,
  onRemove,
  size = 'md',
}: TagChipProps) {
  const isSm = size === 'sm';

  const containerStyle = {
    backgroundColor: selected ? color : `${color}18`,
    borderColor: selected ? color : `${color}40`,
  };

  const textColor = selected ? '#FFFFFF' : color;

  const content = (
    <View
      style={containerStyle}
      className={`flex-row items-center rounded-full border ${
        isSm ? 'px-2 py-0.5 mr-1.5 mb-1' : 'px-3 py-1.5 mr-2 mb-2'
      }`}
    >
      <View
        style={{ backgroundColor: selected ? '#FFFFFF' : color }}
        className={`rounded-full mr-1.5 ${isSm ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
      />
      <Text
        style={{ color: textColor }}
        className={`font-semibold ${isSm ? 'text-[10px]' : 'text-xs'}`}
        numberOfLines={1}
      >
        {name}
      </Text>
      {onRemove && (
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onRemove}
          className="ml-1.5 p-0.5 rounded-full bg-black/10"
        >
          <X size={isSm ? 10 : 12} color={textColor} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
