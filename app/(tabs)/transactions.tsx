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
import { Search, X, Calendar, Filter } from 'lucide-react-native';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { TransactionWithDetails } from '../../src/types';
import { TransactionListItem } from '../../src/components/ui/TransactionListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { formatCurrency } from '../../src/utils/money';

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
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      {/* Search Input Bar */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by note, category, or account..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-sm text-gray-900"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View className="flex-row mt-3 gap-2">
          {(['all', 'expense', 'income', 'transfer'] as const).map((f) => {
            const isSelected = filterType === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-lg border capitalize ${
                  isSelected
                    ? 'bg-emerald-700 border-emerald-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Mini Summary of current view */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
        <Text className="text-xs text-gray-500 font-medium">
          {transactions.length} records found
        </Text>
        <View className="flex-row gap-3">
          <Text className="text-xs text-emerald-700 font-bold">
            +{formatCurrency(totalIncome, currencySymbol)}
          </Text>
          <Text className="text-xs text-red-700 font-bold">
            -{formatCurrency(totalExpense, currencySymbol)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {transactions.length === 0 ? (
          <EmptyState
            icon="Search"
            title="No records found"
            subtitle="Try adjusting your search terms or filter."
          />
        ) : (
          <View className="bg-white">
            {transactions.map((txn) => (
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
    </SafeAreaView>
  );
}
