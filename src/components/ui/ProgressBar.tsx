import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  spent: number;
  total: number;
}

export function ProgressBar({ spent, total }: ProgressBarProps) {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const clampedWidth = Math.min(Math.max(percentage, 0), 100);

  let barColor = '#054D28'; // Wise Forest Green
  if (percentage > 100) {
    barColor = '#A7000D'; // Wise Crimson (Exceeded)
  } else if (percentage > 75) {
    barColor = '#B86700'; // Amber warning
  }

  return (
    <View className="w-full h-2.5 bg-[#E8EBE6] dark:bg-[#242921] rounded-full overflow-hidden my-1">
      <View
        style={{
          width: `${clampedWidth}%`,
          backgroundColor: barColor,
          height: '100%',
          borderRadius: 999,
        }}
      />
    </View>
  );
}
