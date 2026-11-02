import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, Check, ArrowRightLeft } from 'lucide-react-native';
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
import { parseAmountToCents, centsToInputValue } from '../../src/utils/money';

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
  const [showKeypad, setShowKeypad] = useState<boolean>(false);

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
        console.error('Failed to load transaction', e);
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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
      Alert.alert('Account Required', 'Please select an account for this transaction.');
      return;
    }

    if (type !== 'transfer' && !selectedCategoryId) {
      Alert.alert('Category Required', 'Please select a category for this transaction.');
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
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  const amountColor =
    type === 'income' ? 'text-emerald-700' : type === 'transfer' ? 'text-blue-700' : 'text-red-700';

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Toggle Type */}
        <View className="p-4">
          <TypeToggleTabs selectedType={type} onSelectType={setType} />
        </View>

        {/* Amount Display */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowKeypad(!showKeypad)}
          className="items-center justify-center py-4 px-6 bg-gray-50 mx-4 rounded-2xl border border-gray-100"
        >
          <Text className="text-xs uppercase text-gray-400 font-semibold mb-1">
            Amount (Tap to edit)
          </Text>
          <Text className={`text-4xl font-extrabold ${amountColor}`}>
            {currencySymbol} {amountStr}
          </Text>
        </TouchableOpacity>

        {/* Keypad toggleable */}
        {showKeypad && (
          <View className="mt-3 bg-white border-b border-gray-100 pb-2">
            <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDeleteKeyPress} />
          </View>
        )}

        {/* Account Selector */}
        <View className="px-4 mt-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {type === 'transfer' ? 'Transfer From Account' : 'Account'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {accounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => setSelectedAccountId(acc.id)}
                  className={`mr-2 px-3.5 py-2 rounded-xl flex-row items-center border ${
                    isSelected ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-white' : 'text-gray-700'
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
          <View className="px-4 mt-4">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Transfer To Account
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {accounts.map((acc) => {
                const isSelected = selectedToAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setSelectedToAccountId(acc.id)}
                    className={`mr-2 px-3.5 py-2 rounded-xl flex-row items-center border ${
                      isSelected ? 'bg-blue-700 border-blue-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-white' : 'text-gray-700'
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
          <View className="px-4 mt-4">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
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
        <View className="px-4 mt-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Note / Description
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top' }}
            blurOnSubmit={false}
            className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-sm text-gray-800"
          />
        </View>

        {/* Tag Picker */}
        <TagPicker
          selectedTagIds={selectedTagIds}
          onTagsChange={setSelectedTagIds}
        />

        {/* Action Buttons */}
        <View className="p-4 mt-6 gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            className="w-full py-3.5 bg-emerald-700 rounded-xl items-center justify-center flex-row shadow-sm"
          >
            <Check size={18} color="#FFFFFF" className="mr-2" />
            <Text className="text-white text-sm font-bold">Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDelete}
            className="w-full py-3.5 bg-red-50 border border-red-200 rounded-xl items-center justify-center flex-row"
          >
            <Trash2 size={18} color="#B91C1C" className="mr-2" />
            <Text className="text-red-700 text-sm font-bold">Delete Transaction</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
