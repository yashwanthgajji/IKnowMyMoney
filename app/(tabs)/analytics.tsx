import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react-native';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { CategorySpendSummary } from '../../src/types';
import { formatCurrency } from '../../src/utils/money';
import { getMonthBounds, formatMonthYear, subMonths, addMonths } from '../../src/utils/dates';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function AnalyticsScreen() {
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [summaries, setSummaries] = useState<CategorySpendSummary[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      const { start, end } = getMonthBounds(currentDate);
      const data = await TransactionRepository.getCategorySpendSummary(start, end, activeTab);
      setSummaries(data);

      const sum = data.reduce((acc, curr) => acc + curr.total_amount, 0);
      setTotalAmount(sum);
    } catch (e) {
      console.error('Failed to load analytics', e);
    }
  }, [currentDate, activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));

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

      {/* Expense / Income Toggle - Wise Segmented Pills */}
      <View className="mx-4 mt-3 bg-white dark:bg-[#1B1E19] p-1.5 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] flex-row gap-1.5">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('expense')}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === 'expense'
              ? 'bg-[#A7000D]'
              : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-xs ${
              activeTab === 'expense'
                ? 'font-black text-white'
                : 'font-bold text-[#5B5F5A] dark:text-[#A3A8A0]'
            }`}
          >
            Expenses Distribution
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('income')}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === 'income'
              ? 'bg-[#054D28]'
              : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-xs ${
              activeTab === 'income'
                ? 'font-black text-white'
                : 'font-bold text-[#5B5F5A] dark:text-[#A3A8A0]'
            }`}
          >
            Income Distribution
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0E0F0C', '#054D28']}
          />
        }
      >
        {/* Total Overview Card - Wise Flat Card */}
        <View className="m-4 bg-white dark:bg-[#1B1E19] rounded-2xl p-5 border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1">
            Total {activeTab === 'expense' ? 'Expenses' : 'Income'} for Period
          </Text>
          <Text
            className={`text-3xl font-black tracking-tight ${
              activeTab === 'expense'
                ? 'text-[#A7000D] dark:text-[#F87171]'
                : 'text-[#054D28] dark:text-[#4ADE80]'
            }`}
          >
            {formatCurrency(totalAmount, currencySymbol)}
          </Text>

          {summaries.length > 0 && (
            <View className="mt-4 pt-3 border-t border-[#E8EBE6] dark:border-[#2B3028] flex-row items-center">
              <TrendingUp size={16} color="#054D28" className="mr-2" />
              <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] flex-1 ml-1">
                Top category:{' '}
                <Text className="font-black text-[#0E0F0C] dark:text-[#F4F6F2]">
                  {summaries[0].category_name} ({summaries[0].percentage}%)
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Visual Proportional Segmented Bar */}
        {summaries.length > 0 && (
          <View className="mx-4 mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
            <Text className="text-xs font-black text-[#0E0F0C] dark:text-[#F4F6F2] uppercase tracking-wider mb-2.5">
              Spending Breakdown
            </Text>
            <View className="w-full h-3.5 rounded-full overflow-hidden flex-row bg-[#E8EBE6] dark:bg-[#242921]">
              {summaries.map((cat) => (
                <View
                  key={cat.category_id}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.category_color,
                    height: '100%',
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* Category List Breakdown */}
        <View className="px-4">
          <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2] mb-2 px-1">
            Category Breakdown
          </Text>

          {summaries.length === 0 ? (
            <EmptyState
              icon="BarChart3"
              title="No data for this period"
              subtitle={`Log some ${activeTab}s in ${formatMonthYear(
                currentDate
              )} to view your visual breakdown.`}
            />
          ) : (
            <View className="bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
              {summaries.map((cat) => (
                <View
                  key={cat.category_id}
                  className="p-3.5 border-b border-[#E8EBE6] dark:border-[#2B3028]"
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
                        style={{ backgroundColor: `${cat.category_color}18` }}
                      >
                        <DynamicIcon name={cat.category_icon} size={16} color={cat.category_color} />
                      </View>
                      <Text
                        className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]"
                        numberOfLines={1}
                      >
                        {cat.category_name}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2]">
                        {formatCurrency(cat.total_amount, currencySymbol)}
                      </Text>
                      <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-bold">
                        {cat.percentage}%
                      </Text>
                    </View>
                  </View>

                  {/* Horizontal indicator bar per category */}
                  <View className="w-full h-1.5 bg-[#E8EBE6] dark:bg-[#242921] rounded-full overflow-hidden mt-1">
                    <View
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.category_color,
                        height: '100%',
                        borderRadius: 999,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
