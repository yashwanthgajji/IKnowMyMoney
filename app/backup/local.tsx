import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HardDrive, Download, ShieldAlert, CheckCircle } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../../src/db/database';
import { useSettingsStore } from '../../src/stores/settings.store';
import { formatDateTime } from '../../src/utils/dates';

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const CHUNK_SIZE = 8192;
  for (let i = 0; i < len; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

export default function LocalBackupScreen() {
  const router = useRouter();
  const { lastLocalBackup, setLastLocalBackup } = useSettingsStore();
  const [loading, setLoading] = useState(false);

  const handleExportBackup = async () => {
    setLoading(true);
    try {
      const db = await getDatabase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupUri = `${FileSystem.documentDirectory}iknowmymoney_backup_${timestamp}.ikmm`;

      let copied = false;
      if (db.databasePath) {
        try {
          const formattedPath = db.databasePath.startsWith('file://')
            ? db.databasePath
            : `file://${db.databasePath}`;
          const fileInfo = await FileSystem.getInfoAsync(formattedPath);
          if (fileInfo.exists) {
            await FileSystem.copyAsync({
              from: formattedPath,
              to: backupUri,
            });
            copied = true;
          }
        } catch (copyErr) {
          console.warn('Direct file copy failed, falling back to serializeAsync', copyErr);
        }
      }

      if (!copied) {
        const bytes = await db.serializeAsync('main');
        const base64Content = uint8ArrayToBase64(bytes);
        await FileSystem.writeAsStringAsync(backupUri, base64Content, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      await setLastLocalBackup(Date.now());

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupUri, {
          mimeType: 'application/octet-stream',
          dialogTitle: 'Save IKnowMyMoney Backup',
        });
      } else {
        Alert.alert('Backup Created', `Backup file created at:\n${backupUri}`);
      }
    } catch (e) {
      console.error('Failed to export backup', e);
      Alert.alert('Backup Failed', 'Could not export local database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView className="flex-1 p-4">
        {/* Info Card - Wise Flat Card */}
        <View className="bg-white dark:bg-[#1B1E19] p-5 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] mb-4">
          <View className="w-12 h-12 rounded-xl bg-[#E8EBE6] dark:bg-[#242921] items-center justify-center mb-3">
            <HardDrive size={24} color="#0E0F0C" />
          </View>
          <Text className="text-base font-black text-[#0E0F0C] dark:text-[#F4F6F2] mb-1">
            Local Device Database Backup
          </Text>
          <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] leading-relaxed">
            Create an independent snapshot of your financial records. You can save this file to
            your phone's file manager, send it to another device, or store it offline.
          </Text>

          {lastLocalBackup && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-[#E8EBE6] dark:border-[#2B3028]">
              <CheckCircle size={14} color="#054D28" className="mr-1.5" />
              <Text className="text-xs font-bold text-[#054D28] dark:text-[#4ADE80] ml-1">
                Last backup created: {formatDateTime(lastLocalBackup)}
              </Text>
            </View>
          )}
        </View>

        {/* Export Backup Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleExportBackup}
          disabled={loading}
          className="w-full py-4 bg-[#9FE870] rounded-full items-center justify-center flex-row border border-[#86D454] mb-4"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#0E0F0C" />
          ) : (
            <>
              <Download size={18} color="#0E0F0C" strokeWidth={3} className="mr-2" />
              <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">
                Export Backup File (.ikmm)
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Warning card */}
        <View className="bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] flex-row items-start">
          <ShieldAlert size={20} color="#B86700" className="mr-3 mt-0.5" />
          <View className="flex-1 ml-1">
            <Text className="text-xs font-black text-[#0E0F0C] dark:text-[#F4F6F2] mb-0.5">
              Offline Storage
            </Text>
            <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] leading-relaxed">
              Local backups remain solely on this physical device. For cross-device protection or
              phone replacement, use the Google Drive Backup option.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
