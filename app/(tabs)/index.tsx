import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { AccountRepository } from '../../src/repositories/account.repository';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { TransactionWithDetails } from '../../src/types';
import { HeroBalanceCard, IncomeExpenseSummary } from '../../src/components/ui/SummaryCard';
import { TransactionListItem } from '../../src/components/ui/TransactionListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { getMonthBounds, formatMonthYear, subMonths, addMonths } from '../../src/utils/dates';

export default function HomeScreen() {
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      // 1. Calculate net worth / total balance across accounts
      const netWorthData = await AccountRepository.getNetWorth();
      setTotalBalance(netWorthData.netWorth);

      // 2. Calculate monthly income and expense for selected month
      const { start, end } = getMonthBounds(currentDate);
      const totals = await TransactionRepository.getTotalsForPeriod(start, end);
      setMonthlyIncome(totals.income);
      setMonthlyExpense(totals.expense);

      // 3. Fetch recent transactions
      const recent = await TransactionRepository.getByDateRange(start, end);
      setRecentTransactions(recent);
    } catch (e) {
      console.error('Error loading dashboard data', e);
    }
  }, [currentDate]);

  // Reload data whenever screen comes into focus or date changes
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
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
        {/* Month Selector Bar - Wise Pill Style */}
        <View className="mx-4 mt-3 bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] px-3.5 py-2.5 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handlePrevMonth}
            className="p-1.5 rounded-full bg-[#F4F6F2] dark:bg-[#242921] active:opacity-70"
          >
            <ChevronLeft size={18} color="#0E0F0C" />
          </TouchableOpacity>
          <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
            {formatMonthYear(currentDate)}
          </Text>
          <TouchableOpacity
            onPress={handleNextMonth}
            className="p-1.5 rounded-full bg-[#F4F6F2] dark:bg-[#242921] active:opacity-70"
          >
            <ChevronRight size={18} color="#0E0F0C" />
          </TouchableOpacity>
        </View>

        {/* Financial Summary Cards */}
        <View className="px-4 pt-3">
          <HeroBalanceCard balance={totalBalance} currencySymbol={currencySymbol} />
          <IncomeExpenseSummary
            income={monthlyIncome}
            expense={monthlyExpense}
            currencySymbol={currencySymbol}
          />
        </View>

        {/* Recent Activity Header */}
        <View className="flex-row items-center justify-between px-5 pt-6 pb-2.5">
          <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
            Recent Activity
          </Text>
          {recentTransactions.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/transactions')}
              className="bg-white dark:bg-[#1B1E19] border border-[#D5D8CF] dark:border-[#2B3028] px-3 py-1 rounded-full"
            >
              <Text className="text-[11px] font-black uppercase tracking-wider text-[#0E0F0C] dark:text-[#F4F6F2]">
                View All ›
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transactions Feed */}
        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="Receipt"
            title="No transactions yet"
            subtitle={`You haven't recorded any spending or income for ${formatMonthYear(
              currentDate
            )}.`}
            actionLabel="Add Transaction"
            onAction={() => router.push('/transaction/add')}
          />
        ) : (
          <View className="bg-white dark:bg-[#1B1E19] mx-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
            {recentTransactions.slice(0, 10).map((txn) => (
              <TransactionListItem
                key={txn.id}
                transaction={txn}
                currencySymbol={currencySymbol}
                onPress={() => router.push(`/transaction/${txn.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) - Wise Vivid Lime */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/transaction/add')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#9FE870] rounded-full items-center justify-center border border-[#86D454] shadow-md shadow-neutral-900/10 active:bg-[#86D454]"
      >
        <Plus size={26} color="#0E0F0C" strokeWidth={2.8} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
