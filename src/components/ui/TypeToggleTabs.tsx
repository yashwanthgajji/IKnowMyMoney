import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TransactionType } from '../../types';

interface TypeToggleTabsProps {
  selectedType: TransactionType;
  onSelectType: (type: TransactionType) => void;
}

export function TypeToggleTabs({ selectedType, onSelectType }: TypeToggleTabsProps) {
  const tabs: { type: TransactionType; label: string }[] = [
    { type: 'expense', label: 'Expense' },
    { type: 'income', label: 'Income' },
    { type: 'transfer', label: 'Transfer' },
  ];

  return (
    <View className="flex-row bg-gray-100 p-1 rounded-xl">
      {tabs.map((tab) => {
        const isSelected = selectedType === tab.type;

        let activeBg = 'bg-red-700';
        if (tab.type === 'income') activeBg = 'bg-emerald-700';
        if (tab.type === 'transfer') activeBg = 'bg-blue-700';

        return (
          <TouchableOpacity
            key={tab.type}
            activeOpacity={0.8}
            onPress={() => onSelectType(tab.type)}
            className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
              isSelected ? activeBg : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isSelected ? 'text-white' : 'text-gray-600'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
