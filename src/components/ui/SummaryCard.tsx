import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react-native';
import { formatCurrency } from '../../utils/money';

interface HeroBalanceCardProps {
  balance: number;
  currencySymbol: string;
}

export function HeroBalanceCard({ balance, currencySymbol }: HeroBalanceCardProps) {
  return (
    <View className="bg-emerald-800 rounded-2xl p-5 shadow-md">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-emerald-100 text-xs font-medium uppercase tracking-wider">
          Total Net Balance
        </Text>
        <Wallet size={18} color="#A7F3D0" />
      </View>
      <Text className="text-white text-3xl font-extrabold tracking-tight">
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
      {/* Monthly Income Card */}
      <View className="flex-1 bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3">
          <ArrowDownRight size={20} color="#047857" />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500 font-medium">Income</Text>
          <Text className="text-sm font-bold text-emerald-700" numberOfLines={1}>
            {formatCurrency(income, currencySymbol)}
          </Text>
        </View>
      </View>

      {/* Monthly Expense Card */}
      <View className="flex-1 bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-3">
          <ArrowUpRight size={20} color="#B91C1C" />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500 font-medium">Expenses</Text>
          <Text className="text-sm font-bold text-red-700" numberOfLines={1}>
            {formatCurrency(expense, currencySymbol)}
          </Text>
        </View>
      </View>
    </View>
  );
}
