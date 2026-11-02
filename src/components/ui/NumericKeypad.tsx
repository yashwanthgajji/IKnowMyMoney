import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Delete } from 'lucide-react-native';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
}

export function NumericKeypad({ onKeyPress, onDelete }: NumericKeypadProps) {
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
                  className="flex-1 h-14 bg-gray-100 rounded-xl items-center justify-center active:bg-gray-200"
                >
                  <Delete size={22} color="#374151" />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.6}
                onPress={() => onKeyPress(item)}
                className="flex-1 h-14 bg-gray-50 rounded-xl items-center justify-center border border-gray-100 active:bg-gray-200"
              >
                <Text className="text-xl font-bold text-gray-800">{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
