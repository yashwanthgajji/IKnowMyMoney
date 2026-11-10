import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { AccountRepository } from '../../src/repositories/account.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { AccountType } from '../../src/types';
import { parseAmountToCents } from '../../src/utils/money';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';

export default function AddAccountScreen() {
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('wallet');
  const [initialBalanceStr, setInitialBalanceStr] = useState('0');
  const [selectedIcon, setSelectedIcon] = useState('Wallet');
  const [selectedColor, setSelectedColor] = useState('#054D28');

  const accountTypes: { type: AccountType; label: string }[] = [
    { type: 'wallet', label: 'Cash / Wallet' },
    { type: 'bank', label: 'Bank Account' },
    { type: 'card', label: 'Credit Card' },
    { type: 'savings', label: 'Savings' },
    { type: 'investment', label: 'Investment' },
    { type: 'loan', label: 'Loan / Debt' },
  ];

  const icons = ['Wallet', 'Landmark', 'CreditCard', 'PiggyBank', 'Banknote', 'Coins', 'TrendingUp', 'Briefcase'];
  const colors = ['#054D28', '#1D4ED8', '#A7000D', '#B86700', '#7C3AED', '#DB2777', '#0891B2', '#0E0F0C'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter an account name.');
      return;
    }

    try {
      const initialBalance = parseAmountToCents(initialBalanceStr);
      await AccountRepository.create({
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
        initial_balance: initialBalance,
        is_asset: 1,
        sort_order: 0,
      });

      router.back();
    } catch (e) {
      console.error('Failed to create account', e);
      Alert.alert('Error', 'Failed to create account.');
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Name input */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1.5">
            Account Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chase Checking, Cash Wallet"
            placeholderTextColor="#868685"
            className="bg-[#F4F6F2] dark:bg-[#242921] rounded-xl px-4 py-3 border border-[#D5D8CF] dark:border-[#2B3028] text-xs font-bold text-[#0E0F0C] dark:text-[#F4F6F2]"
          />
        </View>

        {/* Initial Balance */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1.5">
            Initial Balance ({currencySymbol})
          </Text>
          <TextInput
            value={initialBalanceStr}
            onChangeText={setInitialBalanceStr}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#868685"
            className="bg-[#F4F6F2] dark:bg-[#242921] rounded-xl px-4 py-3 border border-[#D5D8CF] dark:border-[#2B3028] text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2]"
          />
        </View>

        {/* Account Type */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
            Account Type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {accountTypes.map((t) => {
              const isSelected = type === t.type;
              return (
                <TouchableOpacity
                  key={t.type}
                  activeOpacity={0.7}
                  onPress={() => setType(t.type)}
                  className={`px-3 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-[#9FE870] border-[#9FE870]'
                      : 'bg-[#F4F6F2] dark:bg-[#242921] border-[#D5D8CF] dark:border-[#2B3028]'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      isSelected
                        ? 'text-[#0E0F0C] font-black'
                        : 'text-[#5B5F5A] dark:text-[#A3A8A0] font-bold'
                    }`}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Icon Picker */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
            Choose Icon
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {icons.map((ic) => {
              const isSelected = selectedIcon === ic;
              return (
                <TouchableOpacity
                  key={ic}
                  activeOpacity={0.7}
                  onPress={() => setSelectedIcon(ic)}
                  className={`w-11 h-11 rounded-xl items-center justify-center border ${
                    isSelected
                      ? 'border-2 border-[#0E0F0C] dark:border-[#F4F6F2] bg-[#E8EBE6] dark:bg-[#242921]'
                      : 'border-[#D5D8CF] dark:border-[#2B3028] bg-[#F4F6F2] dark:bg-[#242921]'
                  }`}
                >
                  <DynamicIcon name={ic} size={20} color={isSelected ? '#0E0F0C' : '#5B5F5A'} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color Picker */}
        <View className="mb-6 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
            Choose Color
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {colors.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.7}
                  onPress={() => setSelectedColor(c)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: c,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: '#0E0F0C',
                  }}
                >
                  {isSelected && <Check size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          className="w-full py-4 bg-[#9FE870] rounded-full items-center justify-center flex-row border border-[#86D454] mb-8"
        >
          <Check size={18} color="#0E0F0C" strokeWidth={3} className="mr-2" />
          <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
