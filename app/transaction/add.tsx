import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check, Pencil } from 'lucide-react-native';
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
  const [showAmountModal, setShowAmountModal] = useState<boolean>(false);

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
    type === 'income'
      ? 'text-[#054D28] dark:text-[#4ADE80]'
      : type === 'transfer'
      ? 'text-[#1D4ED8] dark:text-[#60A5FA]'
      : 'text-[#A7000D] dark:text-[#F87171]';

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      {/* Header bar - Wise Style */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-[#1B1E19] border-b border-[#D5D8CF] dark:border-[#2B3028]">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full bg-[#F4F6F2] dark:bg-[#242921]"
        >
          <X size={18} color="#0E0F0C" />
        </TouchableOpacity>
        <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
          Add Transaction
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          className="bg-[#9FE870] px-3.5 py-1.5 rounded-full border border-[#86D454] flex-row items-center"
        >
          <Check size={16} color="#0E0F0C" strokeWidth={3} />
          <Text className="text-[#0E0F0C] text-xs font-black ml-1 uppercase">Save</Text>
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

        {/* Big Amount Display - Wise Flat Card (Tap to open Numpad modal) */}
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

        {/* Category Grid (Expense / Income only) */}
        {type !== 'transfer' && (
          <View className="px-4 mt-3">
            <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
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
        <View className="px-4 mt-3">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1.5">
            Note / Description
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add an optional note (e.g., Grocery store)"
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
                Enter Amount
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
            <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
