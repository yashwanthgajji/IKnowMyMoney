import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TagWithStats } from '../../types';
import { formatCurrency } from '../../utils/money';
import { useSettingsStore } from '../../stores/settings.store';
import { ProgressBar } from './ProgressBar';
import { ChevronRight } from 'lucide-react-native';

interface TagSummaryCardProps {
  tag: TagWithStats;
  onPress: () => void;
  onLongPress?: () => void;
}

export function TagSummaryCard({ tag, onPress, onLongPress }: TagSummaryCardProps) {
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);
  const decimalPlaces = useSettingsStore((s) => s.decimalPlaces);

  const hasBudget = tag.budget_amount !== null && tag.budget_amount > 0;
  const spent = tag.total_amount;
  const budget = tag.budget_amount || 0;
  const remaining = budget - spent;
  const isOverBudget = remaining < 0;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      className="bg-white dark:bg-[#1B1E19] rounded-2xl p-4 mb-3 border border-[#D5D8CF] dark:border-[#2B3028]"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-2">
          <View
            style={{ backgroundColor: `${tag.color}20` }}
            className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
          >
            <View style={{ backgroundColor: tag.color }} className="w-3 h-3 rounded-full" />
          </View>
          <View className="flex-1">
            <Text
              className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]"
              numberOfLines={1}
            >
              {tag.name}
            </Text>
            <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-medium">
              {tag.transaction_count} {tag.transaction_count === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-base font-black text-[#0E0F0C] dark:text-[#F4F6F2]">
            {formatCurrency(spent, currencySymbol, decimalPlaces)}
          </Text>
          {hasBudget && (
            <Text className="text-[11px] text-[#868685] font-bold">
              of {formatCurrency(budget, currencySymbol, decimalPlaces)}
            </Text>
          )}
        </View>
      </View>

      {hasBudget && (
        <View className="mt-1">
          <ProgressBar spent={spent} total={budget} />
          <View className="flex-row justify-between items-center mt-1.5">
            <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-medium">
              {tag.budget_progress ?? 0}% used
            </Text>
            <Text
              className={`text-xs font-black ${
                isOverBudget ? 'text-[#A7000D] dark:text-[#F87171]' : 'text-[#054D28] dark:text-[#4ADE80]'
              }`}
            >
              {isOverBudget
                ? `Over by ${formatCurrency(Math.abs(remaining), currencySymbol, decimalPlaces)}`
                : `${formatCurrency(remaining, currencySymbol, decimalPlaces)} left`}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
