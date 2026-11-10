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
  const [editSelectedColor, setEditSelectedColor] = useState('#054D28');

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

      // Load all transactions for this account
      const txns = await TransactionRepository.getByAccountId(accountId);
      setTransactions(txns);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load account details', e);
      Alert.alert('Error', 'Failed to load account.');
      router.back();
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
    if (!id || !account) return;
    if (!editName.trim()) {
      Alert.alert('Name Required', 'Please enter an account name.');
      return;
    }

    try {
      const accountId = parseInt(id, 10);
      const initialBalance = parseAmountToCents(editInitialBalanceStr);

      await AccountRepository.update(accountId, {
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
    if (!id || !account) return;

    if (transactions.length > 0) {
      Alert.alert(
        'Cannot Delete Account',
        `This account has ${transactions.length} associated transactions. Delete or reassign these transactions first to protect your ledger history.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
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

  if (loading || !account) {
    return (
      <View className="flex-1 items-center justify-center bg-[#E8EBE6] dark:bg-[#121411]">
        <ActivityIndicator size="large" color="#0E0F0C" />
      </View>
    );
  }

  const currentBal = account.current_balance ?? account.initial_balance;
  const isPositive = currentBal >= 0;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0E0F0C', '#054D28']}
          />
        }
      >
        {/* Account Header Hero Card - Wise Flat Card */}
        <View className="m-4 bg-white dark:bg-[#1B1E19] rounded-2xl p-5 border border-[#D5D8CF] dark:border-[#2B3028]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{ backgroundColor: `${account.color}20` }}
                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              >
                <DynamicIcon name={account.icon} size={24} color={account.color} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-lg font-black text-[#0E0F0C] dark:text-[#F4F6F2]"
                  numberOfLines={1}
                >
                  {account.name}
                </Text>
                <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-bold capitalize">
                  {account.type} • {account.is_asset === 1 ? 'Asset' : 'Liability'}
                </Text>
              </View>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setEditModalVisible(true)}
              className="flex-row items-center bg-[#F4F6F2] dark:bg-[#242921] px-3 py-1.5 rounded-full border border-[#D5D8CF] dark:border-[#2B3028]"
            >
              <Pencil size={13} color="#0E0F0C" />
              <Text className="text-xs font-black text-[#0E0F0C] dark:text-[#F4F6F2] ml-1">Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Balance Display */}
          <View className="mt-2 pt-3 border-t border-[#E8EBE6] dark:border-[#2B3028]">
            <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1">
              Current Balance
            </Text>
            <Text
              className={`text-3xl font-black tracking-tight ${
                isPositive ? 'text-[#0E0F0C] dark:text-[#F4F6F2]' : 'text-[#A7000D] dark:text-[#F87171]'
              }`}
            >
              {formatCurrency(currentBal, currencySymbol, decimalPlaces)}
            </Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-medium">
                Initial: {formatCurrency(account.initial_balance, currencySymbol, decimalPlaces)}
              </Text>
              <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-black">
                {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions Section Header */}
        <View className="px-5 mb-2 flex-row items-center justify-between">
          <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
            Account Transactions ({transactions.length})
          </Text>
        </View>

        {/* Transactions List */}
        <View className="mx-4 bg-white dark:bg-[#1B1E19] rounded-2xl overflow-hidden border border-[#D5D8CF] dark:border-[#2B3028]">
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
              subtitle="Transactions recorded for this account will appear here."
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
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-[#1B1E19] border-b border-[#D5D8CF] dark:border-[#2B3028]">
            <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
              Edit Account Details
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setEditModalVisible(false)}
              className="w-9 h-9 rounded-full bg-[#F4F6F2] dark:bg-[#242921] items-center justify-center"
            >
              <X size={18} color="#0E0F0C" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
            {/* Name input */}
            <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
              <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1.5">
                Account Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Account Name"
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
                value={editInitialBalanceStr}
                onChangeText={setEditInitialBalanceStr}
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
                  const isSelected = editType === t.type;
                  return (
                    <TouchableOpacity
                      key={t.type}
                      activeOpacity={0.7}
                      onPress={() => setEditType(t.type)}
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

            {/* Is Asset Switch */}
            <View className="flex-row items-center justify-between p-4 bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] mb-4">
              <View>
                <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2]">Include as Asset</Text>
                <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-medium">
                  {editIsAsset ? 'Adds to your Net Worth' : 'Counts as Debt/Liability'}
                </Text>
              </View>
              <Switch
                value={editIsAsset}
                onValueChange={setEditIsAsset}
                trackColor={{ false: '#D5D8CF', true: '#9FE870' }}
                thumbColor="#0E0F0C"
              />
            </View>

            {/* Icon Picker */}
            <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
              <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-2">
                Icon
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {icons.map((ic) => {
                  const isSelected = editSelectedIcon === ic;
                  return (
                    <TouchableOpacity
                      key={ic}
                      activeOpacity={0.7}
                      onPress={() => setEditSelectedIcon(ic)}
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
                Color
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {colors.map((c) => {
                  const isSelected = editSelectedColor === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      activeOpacity={0.7}
                      onPress={() => setEditSelectedColor(c)}
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

            {/* Action Buttons */}
            <View className="gap-2.5 mb-8">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveEdit}
                className="w-full py-4 bg-[#9FE870] rounded-full items-center justify-center flex-row border border-[#86D454]"
              >
                <Check size={18} color="#0E0F0C" strokeWidth={3} className="mr-2" />
                <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDelete}
                className="w-full py-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-full items-center justify-center flex-row"
              >
                <Trash2 size={16} color="#A7000D" className="mr-2" />
                <Text className="text-[#A7000D] dark:text-[#F87171] text-xs font-black uppercase tracking-wider">Delete Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
