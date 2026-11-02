import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Category } from '../../types';
import { DynamicIcon } from './DynamicIcon';

interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number) => void;
}

export function CategoryGrid({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <View className="flex-row flex-wrap justify-start">
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.7}
            onPress={() => onSelectCategory(cat.id)}
            className="w-1/4 items-center p-2"
          >
            <View
              className="items-center justify-center mb-1.5 rounded-2xl"
              style={{
                width: 52,
                height: 52,
                backgroundColor: isSelected ? `${cat.color}25` : '#F9FAFB',
                borderWidth: isSelected ? 2.5 : 1,
                borderColor: isSelected ? cat.color : '#E5E7EB',
              }}
            >
              <DynamicIcon name={cat.icon} size={24} color={cat.color} />
            </View>
            <Text
              className={`text-xs text-center font-medium ${
                isSelected ? 'text-gray-900 font-bold' : 'text-gray-600'
              }`}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
