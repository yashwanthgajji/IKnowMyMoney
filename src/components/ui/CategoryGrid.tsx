import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
              className="items-center justify-center mb-1.5 rounded-2xl bg-white dark:bg-[#1B1E19]"
              style={{
                width: 52,
                height: 52,
                backgroundColor: isSelected ? `${cat.color}25` : undefined,
                borderWidth: isSelected ? 2.5 : 1,
                borderColor: isSelected ? cat.color : '#D5D8CF',
              }}
            >
              <DynamicIcon name={cat.icon} size={22} color={cat.color} />
            </View>
            <Text
              className={`text-xs text-center ${
                isSelected
                  ? 'text-[#0E0F0C] dark:text-[#F4F6F2] font-black'
                  : 'text-[#5B5F5A] dark:text-[#A3A8A0] font-bold'
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
