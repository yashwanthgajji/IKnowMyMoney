import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { CategoryRepository } from '../../src/repositories/category.repository';
import { CategoryType } from '../../src/types';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';

export default function AddCategoryScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const router = useRouter();

  const [type, setType] = useState<CategoryType>(
    params.type === 'income' ? 'income' : 'expense'
  );
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('#047857');

  const icons = [
    'Tag', 'Utensils', 'Car', 'ShoppingBag', 'Receipt', 'Film',
    'HeartPulse', 'GraduationCap', 'Sparkles', 'Home', 'Briefcase',
    'Laptop', 'TrendingUp', 'Gift', 'Plane', 'Coffee', 'Smartphone', 'Gamepad2'
  ];

  const colors = [
    '#047857', '#1D4ED8', '#B91C1C', '#D97706',
    '#7C3AED', '#DB2777', '#0891B2', '#4B5563'
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a category name.');
      return;
    }

    try {
      await CategoryRepository.create({
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
        is_default: 0,
        sort_order: 0,
      });

      router.back();
    } catch (e) {
      console.error('Failed to create category', e);
      Alert.alert('Error', 'Failed to create category.');
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Type Toggle */}
        <View className="flex-row mb-4 bg-gray-100 p-1 rounded-xl">
          <TouchableOpacity
            onPress={() => setType('expense')}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              type === 'expense' ? 'bg-red-700' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-bold ${type === 'expense' ? 'text-white' : 'text-gray-600'}`}>
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType('income')}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              type === 'income' ? 'bg-emerald-700' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xs font-bold ${type === 'income' ? 'text-white' : 'text-gray-600'}`}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Name input */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Category Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Subscriptions, Coffee, Pet Care"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-sm text-gray-900"
          />
        </View>

        {/* Icon Picker */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Choose Icon
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {icons.map((ic) => {
              const isSelected = selectedIcon === ic;
              return (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setSelectedIcon(ic)}
                  className={`w-12 h-12 rounded-xl items-center justify-center border ${
                    isSelected ? 'border-2 border-emerald-700 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <DynamicIcon name={ic} size={22} color={isSelected ? '#047857' : '#4B5563'} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color Picker */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Choose Color
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {colors.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: c,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: '#111827',
                  }}
                >
                  {isSelected && <Check size={16} color="#FFFFFF" />}
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
          <Text className="text-white text-sm font-bold">Create Category</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
