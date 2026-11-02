import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Check,
  Trash2,
  Pencil,
  X,
  Wallet,
  ArrowLeftRight,
} from 'lucide-react-native';
import { AccountRepository } from '../../src/repositories/account.repository';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { AccountType, AccountWithBalance, TransactionWithDetails } from '../../src/types';
import { formatCurrency, parseAmountToCents } from '../../src/utils/money';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';
import { TransactionListItem } from '../../src/components/ui/TransactionListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);
  const decimalPlaces = useSettingsStore((s) => s.decimalPlaces);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [account, setAccount] = useState<AccountWithBalance | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<AccountType>('wallet');
  const [editInitialBalanceStr, setEditInitialBalanceStr] = useState('0');
  const [editIsAsset, setEditIsAsset] = useState(true);
  const [editSelectedIcon, setEditSelectedIcon] = useState('Wallet');
  const [editSelectedColor, setEditSelectedColor] = useState('#047857');

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

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const accountId = parseInt(id, 10);
      const acc = await AccountRepository.getById(accountId);
      if (!acc) {
        Alert.alert('Not Found', 'Account not found.');
        router.back();
        return;
      }

      setAccount(acc);
      // Pre-fill edit modal fields
      setEditName(acc.name);
      setEditType(acc.type);
      setEditInitialBalanceStr((acc.initial_balance / 100).toFixed(2));
      setEditIsAsset(acc.is_asset === 1);
      setEditSelectedIcon(acc.icon);
      setEditSelectedColor(acc.color);

      // Load account transactions
      const txns = await TransactionRepository.getByAccountId(accountId);
      setTransactions(txns);
    } catch (e) {
      console.error('Failed to load account details', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSaveEdit = async () => {
    if (!id || !editName.trim()) {
      Alert.alert('Name Required', 'Please enter an account name.');
      return;
    }

    try {
      const initialBalance = parseAmountToCents(editInitialBalanceStr);
      await AccountRepository.update(parseInt(id, 10), {
        name: editName.trim(),
        type: editType,
        icon: editSelectedIcon,
        color: editSelectedColor,
        initial_balance: initialBalance,
        is_asset: editIsAsset ? 1 : 0,
      });

      setEditModalVisible(false);
      await loadData();
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
              setEditModalVisible(false);
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

  if (!account) return null;

  const currentBal = account.current_balance;
  const isPositive = currentBal >= 0;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero Account Overview Card */}
        <View className="m-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{ backgroundColor: `${account.color}20` }}
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              >
                <DynamicIcon name={account.icon} size={24} color={account.color} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-extrabold text-gray-900" numberOfLines={1}>
                  {account.name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <View className="bg-gray-100 px-2 py-0.5 rounded-md mr-2">
                    <Text className="text-[10px] font-semibold text-gray-600 capitalize">
                      {account.type}
                    </Text>
                  </View>
                  <Text className="text-[11px] text-gray-400">
                    {account.is_asset === 1 ? 'Asset' : 'Liability'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setEditModalVisible(true)}
              className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full"
            >
              <Pencil size={13} color="#374151" />
              <Text className="text-xs font-bold text-gray-700 ml-1">Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Balance Display */}
          <View className="mt-2 pt-3 border-t border-gray-100">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Current Balance
            </Text>
            <Text
              className={`text-3xl font-black ${
                isPositive ? 'text-gray-900' : 'text-red-700'
              }`}
            >
              {formatCurrency(currentBal, currencySymbol, decimalPlaces)}
            </Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-xs text-gray-400">
                Initial: {formatCurrency(account.initial_balance, currencySymbol, decimalPlaces)}
              </Text>
              <Text className="text-xs text-gray-500 font-medium">
                {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions Section Header */}
        <View className="px-4 mb-2 flex-row items-center justify-between">
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Account Transactions ({transactions.length})
          </Text>
        </View>

        {/* Transactions List */}
        <View className="mx-4 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {transactions.map((txn) => (
            <TransactionListItem
              key={txn.id}
              transaction={txn}
              currencySymbol={currencySymbol}
              onPress={() => router.push(`/transaction/${txn.id}`)}
            />
          ))}

          {transactions.length === 0 && (
            <EmptyState
              icon="Receipt"
              title="No transactions yet"
              subtitle="Transactions added to this account will appear here."
            />
          )}
        </View>
      </ScrollView>

      {/* Edit Account Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
            <Text className="text-base font-bold text-gray-900">Edit Account Details</Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            >
              <X size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
            {/* Name input */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Account Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
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
                value={editInitialBalanceStr}
                onChangeText={setEditInitialBalanceStr}
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
                  const isSelected = editType === t.type;
                  return (
                    <TouchableOpacity
                      key={t.type}
                      onPress={() => setEditType(t.type)}
                      className={`px-3 py-2 rounded-xl border ${
                        isSelected
                          ? 'bg-emerald-700 border-emerald-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-white' : 'text-gray-700'
                        }`}
                      >
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
                  {editIsAsset ? 'Adds to your Net Worth' : 'Counts as Debt/Liability'}
                </Text>
              </View>
              <Switch
                value={editIsAsset}
                onValueChange={setEditIsAsset}
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
                  const isSelected = editSelectedIcon === ic;
                  return (
                    <TouchableOpacity
                      key={ic}
                      onPress={() => setEditSelectedIcon(ic)}
                      className={`w-12 h-12 rounded-xl items-center justify-center border ${
                        isSelected
                          ? 'border-2 border-emerald-700 bg-emerald-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <DynamicIcon
                        name={ic}
                        size={22}
                        color={isSelected ? '#047857' : '#4B5563'}
                      />
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
                  const isSelected = editSelectedColor === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setEditSelectedColor(c)}
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

            {/* Action Buttons */}
            <View className="gap-3 mb-8">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveEdit}
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
      </Modal>
    </SafeAreaView>
  );
}
