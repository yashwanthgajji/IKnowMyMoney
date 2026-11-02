import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TagWithStats } from '../../types';
import { formatCurrency } from '../../utils/money';
import { useSettingsStore } from '../../stores/settings.store';
import { ProgressBar } from './ProgressBar';
import { Tag as TagIcon, ChevronRight } from 'lucide-react-native';

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
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
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
            <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
              {tag.name}
            </Text>
            <Text className="text-[11px] text-gray-400">
              {tag.transaction_count} {tag.transaction_count === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-base font-extrabold text-gray-900">
            {formatCurrency(spent, currencySymbol, decimalPlaces)}
          </Text>
          {hasBudget && (
            <Text className="text-[10px] text-gray-400">
              of {formatCurrency(budget, currencySymbol, decimalPlaces)}
            </Text>
          )}
        </View>
      </View>

      {/* Optional Budget Section */}
      {hasBudget && (
        <View className="mt-1 pt-2 border-t border-gray-50">
          <ProgressBar spent={spent} total={budget} />
          <View className="flex-row items-center justify-between mt-1">
            <Text
              className={`text-[11px] font-semibold ${
                isOverBudget ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {isOverBudget
                ? `${formatCurrency(Math.abs(remaining), currencySymbol, decimalPlaces)} over budget`
                : `${formatCurrency(remaining, currencySymbol, decimalPlaces)} remaining`}
            </Text>
            <Text className="text-[11px] font-bold text-gray-600">
              {tag.budget_progress ?? 0}%
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
