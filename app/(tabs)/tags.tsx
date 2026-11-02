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
import {
  Plus,
  Tags as TagsIcon,
  Edit2,
  Calendar,
  AlertTriangle,
  ArrowRight,
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
        // Verify selected tag still exists
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
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-gray-50">
      {/* Top Bar: Action button + Horizontal Chips */}
      <View className="bg-white border-b border-gray-100 pb-3 pt-2">
        <View className="flex-row items-center justify-between px-4 mb-2.5">
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {tags.length} {tags.length === 1 ? 'Tag' : 'Tags'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/tag/add' as any)}
            className="flex-row items-center bg-emerald-700 px-3 py-1.5 rounded-full"
          >
            <Plus size={14} color="#FFFFFF" />
            <Text className="text-white text-xs font-bold ml-1">New Tag</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Tag Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 flex-row"
        >
          {/* "All" chip */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleSelectTag(null)}
            className={`mr-2 px-3.5 py-1.5 rounded-full border ${
              selectedTagId === null
                ? 'bg-emerald-700 border-emerald-700'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                selectedTagId === null ? 'text-white' : 'text-gray-700'
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
                  className="text-xs font-bold"
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* VIEW 1: Specific Tag Selected */}
        {selectedTag && (
          <View className="p-4">
            {/* Tag Header Detail Card */}
            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    style={{ backgroundColor: `${selectedTag.color}25` }}
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  >
                    <View
                      style={{ backgroundColor: selectedTag.color }}
                      className="w-4 h-4 rounded-full"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-extrabold text-gray-900" numberOfLines={1}>
                      {selectedTag.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {tagTransactions.length} {tagTransactions.length === 1 ? 'transaction' : 'transactions'}
                    </Text>
                  </View>
                </View>

                {/* Edit Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push(`/tag/add?id=${selectedTag.id}` as any)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <Edit2 size={16} color="#4B5563" />
                </TouchableOpacity>
              </View>

              {/* Optional Budget Progress Bar */}
              {selectedTag.budget_amount && selectedTag.budget_amount > 0 ? (
                <View className="mt-2 pt-3 border-t border-gray-100">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-xs font-semibold text-gray-500">Budget Tracker</Text>
                    <Text className="text-xs font-bold text-gray-700">
                      {selectedTag.budget_progress ?? 0}%
                    </Text>
                  </View>
                  <ProgressBar
                    spent={selectedTag.total_amount}
                    total={selectedTag.budget_amount}
                  />
                  <View className="flex-row items-center justify-between mt-2">
                    <View>
                      <Text className="text-[10px] text-gray-400">Total Spent</Text>
                      <Text className="text-sm font-extrabold text-gray-900">
                        {formatCurrency(selectedTag.total_amount, currencySymbol, decimalPlaces)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[10px] text-gray-400">Budget Limit</Text>
                      <Text className="text-sm font-extrabold text-gray-900">
                        {formatCurrency(selectedTag.budget_amount, currencySymbol, decimalPlaces)}
                      </Text>
                    </View>
                  </View>
                  {selectedTag.budget_amount - selectedTag.total_amount < 0 ? (
                    <View className="flex-row items-center mt-2.5 bg-red-50 p-2 rounded-lg">
                      <AlertTriangle size={14} color="#DC2626" />
                      <Text className="text-xs text-red-700 font-semibold ml-1.5">
                        Over budget by{' '}
                        {formatCurrency(
                          selectedTag.total_amount - selectedTag.budget_amount,
                          currencySymbol,
                          decimalPlaces
                        )}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-xs text-emerald-700 font-semibold mt-2">
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
                <View className="mt-1 pt-2 border-t border-gray-50 flex-row items-center justify-between">
                  <Text className="text-xs text-gray-400">Total Spent</Text>
                  <Text className="text-base font-extrabold text-gray-900">
                    {formatCurrency(selectedTag.total_amount, currencySymbol, decimalPlaces)}
                  </Text>
                </View>
              )}
            </View>

            {/* Transactions Header */}
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Transactions ({tagTransactions.length})
            </Text>

            {/* List of Transactions */}
            <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
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
                  <Text className="text-sm text-gray-400">No transactions with this tag yet</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* VIEW 2: "All" Tags Overview */}
        {selectedTagId === null && (
          <View className="p-4">
            {/* Top Overview Banner */}
            <View className="bg-emerald-700 rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                Total Tagged Spending
              </Text>
              <Text className="text-white text-2xl font-extrabold mt-0.5">
                {formatCurrency(totalTaggedSpend, currencySymbol, decimalPlaces)}
              </Text>
              <Text className="text-white/70 text-xs mt-1">
                Across {tags.length} active tags
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
                subtitle="Tags help you group transactions across trips (e.g. LV Trip), stores (Costco), or family members (Me, Wife)."
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
