import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Delete } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
}

export function NumericKeypad({ onKeyPress, onDelete }: NumericKeypadProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'delete'],
  ];

  return (
    <View className="w-full px-2 py-1">
      {rows.map((row, rIdx) => (
        <View key={rIdx} className="flex-row gap-2 my-1">
          {row.map((item) => {
            if (item === 'delete') {
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.6}
                  onPress={onDelete}
                  className="flex-1 h-14 bg-[#F4F6F2] dark:bg-[#242921] rounded-2xl items-center justify-center border border-[#D5D8CF] dark:border-[#2B3028] active:opacity-70"
                >
                  <Delete size={22} color={isDark ? '#F4F6F2' : '#0E0F0C'} />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.6}
                onPress={() => onKeyPress(item)}
                className="flex-1 h-14 bg-white dark:bg-[#1B1E19] rounded-2xl items-center justify-center border border-[#D5D8CF] dark:border-[#2B3028] active:bg-[#F4F6F2] dark:active:bg-[#242921]"
              >
                <Text className="text-xl font-black text-[#0E0F0C] dark:text-[#F4F6F2]">{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
