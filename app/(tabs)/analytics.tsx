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
import { ChevronLeft, ChevronRight, PieChart as PieIcon, TrendingUp } from 'lucide-react-native';
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
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      {/* Month Selector Bar */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={handlePrevMonth}
          className="p-1.5 rounded-full bg-gray-50 active:bg-gray-100"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">
          {formatMonthYear(currentDate)}
        </Text>
        <TouchableOpacity
          onPress={handleNextMonth}
          className="p-1.5 rounded-full bg-gray-50 active:bg-gray-100"
        >
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Expense / Income Toggle */}
      <View className="flex-row p-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab('expense')}
          className={`flex-1 py-2.5 rounded-xl items-center mr-2 ${
            activeTab === 'expense' ? 'bg-red-700' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'expense' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Expenses Distribution
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('income')}
          className={`flex-1 py-2.5 rounded-xl items-center ml-2 ${
            activeTab === 'income' ? 'bg-emerald-700' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'income' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Income Distribution
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Total Overview Card */}
        <View className="m-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Total {activeTab === 'expense' ? 'Expenses' : 'Income'} for Period
          </Text>
          <Text
            className={`text-3xl font-extrabold ${
              activeTab === 'expense' ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {formatCurrency(totalAmount, currencySymbol)}
          </Text>

          {summaries.length > 0 && (
            <View className="mt-4 pt-3 border-t border-gray-100 flex-row items-center">
              <TrendingUp size={16} color="#047857" className="mr-2" />
              <Text className="text-xs text-gray-600 flex-1 ml-1.5">
                Top category:{' '}
                <Text className="font-bold text-gray-900">
                  {summaries[0].category_name} ({summaries[0].percentage}%)
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Visual Proportional Segmented Bar */}
        {summaries.length > 0 && (
          <View className="mx-4 mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              Spending Breakdown
            </Text>
            <View className="w-full h-4 rounded-full overflow-hidden flex-row bg-gray-100">
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
          <Text className="text-sm font-bold text-gray-800 mb-2">Category Breakdown</Text>

          {summaries.length === 0 ? (
            <EmptyState
              icon="BarChart3"
              title="No data for this period"
              subtitle={`Log some ${activeTab}s in ${formatMonthYear(
                currentDate
              )} to view your visual breakdown.`}
            />
          ) : (
            <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {summaries.map((cat) => (
                <View
                  key={cat.category_id}
                  className="p-3.5 border-b border-gray-100"
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-2.5"
                        style={{ backgroundColor: `${cat.category_color}18` }}
                      >
                        <DynamicIcon name={cat.category_icon} size={16} color={cat.category_color} />
                      </View>
                      <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                        {cat.category_name}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-sm font-bold text-gray-900">
                        {formatCurrency(cat.total_amount, currencySymbol)}
                      </Text>
                      <Text className="text-xs text-gray-400 font-medium">{cat.percentage}%</Text>
                    </View>
                  </View>

                  {/* Horizontal indicator bar per category */}
                  <View className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
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
