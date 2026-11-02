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
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Budget Limit Amount */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Spending Limit ({currencySymbol})
          </Text>
          <TextInput
            value={amountStr}
            onChangeText={setAmountStr}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-lg font-bold text-gray-900"
          />
        </View>

        {/* Period Selector */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Budget Period
          </Text>
          <View className="flex-row bg-gray-100 p-1 rounded-xl">
            {(['monthly', 'yearly'] as const).map((p) => {
              const isSelected = period === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriod(p)}
                  className={`flex-1 py-2.5 rounded-lg items-center capitalize ${
                    isSelected ? 'bg-emerald-700' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category Selector */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Select Category
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  className={`flex-row items-center px-3 py-2.5 rounded-xl border ${
                    isSelected ? 'bg-emerald-700 border-emerald-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <DynamicIcon
                    name={cat.icon}
                    size={18}
                    color={isSelected ? '#FFFFFF' : cat.color}
                  />
                  <Text
                    className={`text-xs font-semibold ml-2 ${
                      isSelected ? 'text-white' : 'text-gray-800'
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
          className="w-full py-4 bg-emerald-700 rounded-xl items-center justify-center flex-row shadow-sm mb-6"
        >
          <Check size={18} color="#FFFFFF" className="mr-2" />
          <Text className="text-white text-sm font-bold">Set Budget</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
