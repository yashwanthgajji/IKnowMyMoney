import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { BudgetRepository } from '../../src/repositories/budget.repository';
import { CategoryRepository } from '../../src/repositories/category.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { Category, BudgetPeriod } from '../../src/types';
import { parseAmountToCents } from '../../src/utils/money';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';

export default function AddBudgetScreen() {
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [amountStr, setAmountStr] = useState<string>('200.00');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');

  useEffect(() => {
    async function load() {
      const expenseCats = await CategoryRepository.getByType('expense');
      setCategories(expenseCats);
      if (expenseCats.length > 0) {
        setSelectedCategoryId(expenseCats[0].id);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!selectedCategoryId) {
      Alert.alert('Category Required', 'Please select a category for this budget.');
      return;
    }

    const amountInCents = parseAmountToCents(amountStr);
    if (amountInCents <= 0) {
      Alert.alert('Invalid Limit', 'Budget limit must be greater than 0.');
      return;
    }

    try {
      await BudgetRepository.create({
        category_id: selectedCategoryId,
        amount: amountInCents,
        period,
        start_date: Date.now(),
      });

      router.back();
    } catch (e: any) {
      console.error('Failed to save budget', e);
      if (e?.message?.includes('UNIQUE')) {
        Alert.alert('Budget Exists', 'A budget limit already exists for this category.');
      } else {
        Alert.alert('Error', 'Failed to save budget.');
      }
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Budget Limit Amount */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1.5">
            Spending Limit ({currencySymbol})
          </Text>
          <TextInput
            value={amountStr}
            onChangeText={setAmountStr}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#868685"
            className="bg-[#F4F6F2] dark:bg-[#242921] rounded-xl px-4 py-3 border border-[#D5D8CF] dark:border-[#2B3028] text-base font-black text-[#0E0F0C] dark:text-[#F4F6F2]"
          />
        </View>

        {/* Period Selector */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
            Budget Period
          </Text>
          <View className="flex-row bg-[#F4F6F2] dark:bg-[#242921] p-1 rounded-xl">
            {(['monthly', 'yearly'] as const).map((p) => {
              const isSelected = period === p;
              return (
                <TouchableOpacity
                  key={p}
                  activeOpacity={0.7}
                  onPress={() => setPeriod(p)}
                  className={`flex-1 py-2.5 rounded-lg items-center capitalize ${
                    isSelected ? 'bg-[#9FE870]' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      isSelected
                        ? 'text-[#0E0F0C] font-black'
                        : 'text-[#5B5F5A] dark:text-[#A3A8A0] font-bold'
                    }`}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category Selector */}
        <View className="mb-6 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
            Select Category
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  className={`flex-row items-center px-3.5 py-2.5 rounded-full border ${
                    isSelected
                      ? 'bg-[#9FE870] border-[#9FE870]'
                      : 'bg-[#F4F6F2] dark:bg-[#242921] border-[#D5D8CF] dark:border-[#2B3028]'
                  }`}
                >
                  <DynamicIcon
                    name={cat.icon}
                    size={16}
                    color={isSelected ? '#0E0F0C' : cat.color}
                  />
                  <Text
                    className={`text-xs ml-1.5 ${
                      isSelected
                        ? 'text-[#0E0F0C] font-black'
                        : 'text-[#0E0F0C] dark:text-[#F4F6F2] font-bold'
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          className="w-full py-4 bg-[#9FE870] rounded-full items-center justify-center flex-row border border-[#86D454] mb-8"
        >
          <Check size={18} color="#0E0F0C" strokeWidth={3} className="mr-2" />
          <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">Set Budget</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
