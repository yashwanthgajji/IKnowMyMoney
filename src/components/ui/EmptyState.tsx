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
    <View className="items-center justify-center p-8 my-6">
      <View className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1B1E19] border border-[#D5D8CF] dark:border-[#2B3028] items-center justify-center mb-4">
        <DynamicIcon name={icon} size={28} color="#5B5F5A" />
      </View>
      <Text className="text-base font-black text-[#0E0F0C] dark:text-[#F4F6F2] text-center mb-1">
        {title}
      </Text>
      <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] text-center leading-relaxed px-4">
        {subtitle}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAction}
          className="mt-5 px-6 py-3 bg-[#9FE870] rounded-full border border-[#86D454] active:bg-[#86D454]"
        >
          <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
