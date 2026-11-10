import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import { formatCurrency } from '../../utils/money';

interface HeroBalanceCardProps {
  balance: number;
  currencySymbol: string;
}

export function HeroBalanceCard({ balance, currencySymbol }: HeroBalanceCardProps) {
  return (
    <View className="bg-white dark:bg-[#1B1E19] rounded-2xl p-5 border border-[#D5D8CF] dark:border-[#2B3028]">
      <Text className="text-xs font-black uppercase tracking-widest text-[#5B5F5A] dark:text-[#A3A8A0] mb-1">
        Total Available Balance
      </Text>
      <Text className="text-3xl font-black text-[#0E0F0C] dark:text-[#F4F6F2] tracking-tight">
        {formatCurrency(balance, currencySymbol)}
      </Text>
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
