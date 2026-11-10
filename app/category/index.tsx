import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { CategoryRepository } from '../../src/repositories/category.repository';
import { Category, CategoryType } from '../../src/types';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';

export default function CategoriesScreen() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await CategoryRepository.getByType(activeType);
      setCategories(cats);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  }, [activeType]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Delete "${category.name}"? Transactions assigned to this category will become uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CategoryRepository.delete(category.id);
              await loadCategories();
            } catch (e) {
              console.error('Failed to delete category', e);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      {/* Type Toggle - Wise Segmented Pills */}
      <View className="mx-4 mt-3 bg-white dark:bg-[#1B1E19] p-1.5 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] flex-row gap-1.5">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveType('expense')}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeType === 'expense' ? 'bg-[#A7000D]' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-xs ${
              activeType === 'expense'
                ? 'font-black text-white'
                : 'font-bold text-[#5B5F5A] dark:text-[#A3A8A0]'
            }`}
          >
            Expense Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveType('income')}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeType === 'income' ? 'bg-[#054D28]' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-xs ${
              activeType === 'income'
                ? 'font-black text-white'
                : 'font-bold text-[#5B5F5A] dark:text-[#A3A8A0]'
            }`}
          >
            Income Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 90 }}>
        <View className="bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
          {categories.map((cat) => (
            <View
              key={cat.id}
              className="flex-row items-center justify-between p-3.5 border-b border-[#E8EBE6] dark:border-[#2B3028]"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${cat.color}18` }}
                >
                  <DynamicIcon name={cat.icon} size={20} color={cat.color} />
                </View>
                <Text className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">
                  {cat.name}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDelete(cat)}
                className="p-2 rounded-xl bg-[#F4F6F2] dark:bg-[#242921]"
              >
                <Trash2 size={16} color="#A7000D" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB Add Category - Wise Vivid Lime */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/category/add', params: { type: activeType } })}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#9FE870] rounded-full items-center justify-center border border-[#86D454] shadow-md shadow-neutral-900/10 active:bg-[#86D454]"
      >
        <Plus size={26} color="#0E0F0C" strokeWidth={2.8} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
