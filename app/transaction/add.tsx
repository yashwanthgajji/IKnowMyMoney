import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check, Calendar, ArrowRightLeft } from 'lucide-react-native';
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

export default function AddTransactionScreen() {
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

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
  const [showKeypad, setShowKeypad] = useState<boolean>(true);

  useEffect(() => {
    async function loadFormOptions() {
      const allAccounts = await AccountRepository.getAllWithBalances();
      setAccounts(allAccounts);
      if (allAccounts.length > 0) {
        setSelectedAccountId(allAccounts[0].id);
        if (allAccounts.length > 1) {
          setSelectedToAccountId(allAccounts[1].id);
        }
      }

      const cats = await CategoryRepository.getByType(type === 'income' ? 'income' : 'expense');
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategoryId(cats[0].id);
      } else {
        setSelectedCategoryId(null);
      }
    }
    loadFormOptions();
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
      // Limit to 2 decimal places
      const parts = amountStr.split('.');
      if (parts.length === 2 && parts[1].length >= 2) return;
      setAmountStr(amountStr + key);
    }
  };

  const handleDelete = () => {
    if (amountStr.length <= 1) {
      setAmountStr('0');
    } else {
      setAmountStr(amountStr.slice(0, -1));
    }
  };

  const handleSave = async () => {
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
      const newTxnId = await TransactionRepository.create({
        amount: amountInCents,
        type,
        category_id: type === 'transfer' ? null : selectedCategoryId,
        account_id: selectedAccountId,
        to_account_id: type === 'transfer' ? selectedToAccountId : null,
        date,
        note: note.trim(),
        recurring_id: null,
      });

      if (selectedTagIds.length > 0) {
        await TagRepository.setTransactionTags(newTxnId, selectedTagIds);
      }

      router.back();
    } catch (e) {
      console.error('Failed to create transaction', e);
      Alert.alert('Error', 'Failed to save transaction.');
    }
  };

  const amountColor =
    type === 'income' ? 'text-emerald-700' : type === 'transfer' ? 'text-blue-700' : 'text-red-700';

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-white">
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
        >
          <X size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">Add Transaction</Text>
        <TouchableOpacity
          onPress={handleSave}
          className="w-10 h-10 items-center justify-center rounded-full bg-emerald-700"
        >
          <Check size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Toggle Expense / Income / Transfer */}
        <View className="p-4">
          <TypeToggleTabs selectedType={type} onSelectType={setType} />
        </View>

        {/* Big Amount Display */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowKeypad(true)}
          className="items-center justify-center py-4 px-6 bg-gray-50 mx-4 rounded-2xl border border-gray-100"
        >
          <Text className="text-xs uppercase text-gray-400 font-semibold mb-1">Amount</Text>
          <Text className={`text-4xl font-extrabold ${amountColor}`}>
            {currencySymbol} {amountStr}
          </Text>
        </TouchableOpacity>

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
                    isSelected
                      ? 'bg-emerald-700 border-emerald-700'
                      : 'bg-white border-gray-200'
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

        {/* Category Grid (Expense / Income only) */}
        {type !== 'transfer' && (
          <View className="px-4 mt-4">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Select Category
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

        {/* Optional Note Field (Multi-line) */}
        <View className="px-4 mt-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Note / Description
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add an optional note (e.g., Grocery store)"
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

        {/* Keypad */}
        {showKeypad && (
          <View className="mt-4 pb-4 bg-white border-t border-gray-100 pt-2">
            <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
