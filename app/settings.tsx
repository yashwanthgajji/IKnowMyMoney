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
import {
  DollarSign,
  Cloud,
  HardDrive,
  Tag,
  Share2,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSettingsStore } from '../src/stores/settings.store';
import { TransactionRepository } from '../src/repositories/transaction.repository';
import { formatDateTime } from '../src/utils/dates';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    currencySymbol,
    setCurrencySymbol,
    decimalPlaces,
    setDecimalPlaces,
    lastDriveBackup,
    lastLocalBackup,
  } = useSettingsStore();

  const currencies = ['$', '€', '£', '₹', '¥', 'C$', 'A$'];

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
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Currency Setting */}
        <View className="mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <View className="flex-row items-center mb-3">
            <DollarSign size={18} color="#047857" className="mr-2" />
            <Text className="text-sm font-bold text-gray-900 ml-1.5">Currency Symbol</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {currencies.map((c) => {
              const isSelected = currencySymbol === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCurrencySymbol(c)}
                  className={`w-11 h-11 rounded-xl items-center justify-center border ${
                    isSelected ? 'bg-emerald-700 border-emerald-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? 'text-white' : 'text-gray-700'
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
        <View className="mb-4 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <TouchableOpacity
            onPress={() => router.push('/category/index' as any)}
            className="flex-row items-center justify-between p-4 active:bg-gray-50"
          >
            <View className="flex-row items-center">
              <Tag size={18} color="#047857" className="mr-3" />
              <View className="ml-1">
                <Text className="text-sm font-bold text-gray-900">Manage Categories</Text>
                <Text className="text-xs text-gray-500">
                  Custom expense & income categories with icons
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Data & Backup Options */}
        <View className="mb-4 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <Text className="px-4 pt-3.5 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Backup & Sync
          </Text>

          {/* Local Backup */}
          <TouchableOpacity
            onPress={() => router.push('/backup/local' as any)}
            className="flex-row items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center mr-3">
                <HardDrive size={18} color="#1D4ED8" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900">Local Device Backup</Text>
                <Text className="text-xs text-gray-500">
                  Export database file or restore locally
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Export to CSV */}
          <TouchableOpacity
            onPress={handleExportCSV}
            className="flex-row items-center justify-between p-4 active:bg-gray-50"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-full bg-amber-50 items-center justify-center mr-3">
                <Share2 size={18} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900">Export Transactions CSV</Text>
                <Text className="text-xs text-gray-500">
                  Download spreadsheet report of all records
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Privacy Note & App info */}
        <View className="items-center p-4">
          <View className="flex-row items-center mb-1">
            <ShieldCheck size={16} color="#047857" className="mr-1.5" />
            <Text className="text-xs font-bold text-gray-700 ml-1">Privacy Guarantee</Text>
          </View>
          <Text className="text-xs text-gray-400 text-center leading-relaxed px-4">
            IKnowMyMoney stores 100% of your data offline on your device. No third-party servers.
            Google Drive backups are stored exclusively in your own private storage.
          </Text>
          <Text className="text-[11px] text-gray-300 font-medium mt-3">
            IKnowMyMoney • Version 1.1.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
