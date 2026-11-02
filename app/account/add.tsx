import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
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
  const [isAsset, setIsAsset] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState('Wallet');
  const [selectedColor, setSelectedColor] = useState('#047857');

  const accountTypes: { type: AccountType; label: string }[] = [
    { type: 'wallet', label: 'Cash / Wallet' },
    { type: 'bank', label: 'Bank Account' },
    { type: 'card', label: 'Credit Card' },
    { type: 'savings', label: 'Savings' },
    { type: 'investment', label: 'Investment' },
    { type: 'loan', label: 'Loan / Debt' },
  ];

  const icons = ['Wallet', 'Landmark', 'CreditCard', 'PiggyBank', 'Banknote', 'Coins', 'TrendingUp', 'Briefcase'];
  const colors = ['#047857', '#1D4ED8', '#B91C1C', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#4B5563'];

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
        is_asset: isAsset ? 1 : 0,
        sort_order: 0,
      });

      router.back();
    } catch (e) {
      console.error('Failed to create account', e);
      Alert.alert('Error', 'Failed to create account.');
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Name input */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Account Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chase Checking, Cash Wallet"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-sm text-gray-900"
          />
        </View>

        {/* Initial Balance */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Initial Balance ({currencySymbol})
          </Text>
          <TextInput
            value={initialBalanceStr}
            onChangeText={setInitialBalanceStr}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-sm text-gray-900"
          />
        </View>

        {/* Account Type */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Account Type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {accountTypes.map((t) => {
              const isSelected = type === t.type;
              return (
                <TouchableOpacity
                  key={t.type}
                  onPress={() => {
                    setType(t.type);
                    if (t.type === 'card' || t.type === 'loan') {
                      setIsAsset(false);
                    } else {
                      setIsAsset(true);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl border ${
                    isSelected ? 'bg-emerald-700 border-emerald-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Is Asset Switch */}
        <View className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
          <View>
            <Text className="text-sm font-bold text-gray-900">Include as Asset</Text>
            <Text className="text-xs text-gray-500">
              {isAsset ? 'Adds to your Net Worth' : 'Counts as Debt/Liability'}
            </Text>
          </View>
          <Switch
            value={isAsset}
            onValueChange={setIsAsset}
            trackColor={{ false: '#D1D5DB', true: '#047857' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Icon Picker */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Choose Icon
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {icons.map((ic) => {
              const isSelected = selectedIcon === ic;
              return (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setSelectedIcon(ic)}
                  className={`w-12 h-12 rounded-xl items-center justify-center border ${
                    isSelected ? 'border-2 border-emerald-700 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <DynamicIcon name={ic} size={22} color={isSelected ? '#047857' : '#4B5563'} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color Picker */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Choose Color
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {colors.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: c,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: '#111827',
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
          className="w-full py-4 bg-emerald-700 rounded-xl items-center justify-center flex-row shadow-sm mb-6"
        >
          <Check size={18} color="#FFFFFF" className="mr-2" />
          <Text className="text-white text-sm font-bold">Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
