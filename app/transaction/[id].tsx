import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, Check, Pencil } from 'lucide-react-native';
import { TypeToggleTabs } from '../../src/components/ui/TypeToggleTabs';
import { CategoryGrid } from '../../src/components/ui/CategoryGrid';
import { NumericKeypad } from '../../src/components/ui/NumericKeypad';
import { CategoryRepository } from '../../src/repositories/category.repository';
import { AccountRepository } from '../../src/repositories/account.repository';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { TagRepository } from '../../src/repositories/tag.repository';
import { TagPicker } from '../../src/components/ui/TagPicker';
import { DateTimePickerField } from '../../src/components/ui/DateTimePickerField';
import { useSettingsStore } from '../../src/stores/settings.store';
import { Category, AccountWithBalance, TransactionType } from '../../src/types';
import { parseAmountToCents } from '../../src/utils/money';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedToAccountId, setSelectedToAccountId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<number>(Date.now());
  const [showAmountModal, setShowAmountModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const txnId = parseInt(id, 10);
        const txn = await TransactionRepository.getById(txnId);
        if (!txn) {
          Alert.alert('Not Found', 'Transaction not found.');
          router.back();
          return;
        }

        setType(txn.type);
        setAmountStr((txn.amount / 100).toFixed(2));
        setSelectedCategoryId(txn.category_id);
        setSelectedAccountId(txn.account_id);
        setSelectedToAccountId(txn.to_account_id);
        setSelectedTagIds(txn.tags?.map((t) => t.id) || []);
        setNote(txn.note || '');
        setDate(txn.date);

        const allAccounts = await AccountRepository.getAllWithBalances();
        setAccounts(allAccounts);

        const cats = await CategoryRepository.getByType(txn.type === 'income' ? 'income' : 'expense');
        setCategories(cats);
        setLoading(false);
      } catch (e) {
        console.error('Failed to load transaction for edit', e);
        Alert.alert('Error', 'Failed to load transaction data.');
        router.back();
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    async function refreshCategoriesOnTypeChange() {
      if (loading) return;
      const cats = await CategoryRepository.getByType(type === 'income' ? 'income' : 'expense');
      setCategories(cats);
      if (cats.length > 0 && !cats.some((c) => c.id === selectedCategoryId)) {
        setSelectedCategoryId(cats[0].id);
      }
    }
    refreshCategoriesOnTypeChange();
  }, [type]);

  const handleKeyPress = (key: string) => {
    if (key === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr(amountStr + '.');
      return;
    }

    if (amountStr === '0') {
      setAmountStr(key);
    } else {
      const parts = amountStr.split('.');
      if (parts.length === 2 && parts[1].length >= 2) return;
      setAmountStr(amountStr + key);
    }
  };

  const handleDeleteKeyPress = () => {
    if (amountStr.length <= 1) {
      setAmountStr('0');
    } else {
      setAmountStr(amountStr.slice(0, -1));
    }
  };

  const handleSave = async () => {
    if (!id) return;
    const amountInCents = parseAmountToCents(amountStr);

    if (amountInCents <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a transaction amount greater than 0.');
      return;
    }

    if (!selectedAccountId) {
      Alert.alert('Account Required', 'Please select an account.');
      return;
    }

    if (type !== 'transfer' && !selectedCategoryId) {
      Alert.alert('Category Required', 'Please select a category.');
      return;
    }

    if (type === 'transfer' && selectedAccountId === selectedToAccountId) {
      Alert.alert('Transfer Error', 'Source and destination accounts must be different.');
      return;
    }

    try {
      const txnId = parseInt(id, 10);
      await TransactionRepository.update(txnId, {
        amount: amountInCents,
        type,
        category_id: type === 'transfer' ? null : selectedCategoryId,
        account_id: selectedAccountId,
        to_account_id: type === 'transfer' ? selectedToAccountId : null,
        date,
        note: note.trim(),
      });

      await TagRepository.setTransactionTags(txnId, selectedTagIds);

      router.back();
    } catch (e) {
      console.error('Failed to update transaction', e);
      Alert.alert('Error', 'Failed to update transaction.');
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TransactionRepository.delete(parseInt(id, 10));
              router.back();
            } catch (e) {
              console.error('Failed to delete transaction', e);
              Alert.alert('Error', 'Failed to delete transaction.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#E8EBE6] dark:bg-[#121411]">
        <ActivityIndicator size="large" color="#0E0F0C" />
      </View>
    );
  }

  const amountColor =
    type === 'income'
      ? 'text-[#054D28] dark:text-[#4ADE80]'
      : type === 'transfer'
      ? 'text-[#1D4ED8] dark:text-[#60A5FA]'
      : 'text-[#A7000D] dark:text-[#F87171]';

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Toggle Type */}
        <View className="p-4">
          <TypeToggleTabs selectedType={type} onSelectType={setType} />
        </View>

        {/* Amount Display - Wise Flat Card (Tap to edit) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowAmountModal(true)}
          className="py-5 px-6 bg-white dark:bg-[#1B1E19] mx-4 rounded-2xl border-2 border-[#D5D8CF] dark:border-[#2B3028]"
        >
          <View className="flex-row items-center justify-between w-full mb-1">
            <Text className="text-xs uppercase text-[#5B5F5A] dark:text-[#A3A8A0] font-black tracking-widest">
              Amount
            </Text>
            <View className="flex-row items-center bg-[#F4F6F2] dark:bg-[#242921] px-2 py-0.5 rounded-full border border-[#D5D8CF] dark:border-[#2B3028]">
              <Pencil size={11} color="#5B5F5A" />
              <Text className="text-[10px] font-black text-[#5B5F5A] dark:text-[#A3A8A0] ml-1 uppercase">Tap to edit</Text>
            </View>
          </View>
          <View className="items-center justify-center my-1">
            <Text className={`text-4xl font-black tracking-tight ${amountColor}`}>
              {currencySymbol} {amountStr}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Account Selector */}
        <View className="px-4 mt-3">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
            {type === 'transfer' ? 'Transfer From Account' : 'Account'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {accounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedAccountId(acc.id)}
                  className={`mr-2 px-3.5 py-2 rounded-full flex-row items-center border ${
                    isSelected
                      ? 'bg-[#9FE870] border-[#9FE870]'
                      : 'bg-white dark:bg-[#1B1E19] border-[#D5D8CF] dark:border-[#2B3028]'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      isSelected
                        ? 'text-[#0E0F0C] font-black'
                        : 'text-[#5B5F5A] dark:text-[#A3A8A0] font-bold'
                    }`}
                  >
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Destination Account for Transfers */}
        {type === 'transfer' && (
          <View className="px-4 mt-3">
            <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
              Transfer To Account
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {accounts.map((acc) => {
                const isSelected = selectedToAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedToAccountId(acc.id)}
                    className={`mr-2 px-3.5 py-2 rounded-full flex-row items-center border ${
                      isSelected
                        ? 'bg-[#1D4ED8] border-[#1D4ED8]'
                        : 'bg-white dark:bg-[#1B1E19] border-[#D5D8CF] dark:border-[#2B3028]'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        isSelected
                          ? 'text-white font-black'
                          : 'text-[#5B5F5A] dark:text-[#A3A8A0] font-bold'
                      }`}
                    >
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Category Grid */}
        {type !== 'transfer' && (
          <View className="px-4 mt-3">
            <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
              Category
            </Text>
            <CategoryGrid
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </View>
        )}

        {/* Date and Time Selector */}
        <DateTimePickerField date={date} onChangeDate={setDate} />

        {/* Note input (Multi-line) */}
        <View className="px-4 mt-3">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1.5">
            Note / Description
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
            placeholderTextColor="#868685"
            multiline
            numberOfLines={2}
            style={{ minHeight: 64, textAlignVertical: 'top' }}
            blurOnSubmit={false}
            className="bg-white dark:bg-[#1B1E19] rounded-2xl px-4 py-3 border border-[#D5D8CF] dark:border-[#2B3028] text-xs font-bold text-[#0E0F0C] dark:text-[#F4F6F2]"
          />
        </View>

        {/* Tag Picker */}
        <TagPicker
          selectedTagIds={selectedTagIds}
          onTagsChange={setSelectedTagIds}
        />

        {/* Action Buttons - Wise Style */}
        <View className="p-4 mt-4 gap-2.5">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            className="w-full py-4 bg-[#9FE870] rounded-full items-center justify-center flex-row border border-[#86D454]"
          >
            <Check size={18} color="#0E0F0C" strokeWidth={3} className="mr-2" />
            <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDelete}
            className="w-full py-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-full items-center justify-center flex-row"
          >
            <Trash2 size={16} color="#A7000D" className="mr-2" />
            <Text className="text-[#A7000D] dark:text-[#F87171] text-xs font-black uppercase tracking-wider">Delete Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Amount Keypad Bottom-Sheet Modal */}
      <Modal
        visible={showAmountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAmountModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowAmountModal(false)}
            className="flex-1"
          />
          <View className="bg-white dark:bg-[#1B1E19] rounded-t-3xl border-t border-[#D5D8CF] dark:border-[#2B3028] px-4 pt-4 pb-8">
            {/* Modal Top Bar */}
            <View className="flex-row items-center justify-between pb-3 border-b border-[#E8EBE6] dark:border-[#2B3028] mb-3">
              <TouchableOpacity
                onPress={() => setAmountStr('0')}
                className="px-3 py-1.5 rounded-full bg-[#F4F6F2] dark:bg-[#242921]"
              >
                <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase">Clear</Text>
              </TouchableOpacity>

              <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest">
                Edit Amount
              </Text>

              <TouchableOpacity
                onPress={() => setShowAmountModal(false)}
                className="px-4 py-1.5 rounded-full bg-[#9FE870] border border-[#86D454]"
              >
                <Text className="text-xs font-black text-[#0E0F0C] uppercase">Done</Text>
              </TouchableOpacity>
            </View>

            {/* Live Amount display directly above keypad */}
            <View className="py-4 items-center justify-center bg-[#F4F6F2] dark:bg-[#242921] rounded-2xl mb-3 border border-[#D5D8CF] dark:border-[#2B3028]">
              <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-wider mb-1">
                Amount Preview
              </Text>
              <Text className={`text-4xl font-black tracking-tight ${amountColor}`}>
                {currencySymbol} {amountStr}
              </Text>
            </View>

            {/* Keypad */}
            <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDeleteKeyPress} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
