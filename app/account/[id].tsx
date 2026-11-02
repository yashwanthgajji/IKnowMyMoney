import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Trash2 } from 'lucide-react-native';
import { AccountRepository } from '../../src/repositories/account.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { AccountType } from '../../src/types';
import { parseAmountToCents } from '../../src/utils/money';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadAccount() {
      if (!id) return;
      try {
        const acc = await AccountRepository.getById(parseInt(id, 10));
        if (!acc) {
          Alert.alert('Not Found', 'Account not found.');
          router.back();
          return;
        }

        setName(acc.name);
        setType(acc.type);
        setInitialBalanceStr((acc.initial_balance / 100).toFixed(2));
        setIsAsset(acc.is_asset === 1);
        setSelectedIcon(acc.icon);
        setSelectedColor(acc.color);
        setLoading(false);
      } catch (e) {
        console.error('Failed to load account', e);
        setLoading(false);
      }
    }
    loadAccount();
  }, [id]);

  const handleSave = async () => {
    if (!id || !name.trim()) {
      Alert.alert('Name Required', 'Please enter an account name.');
      return;
    }

    try {
      const initialBalance = parseAmountToCents(initialBalanceStr);
      await AccountRepository.update(parseInt(id, 10), {
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
        initial_balance: initialBalance,
        is_asset: isAsset ? 1 : 0,
      });

      router.back();
    } catch (e) {
      console.error('Failed to update account', e);
      Alert.alert('Error', 'Failed to update account.');
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete Account',
      'Deleting this account will permanently delete all associated transactions. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AccountRepository.delete(parseInt(id, 10));
              router.back();
            } catch (e) {
              console.error('Failed to delete account', e);
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

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
            placeholder="Account Name"
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
                  onPress={() => setType(t.type)}
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
            Icon
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
            Color
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

        {/* Buttons */}
        <View className="gap-3 mb-8">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            className="w-full py-4 bg-emerald-700 rounded-xl items-center justify-center flex-row shadow-sm"
          >
            <Check size={18} color="#FFFFFF" className="mr-2" />
            <Text className="text-white text-sm font-bold">Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDelete}
            className="w-full py-3.5 bg-red-50 border border-red-200 rounded-xl items-center justify-center flex-row"
          >
            <Trash2 size={18} color="#B91C1C" className="mr-2" />
            <Text className="text-red-700 text-sm font-bold">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
