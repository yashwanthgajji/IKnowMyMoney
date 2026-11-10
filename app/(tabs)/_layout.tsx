import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import {
  Home,
  Receipt,
  Wallet,
  Target,
  BarChart3,
  Settings,
  Tags,
} from 'lucide-react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: isDark ? '#121411' : '#E8EBE6' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '900', fontSize: 19, color: isDark ? '#F4F6F2' : '#0E0F0C' },
        tabBarStyle: {
          backgroundColor: isDark ? '#1B1E19' : '#FFFFFF',
          borderTopColor: isDark ? '#2B3028' : '#D5D8CF',
          borderTopWidth: 1,
          height: 56 + Math.max(insets.bottom, 10),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarActiveTintColor: isDark ? '#9FE870' : '#0E0F0C',
        tabBarInactiveTintColor: isDark ? '#7E857B' : '#868685',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'IKnowMyMoney',
          headerRight: () => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/settings' as any)}
              className="mr-3 p-1.5 rounded-full"
            >
              <Settings size={21} color={isDark ? '#F4F6F2' : '#0E0F0C'} />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
          headerTitle: 'Transactions',
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          headerTitle: 'My Accounts',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          headerTitle: 'Budget Planner',
          tabBarIcon: ({ color, size }) => <Target color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Charts',
          headerTitle: 'Financial Analytics',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'Tags',
          headerTitle: 'Tags & Trips',
          tabBarIcon: ({ color, size }) => <Tags color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
