import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import {
  DollarSign,
  Sun,
  Moon,
  Smartphone,
  HardDrive,
  Cloud,
  Tag,
  Share2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSettingsStore } from '../src/stores/settings.store';
import { TransactionRepository } from '../src/repositories/transaction.repository';

export default function SettingsScreen() {
  const router = useRouter();
  const { setColorScheme } = useColorScheme();
  const {
    theme,
    setTheme,
    currencySymbol,
    setCurrencySymbol,
  } = useSettingsStore();

  const handleThemeChange = async (key: 'system' | 'light' | 'dark') => {
    try {
      setColorScheme(key);
      await setTheme(key);
    } catch (e) {
      console.error('Failed to update theme', e);
    }
  };

  const currencies = ['$', '€', '£', '₹', '¥', 'C$', 'A$'];

  const themeOptions: { key: 'system' | 'light' | 'dark'; label: string; icon: any }[] = [
    { key: 'system', label: 'System', icon: Smartphone },
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
  ];

  const handleExportCSV = async () => {
    try {
      const transactions = await TransactionRepository.getRecent(1000);
      if (transactions.length === 0) {
        Alert.alert('No Data', 'You have no transactions to export.');
        return;
      }

      let csv = 'ID,Date,Type,Category,Account,To Account,Amount,Note,Tags\n';
      transactions.forEach((t) => {
        const formattedAmount = (t.amount / 100).toFixed(2);
        const dateStr = new Date(t.date).toISOString().split('T')[0];
        const tagNames = (t.tags || []).map((tg) => tg.name).join(' | ');
        const sanitizedNote = (t.note || '').replace(/"/g, '""').replace(/\n/g, ' | ');
        csv += `${t.id},${dateStr},${t.type},"${t.category_name || ''}","${t.account_name}","${
          t.to_account_name || ''
        }",${formattedAmount},"${sanitizedNote}","${tagNames.replace(/"/g, '""')}"\n`;
      });

      const fileUri = `${FileSystem.documentDirectory}iknowmymoney_transactions_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Transactions CSV',
        });
      } else {
        Alert.alert('Exported', `CSV file saved to ${fileUri}`);
      }
    } catch (e) {
      console.error('Failed to export CSV', e);
      Alert.alert('Export Error', 'Failed to generate CSV export.');
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Appearance & Theme Setting */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Sun size={18} color="#0E0F0C" className="mr-2" />
              <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2] ml-1.5">
                Appearance & Theme
              </Text>
            </View>
            <View className="bg-[#9FE870] px-2 py-0.5 rounded-full">
              <Text className="text-[10px] font-black uppercase tracking-wider text-[#0E0F0C]">
                Wise Look
              </Text>
            </View>
          </View>

          {/* Segmented Theme Pills */}
          <View className="flex-row bg-[#F4F6F2] dark:bg-[#242921] p-1 rounded-xl gap-1">
            {themeOptions.map((opt) => {
              const isSelected = (theme || 'system') === opt.key;
              const Icon = opt.icon;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.8}
                  onPress={() => handleThemeChange(opt.key)}
                  className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg gap-1.5 ${
                    isSelected
                      ? 'bg-[#9FE870]'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon
                    size={15}
                    color={isSelected ? '#0E0F0C' : '#5B5F5A'}
                    strokeWidth={isSelected ? 2.5 : 2}
                  />
                  <Text
                    className={`text-xs ${
                      isSelected
                        ? 'font-black text-[#0E0F0C]'
                        : 'font-semibold text-[#5B5F5A] dark:text-[#A3A8A0]'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Currency Setting */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <View className="flex-row items-center mb-3">
            <DollarSign size={18} color="#0E0F0C" className="mr-2" />
            <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2] ml-1.5">
              Currency Symbol
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {currencies.map((c) => {
              const isSelected = currencySymbol === c;
              return (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.8}
                  onPress={() => setCurrencySymbol(c)}
                  className={`w-11 h-11 rounded-xl items-center justify-center border ${
                    isSelected
                      ? 'bg-[#9FE870] border-[#9FE870]'
                      : 'bg-[#F4F6F2] dark:bg-[#242921] border-[#D5D8CF] dark:border-[#2B3028]'
                  }`}
                >
                  <Text
                    className={`text-sm font-black ${
                      isSelected
                        ? 'text-[#0E0F0C]'
                        : 'text-[#0E0F0C] dark:text-[#F4F6F2]'
                    }`}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Categories Manager navigation */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/category' as any)}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#E8EBE6] dark:bg-[#242921] items-center justify-center mr-3">
                <Tag size={18} color="#0E0F0C" />
              </View>
              <View>
                <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2]">
                  Manage Categories
                </Text>
                <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-medium">
                  Custom expense & income categories with icons
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#868685" />
          </TouchableOpacity>
        </View>

        {/* Data & Backup Options */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
          <Text className="px-4 pt-3.5 pb-1 text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest">
            Backup & Sync
          </Text>

          {/* Local Backup */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/backup/local' as any)}
            className="flex-row items-center justify-between p-4 border-b border-[#E8EBE6] dark:border-[#2B3028]"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-[#E8EBE6] dark:bg-[#242921] items-center justify-center mr-3">
                <HardDrive size={18} color="#0E0F0C" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">
                  Local Device Backup
                </Text>
                <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0]">
                  Export database file or restore locally
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#868685" />
          </TouchableOpacity>

          {/* Google Drive Backup */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/backup/drive' as any)}
            className="flex-row items-center justify-between p-4 border-b border-[#E8EBE6] dark:border-[#2B3028]"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-[#E8EBE6] dark:bg-[#242921] items-center justify-center mr-3">
                <Cloud size={18} color="#0E0F0C" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">
                  Google Drive Backup
                </Text>
                <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0]">
                  Private cloud backup to your own Drive
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#868685" />
          </TouchableOpacity>

          {/* Export to CSV */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportCSV}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-[#E8EBE6] dark:bg-[#242921] items-center justify-center mr-3">
                <Share2 size={18} color="#0E0F0C" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">
                  Export Transactions CSV
                </Text>
                <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0]">
                  Download spreadsheet report of all records
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#868685" />
          </TouchableOpacity>
        </View>

        {/* Privacy Note & App info */}
        <View className="items-center p-4">
          <View className="flex-row items-center mb-1">
            <ShieldCheck size={16} color="#054D28" className="mr-1.5" />
            <Text className="text-xs font-black text-[#0E0F0C] dark:text-[#F4F6F2] ml-1">
              Privacy Guarantee
            </Text>
          </View>
          <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] text-center leading-relaxed px-4">
            IKnowMyMoney stores 100% of your data offline on your device. No third-party servers.
            Google Drive backups are stored exclusively in your own private storage.
          </Text>
          <Text className="text-[11px] text-[#868685] font-bold mt-3">
            IKnowMyMoney • Version 1.1.1
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
