import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Cloud,
  UploadCloud,
  RefreshCw,
  ShieldCheck,
  Clock,
  FileText,
  LogIn,
  LogOut,
  Download,
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as FileSystem from 'expo-file-system/legacy';
import { useSettingsStore } from '../../src/stores/settings.store';
import { getDatabase, closeDatabase } from '../../src/db/database';
import { formatDateTime } from '../../src/utils/dates';
import { GoogleDriveService, RemoteDriveFile } from '../../src/services/drive.service';
import { GoogleAuthService, GoogleAuthUser, GOOGLE_DRIVE_SCOPE } from '../../src/services/auth.service';

WebBrowser.maybeCompleteAuthSession();

export default function DriveBackupScreen() {
  const { lastDriveBackup, setLastDriveBackup } = useSettingsStore();

  const [currentUser, setCurrentUser] = useState<GoogleAuthUser | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [backups, setBackups] = useState<RemoteDriveFile[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  // Configure Google OAuth Request with drive.file scope
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    scopes: ['openid', 'profile', 'email', GOOGLE_DRIVE_SCOPE],
  });

  // Check for existing stored session on mount
  useEffect(() => {
    async function checkAuth() {
      const stored = await GoogleAuthService.getStoredUser();
      if (stored) {
        setCurrentUser(stored);
        fetchRemoteBackups(stored.accessToken);
      }
    }
    checkAuth();
  }, []);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      handleAuthSuccess(response.authentication.accessToken);
    }
  }, [response]);

  const handleAuthSuccess = async (token: string) => {
    try {
      const profile = await GoogleAuthService.fetchUserProfile(token);
      const user: GoogleAuthUser = {
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        accessToken: token,
      };
      await GoogleAuthService.storeUser(user);
      setCurrentUser(user);
      fetchRemoteBackups(token);
    } catch (e) {
      console.error('Failed to authenticate with Google', e);
      Alert.alert('Google Sign-In Error', 'Could not complete Google authentication.');
    }
  };

  const handleSignOut = async () => {
    await GoogleAuthService.signOut();
    setCurrentUser(null);
    setBackups([]);
  };

  const fetchRemoteBackups = async (token?: string) => {
    const activeToken = token || currentUser?.accessToken;
    if (!activeToken) return;

    setLoadingList(true);
    try {
      const files = await GoogleDriveService.listBackups(activeToken);
      setBackups(files);
    } catch (e: any) {
      console.error('Failed to list backups from Google Drive', e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleManualBackup = async () => {
    if (!currentUser?.accessToken) {
      Alert.alert('Sign-In Required', 'Please connect your Google account first to backup to Drive.');
      return;
    }

    setIsUploading(true);
    let tempSnapshotUri: string | null = null;
    try {
      const db = await getDatabase();
      const now = Date.now();
      const dateStr = new Date(now).toISOString().slice(0, 10);
      const fileName = `iknowmymoney_backup_${dateStr}_${now}.db`;
      tempSnapshotUri = `${FileSystem.cacheDirectory}${fileName}`;

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
              to: tempSnapshotUri,
            });
            copied = true;
          }
        } catch (copyErr) {
          console.warn('Direct file copy failed, falling back to serializeAsync', copyErr);
        }
      }

      if (!copied) {
        const bytes = await db.serializeAsync('main');
        let binary = '';
        const len = bytes.byteLength;
        const CHUNK_SIZE = 8192;
        for (let i = 0; i < len; i += CHUNK_SIZE) {
          const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, len));
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64Content = btoa(binary);
        await FileSystem.writeAsStringAsync(tempSnapshotUri, base64Content, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // 1. Upload directly to Google Drive via Drive API v3
      const uploadResult = await GoogleDriveService.uploadBackup(
        currentUser.accessToken,
        tempSnapshotUri,
        fileName
      );

      // 2. Record metadata in local SQLite
      await db.runAsync(
        `INSERT INTO drive_backups (drive_file_id, file_name, file_size_bytes, db_version, created_at)
         VALUES (?, ?, ?, ?, ?);`,
        [uploadResult.id, uploadResult.name, uploadResult.size, 1, now]
      );

      // 3. Update settings & refresh cloud list
      await setLastDriveBackup(now);
      await fetchRemoteBackups(currentUser.accessToken);

      Alert.alert(
        'Backup Successful',
        `Your database (${fileName}) has been securely uploaded to your personal Google Drive.`
      );
    } catch (e: any) {
      console.error('Failed to backup to Google Drive', e);
      Alert.alert('Upload Failed', e?.message || 'Could not upload backup to Google Drive.');
    } finally {
      if (tempSnapshotUri) {
        try {
          await FileSystem.deleteAsync(tempSnapshotUri, { idempotent: true });
        } catch (_) {}
      }
      setIsUploading(false);
    }
  };

  const handleRestoreBackup = (backup: RemoteDriveFile) => {
    if (!currentUser?.accessToken) return;

    Alert.alert(
      'Restore From Google Drive',
      `Restoring "${backup.name}" from Google Drive will replace all current data on this device.\n\nDo you want to continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Now',
          style: 'destructive',
          onPress: async () => {
            try {
              const dbPath = `${FileSystem.documentDirectory}SQLite/iknowmymoney.db`;
              const tempPath = `${FileSystem.documentDirectory}SQLite/iknowmymoney_temp.db`;

              // 1. Download from Google Drive
              await GoogleDriveService.downloadBackup(currentUser.accessToken, backup.id, tempPath);

              // 2. Safely close active connection
              await closeDatabase();

              // 3. Overwrite local SQLite db
              await FileSystem.copyAsync({
                from: tempPath,
                to: dbPath,
              });
              await FileSystem.deleteAsync(tempPath, { idempotent: true });

              // 4. Reopen database
              await getDatabase();

              Alert.alert('Restore Complete', 'Database restored successfully from Google Drive.');
            } catch (e: any) {
              console.error('Restore error', e);
              Alert.alert('Restore Failed', e?.message || 'Could not restore backup from Drive.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Connection Header - Wise Flat Card */}
        <View className="bg-white dark:bg-[#1B1E19] p-5 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-xl bg-[#E8EBE6] dark:bg-[#242921] items-center justify-center mr-3">
                <Cloud size={20} color="#0E0F0C" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2]">Google Drive</Text>
                <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-medium" numberOfLines={1}>
                  {currentUser ? `Connected as ${currentUser.email}` : 'Not connected'}
                </Text>
              </View>
            </View>

            {currentUser ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSignOut}
                className="flex-row items-center bg-[#F4F6F2] dark:bg-[#242921] border border-[#D5D8CF] dark:border-[#2B3028] px-3 py-1.5 rounded-full"
              >
                <LogOut size={13} color="#0E0F0C" className="mr-1" />
                <Text className="text-xs font-black text-[#0E0F0C] dark:text-[#F4F6F2] ml-1">Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!request}
                onPress={() => promptAsync()}
                className="flex-row items-center bg-[#9FE870] border border-[#86D454] px-3.5 py-1.5 rounded-full"
              >
                <LogIn size={14} color="#0E0F0C" className="mr-1" />
                <Text className="text-xs font-black text-[#0E0F0C] ml-1 uppercase">Connect</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] leading-relaxed">
            Data stays 100% on this phone. Use the button below to upload an encrypted backup
            directly to your private Google Drive whenever you want.
          </Text>

          {lastDriveBackup && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-[#E8EBE6] dark:border-[#2B3028]">
              <Clock size={14} color="#054D28" className="mr-1.5" />
              <Text className="text-xs font-bold text-[#054D28] dark:text-[#4ADE80] ml-1">
                Last synced to Drive: {formatDateTime(lastDriveBackup)}
              </Text>
            </View>
          )}
        </View>

        {/* Manual Backup Now Action */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleManualBackup}
          disabled={isUploading}
          className="w-full py-4 bg-[#9FE870] rounded-full items-center justify-center flex-row border border-[#86D454] mb-5"
        >
          {isUploading ? (
            <>
              <ActivityIndicator size="small" color="#0E0F0C" className="mr-2" />
              <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">Uploading to Google Drive...</Text>
            </>
          ) : (
            <>
              <UploadCloud size={18} color="#0E0F0C" strokeWidth={2.8} className="mr-2" />
              <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">Backup Now to Google Drive</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Available Backups on Drive */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2 px-1">
            <Text className="text-xs font-black uppercase tracking-widest text-[#0E0F0C] dark:text-[#F4F6F2]">
              Available Drive Backups
            </Text>
            <TouchableOpacity onPress={() => fetchRemoteBackups()} className="p-1">
              <RefreshCw size={14} color="#0E0F0C" />
            </TouchableOpacity>
          </View>

          {loadingList ? (
            <View className="bg-white dark:bg-[#1B1E19] p-6 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] items-center justify-center">
              <ActivityIndicator size="small" color="#0E0F0C" />
              <Text className="text-xs font-bold text-[#868685] mt-2">Checking Google Drive...</Text>
            </View>
          ) : backups.length === 0 ? (
            <View className="bg-white dark:bg-[#1B1E19] p-6 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] items-center justify-center">
              <FileText size={26} color="#868685" className="mb-2" />
              <Text className="text-xs font-black text-[#0E0F0C] dark:text-[#F4F6F2]">No remote backups found</Text>
              <Text className="text-[11px] text-[#868685] text-center mt-1 font-medium">
                Tap "Backup Now" above to upload your first snapshot.
              </Text>
            </View>
          ) : (
            <View className="bg-white dark:bg-[#1B1E19] rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028] overflow-hidden">
              {backups.map((b) => (
                <View
                  key={b.id}
                  className="flex-row items-center justify-between p-3.5 border-b border-[#E8EBE6] dark:border-[#2B3028]"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-xs font-bold text-[#0E0F0C] dark:text-[#F4F6F2]" numberOfLines={1}>
                      {b.name}
                    </Text>
                    <Text className="text-[11px] text-[#868685] font-medium mt-0.5">
                      {formatDateTime(new Date(b.createdTime).getTime())} • {Math.round(b.size / 1024)} KB
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleRestoreBackup(b)}
                    className="flex-row items-center px-3 py-1.5 bg-[#F4F6F2] dark:bg-[#242921] border border-[#D5D8CF] dark:border-[#2B3028] rounded-full"
                  >
                    <Download size={12} color="#0E0F0C" className="mr-1" />
                    <Text className="text-xs font-black text-[#0E0F0C] dark:text-[#F4F6F2] ml-1">Restore</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Privacy badge */}
        <View className="flex-row items-center justify-center mt-4">
          <ShieldCheck size={14} color="#054D28" className="mr-1" />
          <Text className="text-xs text-[#868685] font-medium ml-1">
            Scoped to <Text className="font-bold text-[#0E0F0C] dark:text-[#F4F6F2]">drive.file</Text> — only files created by this app can be accessed.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
