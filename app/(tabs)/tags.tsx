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
import {
  Plus,
  Edit2,
  AlertTriangle,
} from 'lucide-react-native';
import { TagRepository } from '../../src/repositories/tag.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { TagWithStats, TransactionWithDetails } from '../../src/types';
import { formatCurrency } from '../../src/utils/money';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { TagSummaryCard } from '../../src/components/ui/TagSummaryCard';
import { TransactionListItem } from '../../src/components/ui/TransactionListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function TagsScreen() {
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);
  const decimalPlaces = useSettingsStore((s) => s.decimalPlaces);

  const [tags, setTags] = useState<TagWithStats[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [tagTransactions, setTagTransactions] = useState<TransactionWithDetails[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const stats = await TagRepository.getWithStats();
      setTags(stats);

      if (selectedTagId !== null) {
        const exists = stats.find((t) => t.id === selectedTagId);
        if (exists) {
          const txns = await TagRepository.getTransactionsByTag(selectedTagId);
          setTagTransactions(txns);
        } else {
          setSelectedTagId(null);
          setTagTransactions([]);
        }
      }
    } catch (e) {
      console.error('Failed to load tags data', e);
    }
  }, [selectedTagId]);

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

  const handleSelectTag = async (tagId: number | null) => {
    setSelectedTagId(tagId);
    if (tagId !== null) {
      try {
        const txns = await TagRepository.getTransactionsByTag(tagId);
        setTagTransactions(txns);
      } catch (e) {
        console.error('Failed to load transactions for tag', e);
      }
    } else {
      setTagTransactions([]);
    }
  };

  const selectedTag = tags.find((t) => t.id === selectedTagId);
  const totalTaggedSpend = tags.reduce((acc, t) => acc + t.total_amount, 0);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      {/* Top Bar: Action button + Horizontal Chips - Wise Style */}
      <View className="mx-4 mt-3 bg-white dark:bg-[#1B1E19] p-3 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
        <View className="flex-row items-center justify-between mb-2 px-1">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest">
            {tags.length} {tags.length === 1 ? 'Tag' : 'Tags'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/tag/add' as any)}
            className="flex-row items-center bg-[#9FE870] px-3 py-1.5 rounded-full border border-[#86D454]"
          >
            <Plus size={14} color="#0E0F0C" strokeWidth={3} />
            <Text className="text-[#0E0F0C] text-xs font-black ml-1 uppercase tracking-wider">
              New Tag
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Tag Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row pt-1"
        >
          {/* "All" chip */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleSelectTag(null)}
            className={`mr-2 px-3.5 py-1.5 rounded-full border ${
              selectedTagId === null
                ? 'bg-[#9FE870] border-[#9FE870]'
                : 'bg-[#F4F6F2] dark:bg-[#242921] border-[#D5D8CF] dark:border-[#2B3028]'
            }`}
          >
            <Text
              className={`text-xs ${
                selectedTagId === null
                  ? 'text-[#0E0F0C] font-black'
                  : 'text-[#5B5F5A] dark:text-[#A3A8A0] font-bold'
              }`}
            >
              All Tags
            </Text>
          </TouchableOpacity>

          {/* Individual Tag chips */}
          {tags.map((tag) => {
            const isSelected = selectedTagId === tag.id;
            return (
              <TouchableOpacity
                key={tag.id}
                activeOpacity={0.7}
                onPress={() => handleSelectTag(tag.id)}
                style={{
                  backgroundColor: isSelected ? tag.color : `${tag.color}15`,
                  borderColor: isSelected ? tag.color : `${tag.color}40`,
                }}
                className="mr-2 px-3.5 py-1.5 rounded-full border flex-row items-center"
              >
                <View
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : tag.color }}
                  className="w-2 h-2 rounded-full mr-1.5"
                />
                <Text
                  style={{ color: isSelected ? '#FFFFFF' : tag.color }}
                  className="text-xs font-black"
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
        {/* VIEW 1: Specific Tag Selected */}
        {selectedTag && (
          <View className="p-4">
            {/* Tag Header Detail Card - Wise Flat Card */}
            <View className="bg-white dark:bg-[#1B1E19] rounded-2xl p-4 mb-4 border border-[#D5D8CF] dark:border-[#2B3028]">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    style={{ backgroundColor: `${selectedTag.color}20` }}
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  >
                    <View
                      style={{ backgroundColor: selectedTag.color }}
                      className="w-4 h-4 rounded-full"
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-black text-[#0E0F0C] dark:text-[#F4F6F2]"
                      numberOfLines={1}
                    >
                      {selectedTag.name}
                    </Text>
                    <Text className="text-xs font-medium text-[#5B5F5A] dark:text-[#A3A8A0]">
                      {tagTransactions.length} {tagTransactions.length === 1 ? 'transaction' : 'transactions'}
                    </Text>
                  </View>
                </View>

                {/* Edit Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push(`/tag/add?id=${selectedTag.id}` as any)}
                  className="p-2 rounded-xl bg-[#F4F6F2] dark:bg-[#242921]"
                >
                  <Edit2 size={16} color="#0E0F0C" />
                </TouchableOpacity>
              </View>

              {/* Optional Budget Progress Bar */}
              {selectedTag.budget_amount && selectedTag.budget_amount > 0 ? (
                <View className="mt-2 pt-3 border-t border-[#E8EBE6] dark:border-[#2B3028]">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-wider">
                      Budget Tracker
                    </Text>
                    <Text className="text-xs font-black text-[#0E0F0C] dark:text-[#F4F6F2]">
                      {selectedTag.budget_progress ?? 0}%
                    </Text>
                  </View>
                  <ProgressBar
                    spent={selectedTag.total_amount}
                    total={selectedTag.budget_amount}
                  />
                  <View className="flex-row items-center justify-between mt-2">
                    <View>
                      <Text className="text-[10px] font-bold text-[#868685]">Total Spent</Text>
                      <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2]">
                        {formatCurrency(selectedTag.total_amount, currencySymbol, decimalPlaces)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[10px] font-bold text-[#868685]">Budget Limit</Text>
                      <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2]">
                        {formatCurrency(selectedTag.budget_amount, currencySymbol, decimalPlaces)}
                      </Text>
                    </View>
                  </View>
                  {selectedTag.budget_amount - selectedTag.total_amount < 0 ? (
                    <View className="flex-row items-center mt-2.5 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200/50">
                      <AlertTriangle size={14} color="#A7000D" />
                      <Text className="text-xs text-[#A7000D] dark:text-[#F87171] font-bold ml-1.5">
                        Over budget by{' '}
                        {formatCurrency(
                          selectedTag.total_amount - selectedTag.budget_amount,
                          currencySymbol,
                          decimalPlaces
                        )}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-xs text-[#054D28] dark:text-[#4ADE80] font-black mt-2">
                      {formatCurrency(
                        selectedTag.budget_amount - selectedTag.total_amount,
                        currencySymbol,
                        decimalPlaces
                      )}{' '}
                      remaining
                    </Text>
                  )}
                </View>
              ) : (
                <View className="mt-1 pt-2.5 border-t border-[#E8EBE6] dark:border-[#2B3028] flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-[#5B5F5A] dark:text-[#A3A8A0]">Total Spent</Text>
                  <Text className="text-base font-black text-[#0E0F0C] dark:text-[#F4F6F2]">
                    {formatCurrency(selectedTag.total_amount, currencySymbol, decimalPlaces)}
                  </Text>
                </View>
              )}
            </View>

            {/* Transactions Header */}
            <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2] mb-2 px-1">
              Transactions ({tagTransactions.length})
            </Text>

            {/* List of Transactions */}
            <View className="bg-white dark:bg-[#1B1E19] rounded-2xl overflow-hidden border border-[#D5D8CF] dark:border-[#2B3028]">
              {tagTransactions.map((t) => (
                <TransactionListItem
                  key={t.id}
                  transaction={t}
                  currencySymbol={currencySymbol}
                  onPress={() => router.push(`/transaction/${t.id}`)}
                />
              ))}

              {tagTransactions.length === 0 && (
                <View className="py-8 items-center">
                  <Text className="text-xs text-[#868685] font-bold">No transactions with this tag yet</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* VIEW 2: "All" Tags Overview */}
        {selectedTagId === null && (
          <View className="p-4">
            {/* Top Overview Banner - Wise Flat Card */}
            <View className="bg-white dark:bg-[#1B1E19] rounded-2xl p-5 mb-4 border border-[#D5D8CF] dark:border-[#2B3028]">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest">
                  Total Tagged Spending
                </Text>
                <View className="bg-[#9FE870] px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-black uppercase tracking-wider text-[#0E0F0C]">
                    {tags.length} Active
                  </Text>
                </View>
              </View>
              <Text className="text-3xl font-black text-[#0E0F0C] dark:text-[#F4F6F2] tracking-tight mt-0.5">
                {formatCurrency(totalTaggedSpend, currencySymbol, decimalPlaces)}
              </Text>
              <Text className="text-xs font-medium text-[#5B5F5A] dark:text-[#A3A8A0] mt-1">
                Aggregated cross-category tagged expenditure
              </Text>
            </View>

            {/* List of Tag Summary Cards */}
            {tags.map((tag) => (
              <TagSummaryCard
                key={tag.id}
                tag={tag}
                onPress={() => handleSelectTag(tag.id)}
                onLongPress={() => router.push(`/tag/add?id=${tag.id}` as any)}
              />
            ))}

            {tags.length === 0 && (
              <EmptyState
                icon="Tag"
                title="No Tags Created Yet"
                subtitle="Tags help you group transactions across trips, stores, or family members."
                actionLabel="+ Create First Tag"
                onAction={() => router.push('/tag/add' as any)}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
