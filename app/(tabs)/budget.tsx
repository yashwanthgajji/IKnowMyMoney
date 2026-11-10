import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Trash2, Target, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { BudgetRepository } from '../../src/repositories/budget.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { BudgetWithDetails } from '../../src/types';
import { formatCurrency } from '../../src/utils/money';
import { getMonthBounds, formatMonthYear, subMonths, addMonths } from '../../src/utils/dates';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function BudgetScreen() {
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [budgets, setBudgets] = useState<BudgetWithDetails[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const loadBudgets = useCallback(async () => {
    try {
      const { start, end } = getMonthBounds(currentDate);
      const list = await BudgetRepository.getAllWithSpent(start, end);
      setBudgets(list);
    } catch (e) {
      console.error('Failed to load budgets', e);
    }
  }, [currentDate]);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  };

  const handleDeleteBudget = (budget: BudgetWithDetails) => {
    Alert.alert(
      'Delete Budget',
      `Delete budget limit for ${budget.category_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await BudgetRepository.delete(budget.id);
              await loadBudgets();
            } catch (e) {
              console.error('Failed to delete budget', e);
            }
          },
        },
      ]
    );
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      {/* Month Selector Bar - Wise Pill Style */}
      <View className="mx-4 mt-3 bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] px-3.5 py-2.5 flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePrevMonth}
          className="p-1.5 rounded-full bg-[#F4F6F2] dark:bg-[#242921] active:opacity-70"
        >
          <ChevronLeft size={18} color="#0E0F0C" />
        </TouchableOpacity>
        <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
          {formatMonthYear(currentDate)}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNextMonth}
          className="p-1.5 rounded-full bg-[#F4F6F2] dark:bg-[#242921] active:opacity-70"
        >
          <ChevronRight size={18} color="#0E0F0C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0E0F0C', '#054D28']}
          />
        }
      >
        {/* Monthly Budget Summary Card - Wise Flat Card */}
        <View className="m-4 bg-white dark:bg-[#1B1E19] rounded-2xl p-5 border border-[#D5D8CF] dark:border-[#2B3028]">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest">
              Total Monthly Budget
            </Text>
            <View className="bg-[#9FE870] px-2.5 py-1 rounded-full">
              <Text className="text-[10px] font-black uppercase tracking-wider text-[#0E0F0C]">
                {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% Tracked` : 'No Limits'}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-baseline mb-2">
            <Text className="text-2xl font-black text-[#0E0F0C] dark:text-[#F4F6F2] tracking-tight">
              {formatCurrency(totalSpent, currencySymbol)}
            </Text>
            <Text className="text-xs font-bold text-[#5B5F5A] dark:text-[#A3A8A0]">
              of {formatCurrency(totalBudget, currencySymbol)} limit
            </Text>
          </View>

          <ProgressBar spent={totalSpent} total={totalBudget} />

          <View className="flex-row justify-between mt-3 pt-2.5 border-t border-[#E8EBE6] dark:border-[#2B3028]">
            <Text className="text-xs font-bold text-[#5B5F5A] dark:text-[#A3A8A0]">
              Remaining to spend
            </Text>
            <Text
              className={`text-xs font-black ${
                remaining >= 0 ? 'text-[#054D28] dark:text-[#4ADE80]' : 'text-[#A7000D] dark:text-[#F87171]'
              }`}
            >
              {remaining >= 0
                ? formatCurrency(remaining, currencySymbol)
                : `Exceeded by ${formatCurrency(Math.abs(remaining), currencySymbol)}`}
            </Text>
          </View>
        </View>

        {/* Categories Budget List */}
        <View className="px-4">
          <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2] mb-2 px-1">
            Category Budgets
          </Text>

          {budgets.length === 0 ? (
            <EmptyState
              icon="Target"
              title="No budgets configured"
              subtitle="Set category limits to curb spending and build healthy financial habits."
              actionLabel="Set First Budget"
              onAction={() => router.push('/budget/add')}
            />
          ) : (
            <View className="gap-3">
              {budgets.map((b) => {
                const isOverBudget = b.spent_amount > b.amount;
                const catRemaining = b.amount - b.spent_amount;

                return (
                  <View
                    key={b.id}
                    className="bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View
                          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                          style={{ backgroundColor: `${b.category_color}18` }}
                        >
                          <DynamicIcon name={b.category_icon} size={18} color={b.category_color} />
                        </View>
                        <View>
                          <Text className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">
                            {b.category_name}
                          </Text>
                          <Text className="text-xs font-medium text-[#5B5F5A] dark:text-[#A3A8A0]">
                            {formatCurrency(b.spent_amount, currencySymbol)} of{' '}
                            {formatCurrency(b.amount, currencySymbol)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleDeleteBudget(b)}
                        className="p-2 rounded-xl bg-[#F4F6F2] dark:bg-[#242921]"
                      >
                        <Trash2 size={16} color="#868685" />
                      </TouchableOpacity>
                    </View>

                    <ProgressBar spent={b.spent_amount} total={b.amount} />

                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-xs font-bold text-[#5B5F5A] dark:text-[#A3A8A0]">
                        {b.amount > 0
                          ? `${Math.round((b.spent_amount / b.amount) * 100)}% used`
                          : '0%'}
                      </Text>
                      <Text
                        className={`text-xs font-black ${
                          isOverBudget
                            ? 'text-[#A7000D] dark:text-[#F87171]'
                            : 'text-[#054D28] dark:text-[#4ADE80]'
                        }`}
                      >
                        {isOverBudget
                          ? `Over by ${formatCurrency(Math.abs(catRemaining), currencySymbol)}`
                          : `${formatCurrency(catRemaining, currencySymbol)} left`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB Add Budget - Wise Vivid Lime */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/budget/add')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#9FE870] rounded-full items-center justify-center border border-[#86D454] shadow-md shadow-neutral-900/10 active:bg-[#86D454]"
      >
        <Plus size={26} color="#0E0F0C" strokeWidth={2.8} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
