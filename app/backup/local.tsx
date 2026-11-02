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
import { HardDrive, Download, Upload, ShieldAlert, CheckCircle } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { closeDatabase, getDatabase } from '../../src/db/database';
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
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Info Card */}
        <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4">
          <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-3">
            <HardDrive size={24} color="#1D4ED8" />
          </View>
          <Text className="text-base font-bold text-gray-900 mb-1">
            Local Device Database Backup
          </Text>
          <Text className="text-xs text-gray-500 leading-relaxed">
            Create an independent snapshot of your financial records. You can save this file to
            your phone's file manager, send it to another device, or store it offline.
          </Text>

          {lastLocalBackup && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
              <CheckCircle size={14} color="#047857" className="mr-1.5" />
              <Text className="text-xs text-gray-600 ml-1">
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
          className="w-full py-4 bg-emerald-700 rounded-xl items-center justify-center flex-row shadow-sm mb-4"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Download size={18} color="#FFFFFF" className="mr-2" />
              <Text className="text-white text-sm font-bold">Export Backup File (.ikmm)</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Warning card */}
        <View className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex-row items-start">
          <ShieldAlert size={20} color="#B45309" className="mr-3 mt-0.5" />
          <View className="flex-1 ml-2">
            <Text className="text-xs font-bold text-amber-900 mb-0.5">Offline Storage</Text>
            <Text className="text-xs text-amber-800 leading-relaxed">
              Local backups remain solely on this physical device. For cross-device protection or
              phone replacement, use the Google Drive Backup option.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
