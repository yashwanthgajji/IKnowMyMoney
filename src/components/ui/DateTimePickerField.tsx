import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { isToday, isYesterday } from 'date-fns';
import { formatDateFull, formatTimeOnly } from '../../utils/dates';

interface DateTimePickerFieldProps {
  date: number; // epoch ms
  onChangeDate: (epochMs: number) => void;
}

export function DateTimePickerField({
  date,
  onChangeDate,
}: DateTimePickerFieldProps) {
  const [showIosPicker, setShowIosPicker] = useState<'date' | 'time' | null>(null);

  const currentDateObj = new Date(date);
  const isDateToday = isToday(currentDateObj);
  const isDateYesterday = isYesterday(currentDateObj);

  const setPresetToday = () => {
    const today = new Date();
    today.setHours(currentDateObj.getHours(), currentDateObj.getMinutes(), 0, 0);
    onChangeDate(today.getTime());
  };

  const setPresetYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(currentDateObj.getHours(), currentDateObj.getMinutes(), 0, 0);
    onChangeDate(yesterday.getTime());
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDateObj,
        mode: 'date',
        is24Hour: false,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) {
            const merged = new Date(selectedDate);
            merged.setHours(
              currentDateObj.getHours(),
              currentDateObj.getMinutes(),
              currentDateObj.getSeconds()
            );
            onChangeDate(merged.getTime());
          }
        },
      });
    } else {
      setShowIosPicker('date');
    }
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDateObj,
        mode: 'time',
        is24Hour: false,
        onChange: (event: DateTimePickerEvent, selectedTime?: Date) => {
          if (event.type === 'set' && selectedTime) {
            const merged = new Date(date);
            merged.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0);
            onChangeDate(merged.getTime());
          }
        },
      });
    } else {
      setShowIosPicker('time');
    }
  };

  return (
    <View className="px-4 mt-4">
      {/* Label and Quick Presets */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Date & Time
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={setPresetToday}
            className={`px-2.5 py-1 rounded-lg mr-1.5 border ${
              isDateToday
                ? 'bg-emerald-700 border-emerald-700'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text
              className={`text-[11px] font-bold ${
                isDateToday ? 'text-white' : 'text-gray-600'
              }`}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={setPresetYesterday}
            className={`px-2.5 py-1 rounded-lg border ${
              isDateYesterday
                ? 'bg-emerald-700 border-emerald-700'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text
              className={`text-[11px] font-bold ${
                isDateYesterday ? 'text-white' : 'text-gray-600'
              }`}
            >
              Yesterday
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selectors Row: Date + Time */}
      <View className="flex-row items-center gap-2">
        {/* Date Selector */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openDatePicker}
          className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-200"
        >
          <Calendar size={16} color="#047857" className="mr-2" />
          <Text className="text-xs font-semibold text-gray-800 ml-1.5 flex-1" numberOfLines={1}>
            {formatDateFull(date)}
          </Text>
        </TouchableOpacity>

        {/* Time Selector */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openTimePicker}
          className="flex-row items-center bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-200 min-w-[105px]"
        >
          <Clock size={16} color="#047857" className="mr-2" />
          <Text className="text-xs font-semibold text-gray-800 ml-1.5">
            {formatTimeOnly(date)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* iOS Modal / inline picker fallback if needed */}
      {Platform.OS === 'ios' && showIosPicker && (
        <DateTimePicker
          value={currentDateObj}
          mode={showIosPicker}
          display="default"
          onChange={(event: DateTimePickerEvent, val?: Date) => {
            setShowIosPicker(null);
            if (val) {
              if (showIosPicker === 'date') {
                const merged = new Date(val);
                merged.setHours(currentDateObj.getHours(), currentDateObj.getMinutes());
                onChangeDate(merged.getTime());
              } else {
                const merged = new Date(date);
                merged.setHours(val.getHours(), val.getMinutes());
                onChangeDate(merged.getTime());
              }
            }
          }}
        />
      )}
    </View>
  );
}
