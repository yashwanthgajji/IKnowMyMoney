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
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-gray-50">
      {/* Type Toggle */}
      <View className="flex-row p-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setActiveType('expense')}
          className={`flex-1 py-2.5 rounded-xl items-center mr-2 ${
            activeType === 'expense' ? 'bg-red-700' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeType === 'expense' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Expense Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveType('income')}
          className={`flex-1 py-2.5 rounded-xl items-center ml-2 ${
            activeType === 'income' ? 'bg-emerald-700' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeType === 'income' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Income Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 90 }}>
        <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {categories.map((cat) => (
            <View
              key={cat.id}
              className="flex-row items-center justify-between p-3.5 border-b border-gray-100"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <DynamicIcon name={cat.icon} size={20} color={cat.color} />
                </View>
                <Text className="text-sm font-semibold text-gray-900">{cat.name}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(cat)}
                className="p-2 rounded-lg bg-red-50"
              >
                <Trash2 size={16} color="#B91C1C" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB Add Category */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/category/add', params: { type: activeType } })}
        className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-700 rounded-full items-center justify-center shadow-lg shadow-emerald-900/30 elevation-8"
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
