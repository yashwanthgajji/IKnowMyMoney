import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Wallet, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { AccountRepository } from '../../src/repositories/account.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { AccountWithBalance } from '../../src/types';
import { formatCurrency } from '../../src/utils/money';
import { DynamicIcon } from '../../src/components/ui/DynamicIcon';

export default function AccountsScreen() {
  const router = useRouter();
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [netWorth, setNetWorth] = useState<{ assets: number; liabilities: number; netWorth: number }>({
    assets: 0,
    liabilities: 0,
    netWorth: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const all = await AccountRepository.getAllWithBalances();
      setAccounts(all);
      const nw = await AccountRepository.getNetWorth();
      setNetWorth(nw);
    } catch (e) {
      console.error('Failed to load accounts', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const assets = accounts.filter((a) => a.is_asset === 1);
  const liabilities = accounts.filter((a) => a.is_asset === 0);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Net Worth Summary Card */}
        <View className="m-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Total Net Worth
          </Text>
          <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {formatCurrency(netWorth.netWorth, currencySymbol)}
          </Text>

          <View className="flex-row justify-between mt-4 pt-3 border-t border-gray-100">
            <View>
              <Text className="text-xs text-gray-500 font-medium">Assets</Text>
              <Text className="text-sm font-bold text-emerald-700">
                {formatCurrency(netWorth.assets, currencySymbol)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 font-medium">Liabilities</Text>
              <Text className="text-sm font-bold text-red-700">
                {formatCurrency(netWorth.liabilities, currencySymbol)}
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Assets */}
        <View className="px-4 mt-2">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-bold text-gray-800">Assets ({assets.length})</Text>
            <Text className="text-xs font-semibold text-emerald-700">
              {formatCurrency(netWorth.assets, currencySymbol)}
            </Text>
          </View>
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {assets.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => router.push(`/account/${acc.id}`)}
                className="flex-row items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    className="w-11 h-11 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${acc.color}15` }}
                  >
                    <DynamicIcon name={acc.icon} size={22} color={acc.color} />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-gray-900">{acc.name}</Text>
                    <Text className="text-xs text-gray-400 capitalize">{acc.type}</Text>
                  </View>
                </View>
                <Text className="text-sm font-bold text-emerald-700">
                  {formatCurrency(acc.current_balance, currencySymbol)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: Liabilities */}
        {liabilities.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-bold text-gray-800">
                Liabilities ({liabilities.length})
              </Text>
              <Text className="text-xs font-semibold text-red-700">
                {formatCurrency(netWorth.liabilities, currencySymbol)}
              </Text>
            </View>
            <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {liabilities.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => router.push(`/account/${acc.id}`)}
                  className="flex-row items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-11 h-11 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${acc.color}15` }}
                    >
                      <DynamicIcon name={acc.icon} size={22} color={acc.color} />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-gray-900">{acc.name}</Text>
                      <Text className="text-xs text-gray-400 capitalize">{acc.type}</Text>
                    </View>
                  </View>
                  <Text className="text-sm font-bold text-red-700">
                    {formatCurrency(acc.current_balance, currencySymbol)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB Add Account */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/account/add')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-700 rounded-full items-center justify-center shadow-lg shadow-emerald-900/30 elevation-8"
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
