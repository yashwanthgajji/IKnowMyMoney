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
  const [selectedColor, setSelectedColor] = useState('#054D28');

  const icons = [
    'Tag', 'Utensils', 'Car', 'ShoppingBag', 'Receipt', 'Film',
    'HeartPulse', 'GraduationCap', 'Sparkles', 'Home', 'Briefcase',
    'Laptop', 'TrendingUp', 'Gift', 'Plane', 'Coffee', 'Smartphone', 'Gamepad2'
  ];

  const colors = [
    '#054D28', '#1D4ED8', '#A7000D', '#B86700',
    '#7C3AED', '#DB2777', '#0891B2', '#0E0F0C'
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
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Type Toggle - Wise Segmented Pills */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-1.5 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] flex-row gap-1.5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setType('expense')}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              type === 'expense' ? 'bg-[#A7000D]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs ${
                type === 'expense'
                  ? 'font-black text-white'
                  : 'font-bold text-[#5B5F5A] dark:text-[#A3A8A0]'
              }`}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setType('income')}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              type === 'income' ? 'bg-[#054D28]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs ${
                type === 'income'
                  ? 'font-black text-white'
                  : 'font-bold text-[#5B5F5A] dark:text-[#A3A8A0]'
              }`}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Name input */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1.5">
            Category Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Subscriptions, Coffee, Pet Care"
            placeholderTextColor="#868685"
            className="bg-[#F4F6F2] dark:bg-[#242921] rounded-xl px-4 py-3 border border-[#D5D8CF] dark:border-[#2B3028] text-xs font-bold text-[#0E0F0C] dark:text-[#F4F6F2]"
          />
        </View>

        {/* Icon Picker */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
            Choose Icon
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {icons.map((ic) => {
              const isSelected = selectedIcon === ic;
              return (
                <TouchableOpacity
                  key={ic}
                  activeOpacity={0.7}
                  onPress={() => setSelectedIcon(ic)}
                  className={`w-11 h-11 rounded-xl items-center justify-center border ${
                    isSelected
                      ? 'border-2 border-[#0E0F0C] dark:border-[#F4F6F2] bg-[#E8EBE6] dark:bg-[#242921]'
                      : 'border-[#D5D8CF] dark:border-[#2B3028] bg-[#F4F6F2] dark:bg-[#242921]'
                  }`}
                >
                  <DynamicIcon name={ic} size={20} color={isSelected ? '#0E0F0C' : '#5B5F5A'} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color Picker */}
        <View className="mb-6 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
            Choose Color
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {colors.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.7}
                  onPress={() => setSelectedColor(c)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: c,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: '#0E0F0C',
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
          className="w-full py-4 bg-[#9FE870] rounded-full items-center justify-center flex-row border border-[#86D454] mb-8"
        >
          <Check size={18} color="#0E0F0C" strokeWidth={3} className="mr-2" />
          <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">Create Category</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
