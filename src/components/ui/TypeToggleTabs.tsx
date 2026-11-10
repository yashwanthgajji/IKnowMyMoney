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
    <View className="flex-row bg-[#E8EBE6] dark:bg-[#242921] p-1.5 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
      {tabs.map((tab) => {
        const isSelected = selectedType === tab.type;

        let activeBg = 'bg-[#A7000D]';
        if (tab.type === 'income') activeBg = 'bg-[#054D28]';
        if (tab.type === 'transfer') activeBg = 'bg-[#1D4ED8]';

        return (
          <TouchableOpacity
            key={tab.type}
            activeOpacity={0.8}
            onPress={() => onSelectType(tab.type)}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
              isSelected ? activeBg : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs ${
                isSelected
                  ? 'text-white font-black'
                  : 'text-[#5B5F5A] dark:text-[#A3A8A0] font-bold'
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
