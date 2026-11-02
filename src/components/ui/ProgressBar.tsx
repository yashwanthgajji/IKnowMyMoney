import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  spent: number;
  total: number;
}

export function ProgressBar({ spent, total }: ProgressBarProps) {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const clampedWidth = Math.min(Math.max(percentage, 0), 100);

  let barColor = '#047857'; // Green
  if (percentage > 100) {
    barColor = '#B91C1C'; // Red (Exceeded)
  } else if (percentage > 75) {
    barColor = '#D97706'; // Amber (Warning)
  }

  return (
    <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden my-1">
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
