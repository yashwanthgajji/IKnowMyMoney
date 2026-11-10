import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { TransactionWithDetails } from '../../src/types';
import { TransactionListItem } from '../../src/components/ui/TransactionListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { formatCurrency } from '../../src/utils/money';
import { groupTransactionsByDate } from '../../src/utils/dates';

export default function TransactionsScreen() {
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);

  const loadTransactions = useCallback(async () => {
    try {
      if (searchQuery.trim().length > 0) {
        const results = await TransactionRepository.search(searchQuery.trim());
        setTransactions(
          filterType === 'all'
            ? results
            : results.filter((t) => t.type === filterType)
        );
      } else {
        const recent = await TransactionRepository.getRecent(100);
        setTransactions(
          filterType === 'all'
            ? recent
            : recent.filter((t) => t.type === filterType)
        );
      }
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
  }, [searchQuery, filterType]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      {/* Search Input & Filter Card */}
      <View className="mx-4 mt-3 bg-white dark:bg-[#1B1E19] p-3 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
        <View className="flex-row items-center bg-[#F4F6F2] dark:bg-[#242921] rounded-xl px-3 py-2 border border-[#D5D8CF] dark:border-[#2B3028]">
          <Search size={16} color="#5B5F5A" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search note, category, or account..."
            placeholderTextColor="#868685"
            className="flex-1 ml-2 text-xs font-semibold text-[#0E0F0C] dark:text-[#F4F6F2]"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#5B5F5A" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips - Wise Style */}
        <View className="flex-row mt-2.5 gap-1.5">
          {(['all', 'expense', 'income', 'transfer'] as const).map((f) => {
            const isSelected = filterType === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.8}
                onPress={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-full border capitalize ${
                  isSelected
                    ? 'bg-[#9FE870] border-[#9FE870]'
                    : 'bg-[#F4F6F2] dark:bg-[#242921] border-[#D5D8CF] dark:border-[#2B3028]'
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected
                      ? 'font-black text-[#0E0F0C]'
                      : 'font-bold text-[#5B5F5A] dark:text-[#A3A8A0]'
                  }`}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Mini Summary Strip */}
      <View className="flex-row justify-between items-center px-5 pt-3 pb-1">
        <Text className="text-xs font-black uppercase tracking-wider text-[#5B5F5A] dark:text-[#A3A8A0]">
          {transactions.length} records
        </Text>
        <View className="flex-row gap-3">
          <Text className="text-xs font-black text-[#054D28] dark:text-[#4ADE80]">
            +{formatCurrency(totalIncome, currencySymbol)}
          </Text>
          <Text className="text-xs font-black text-[#A7000D] dark:text-[#F87171]">
            -{formatCurrency(totalExpense, currencySymbol)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView className="flex-1 pt-1" contentContainerStyle={{ paddingBottom: 60 }}>
        {transactions.length === 0 ? (
          <EmptyState
            icon="Search"
            title="No records found"
            subtitle="Try adjusting your search query or filter."
          />
        ) : (
          <View>
            {groupTransactionsByDate(transactions).map((group) => (
              <View key={group.dateKey} className="mb-3">
                {/* Section Date Header */}
                <View className="flex-row justify-between items-center px-5 py-1.5">
                  <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
                    {group.heading}
                  </Text>
                  {group.totalExpense > 0 && (
                    <Text className="text-xs font-black text-[#A7000D] dark:text-[#F87171]">
                      Spent: {formatCurrency(group.totalExpense, currencySymbol)}
                    </Text>
                  )}
                </View>

                {/* Items in this date group */}
                <View className="mx-4 bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
                  {group.items.map((txn: TransactionWithDetails) => (
                    <TransactionListItem
                      key={txn.id}
                      transaction={txn}
                      currencySymbol={currencySymbol}
                      onPress={() => router.push(`/transaction/${txn.id}`)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
