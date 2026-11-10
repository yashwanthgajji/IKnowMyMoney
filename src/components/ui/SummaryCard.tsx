import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react-native';
import { formatCurrency } from '../../utils/money';

interface HeroBalanceCardProps {
  balance: number;
  currencySymbol: string;
}

export function HeroBalanceCard({ balance, currencySymbol }: HeroBalanceCardProps) {
  return (
    <View className="bg-white dark:bg-[#1B1E19] rounded-2xl p-5 border border-[#D5D8CF] dark:border-[#2B3028]">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-xs font-black uppercase tracking-widest text-[#5B5F5A] dark:text-[#A3A8A0]">
          Total Available Balance
        </Text>
        <View className="flex-row items-center gap-1 bg-[#9FE870] px-2.5 py-1 rounded-full">
          <ShieldCheck size={13} color="#0E0F0C" />
          <Text className="text-[11px] font-black uppercase tracking-wider text-[#0E0F0C]">
            Private
          </Text>
        </View>
      </View>

      <Text className="text-3xl font-black text-[#0E0F0C] dark:text-[#F4F6F2] tracking-tight mt-1">
        {formatCurrency(balance, currencySymbol)}
      </Text>

      <View className="mt-3 pt-3 border-t border-[#E8EBE6] dark:border-[#2B3028] flex-row items-center justify-between">
        <Text className="text-xs font-medium text-[#5B5F5A] dark:text-[#A3A8A0]">
          Stored locally on this device
        </Text>
        <Text className="text-xs font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">
          100% Offline
        </Text>
      </View>
    </View>
  );
}

interface IncomeExpenseSummaryProps {
  income: number;
  expense: number;
  currencySymbol: string;
}

export function IncomeExpenseSummary({
  income,
  expense,
  currencySymbol,
}: IncomeExpenseSummaryProps) {
  return (
    <View className="flex-row gap-3 mt-3">
      {/* Monthly Income Card - Wise Typography First */}
      <View className="flex-1 bg-white dark:bg-[#1B1E19] rounded-2xl p-4 border border-[#D5D8CF] dark:border-[#2B3028]">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xs font-black uppercase tracking-widest text-[#5B5F5A] dark:text-[#A3A8A0]">
            Income
          </Text>
          <ArrowDownRight size={16} color="#054D28" />
        </View>
        <Text
          className="text-base font-black text-[#054D28] dark:text-[#4ADE80] mt-0.5 tracking-tight"
          numberOfLines={1}
        >
          +{formatCurrency(income, currencySymbol)}
        </Text>
      </View>

      {/* Monthly Expense Card - Wise Typography First */}
      <View className="flex-1 bg-white dark:bg-[#1B1E19] rounded-2xl p-4 border border-[#D5D8CF] dark:border-[#2B3028]">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xs font-black uppercase tracking-widest text-[#5B5F5A] dark:text-[#A3A8A0]">
            Spent
          </Text>
          <ArrowUpRight size={16} color="#A7000D" />
        </View>
        <Text
          className="text-base font-black text-[#A7000D] dark:text-[#F87171] mt-0.5 tracking-tight"
          numberOfLines={1}
        >
          -{formatCurrency(expense, currencySymbol)}
        </Text>
      </View>
    </View>
  );
}
