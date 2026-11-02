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
import { Plus, Trash2, Target, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react-native';
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
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      {/* Month Selector Bar */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePrevMonth}
          className="p-1.5 rounded-full bg-gray-50 active:bg-gray-100"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">
          {formatMonthYear(currentDate)}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNextMonth}
          className="p-1.5 rounded-full bg-gray-50 active:bg-gray-100"
        >
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Monthly Budget Summary Card */}
        <View className="m-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {formatMonthYear(currentDate)} Budget
            </Text>
            <Target size={18} color="#047857" />
          </View>

          <View className="flex-row justify-between items-baseline mb-2">
            <Text className="text-2xl font-extrabold text-gray-900">
              {formatCurrency(totalSpent, currencySymbol)}
            </Text>
            <Text className="text-xs text-gray-400 font-medium">
              of {formatCurrency(totalBudget, currencySymbol)} limit
            </Text>
          </View>

          <ProgressBar spent={totalSpent} total={totalBudget} />

          <View className="flex-row justify-between mt-3 pt-2 border-t border-gray-100">
            <Text className="text-xs text-gray-500 font-medium">Remaining to spend</Text>
            <Text
              className={`text-xs font-bold ${
                remaining >= 0 ? 'text-emerald-700' : 'text-red-700'
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
          <Text className="text-sm font-bold text-gray-800 mb-2">Category Budgets</Text>

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
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: `${b.category_color}15` }}
                        >
                          <DynamicIcon name={b.category_icon} size={20} color={b.category_color} />
                        </View>
                        <View>
                          <Text className="text-sm font-bold text-gray-900">{b.category_name}</Text>
                          <Text className="text-xs text-gray-400">
                            {formatCurrency(b.spent_amount, currencySymbol)} of{' '}
                            {formatCurrency(b.amount, currencySymbol)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleDeleteBudget(b)}
                        className="p-2 rounded-lg bg-gray-50"
                      >
                        <Trash2 size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    <ProgressBar spent={b.spent_amount} total={b.amount} />

                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-xs text-gray-400">
                        {b.amount > 0
                          ? `${Math.round((b.spent_amount / b.amount) * 100)}% used`
                          : '0%'}
                      </Text>
                      <Text
                        className={`text-xs font-semibold ${
                          isOverBudget ? 'text-red-700 font-bold' : 'text-gray-500'
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

      {/* FAB Add Budget */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/budget/add')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-700 rounded-full items-center justify-center shadow-lg shadow-emerald-900/30 elevation-8"
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
