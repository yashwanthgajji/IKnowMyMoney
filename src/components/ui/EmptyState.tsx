import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DynamicIcon } from './DynamicIcon';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center p-8 my-8">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <DynamicIcon name={icon} size={32} color="#9CA3AF" />
      </View>
      <Text className="text-base font-bold text-gray-800 text-center mb-1">
        {title}
      </Text>
      <Text className="text-xs text-gray-500 text-center leading-relaxed px-4">
        {subtitle}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAction}
          className="mt-5 px-5 py-2.5 bg-emerald-700 rounded-xl"
        >
          <Text className="text-white text-xs font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
