import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { getDatabase } from '../src/db/database';
import { useSettingsStore } from '../src/stores/settings.store';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    async function init() {
      try {
        await getDatabase();
        await loadSettings();
        setIsReady(true);
      } catch (e) {
        console.error('Failed to initialize app', e);
        setIsReady(true);
      }
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#047857" />
        <Text className="mt-4 text-sm font-semibold text-gray-700">
          Loading IKnowMyMoney...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? '#1B1E19' : '#FFFFFF' },
          headerTintColor: isDark ? '#F4F6F2' : '#0E0F0C',
          headerTitleStyle: { fontWeight: '800', fontSize: 18, color: isDark ? '#F4F6F2' : '#0E0F0C' },
          contentStyle: { backgroundColor: isDark ? '#121411' : '#E8EBE6' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction/add"
          options={{
            presentation: 'modal',
            title: 'Add Transaction',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="transaction/[id]"
          options={{
            presentation: 'card',
            title: 'Edit Transaction',
          }}
        />
        <Stack.Screen
          name="account/add"
          options={{
            presentation: 'modal',
            title: 'Add Account',
          }}
        />
        <Stack.Screen
          name="account/[id]"
          options={{
            presentation: 'card',
            title: 'Account Details',
          }}
        />
        <Stack.Screen
          name="category/index"
          options={{
            title: 'Categories',
          }}
        />
        <Stack.Screen
          name="category/add"
          options={{
            presentation: 'modal',
            title: 'Add Category',
          }}
        />
        <Stack.Screen
          name="budget/add"
          options={{
            presentation: 'modal',
            title: 'Add Budget',
          }}
        />
        <Stack.Screen
          name="tag/add"
          options={{
            presentation: 'modal',
            title: 'Tag',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'card',
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="backup/local"
          options={{
            title: 'Local Backup & Restore',
          }}
        />
        <Stack.Screen
          name="backup/drive"
          options={{
            title: 'Google Drive Backup',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
