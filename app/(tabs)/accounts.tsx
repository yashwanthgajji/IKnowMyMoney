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
import { Plus } from 'lucide-react-native';
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
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0E0F0C', '#054D28']}
          />
        }
      >
        {/* Net Worth Summary Card - Wise Flat Card */}
        <View className="m-4 bg-white dark:bg-[#1B1E19] rounded-2xl p-5 border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1">
            Total Net Worth
          </Text>
          <Text className="text-3xl font-black text-[#0E0F0C] dark:text-[#F4F6F2] tracking-tight">
            {formatCurrency(netWorth.netWorth, currencySymbol)}
          </Text>

          <View className="flex-row justify-between mt-4 pt-3 border-t border-[#E8EBE6] dark:border-[#2B3028]">
            <View>
              <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-wider">
                Assets
              </Text>
              <Text className="text-sm font-black text-[#054D28] dark:text-[#4ADE80] mt-0.5">
                {formatCurrency(netWorth.assets, currencySymbol)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-wider">
                Liabilities
              </Text>
              <Text className="text-sm font-black text-[#A7000D] dark:text-[#F87171] mt-0.5">
                {formatCurrency(netWorth.liabilities, currencySymbol)}
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Assets */}
        <View className="px-4 mt-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
              Assets ({assets.length})
            </Text>
            <Text className="text-xs font-black text-[#054D28] dark:text-[#4ADE80]">
              {formatCurrency(netWorth.assets, currencySymbol)}
            </Text>
          </View>
          <View className="bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
            {assets.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/account/${acc.id}`)}
                className="flex-row items-center justify-between p-4 border-b border-[#E8EBE6] dark:border-[#2B3028]"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${acc.color}15` }}
                  >
                    <DynamicIcon name={acc.icon} size={20} color={acc.color} />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">
                      {acc.name}
                    </Text>
                    <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] capitalize">
                      {acc.type}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm font-black text-[#054D28] dark:text-[#4ADE80]">
                  {formatCurrency(acc.current_balance, currencySymbol)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: Liabilities */}
        {liabilities.length > 0 && (
          <View className="px-4 mt-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
                Liabilities ({liabilities.length})
              </Text>
              <Text className="text-xs font-black text-[#A7000D] dark:text-[#F87171]">
                {formatCurrency(netWorth.liabilities, currencySymbol)}
              </Text>
            </View>
            <View className="bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
              {liabilities.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/account/${acc.id}`)}
                  className="flex-row items-center justify-between p-4 border-b border-[#E8EBE6] dark:border-[#2B3028]"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: `${acc.color}15` }}
                    >
                      <DynamicIcon name={acc.icon} size={20} color={acc.color} />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">
                        {acc.name}
                      </Text>
                      <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] capitalize">
                        {acc.type}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm font-black text-[#A7000D] dark:text-[#F87171]">
                    {formatCurrency(acc.current_balance, currencySymbol)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB Add Account - Wise Vivid Lime */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/account/add')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#9FE870] rounded-full items-center justify-center border border-[#86D454] shadow-md shadow-neutral-900/10 active:bg-[#86D454]"
      >
        <Plus size={26} color="#0E0F0C" strokeWidth={2.8} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
