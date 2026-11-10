import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';

interface SettingsState {
  currencySymbol: string;
  decimalPlaces: number;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  lastDriveBackup: number | null;
  lastLocalBackup: number | null;
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  setCurrencySymbol: (symbol: string) => Promise<void>;
  setDecimalPlaces: (places: number) => Promise<void>;
  setDateFormat: (format: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  setLastDriveBackup: (timestamp: number) => Promise<void>;
  setLastLocalBackup: (timestamp: number) => Promise<void>;
}

const STORAGE_KEY = '@iknowmymoney_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  currencySymbol: '$',
  decimalPlaces: 2,
  dateFormat: 'MM/dd/yyyy',
  theme: 'system',
  lastDriveBackup: null,
  lastLocalBackup: null,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ ...parsed, isLoaded: true });
        if (parsed.theme) {
          colorScheme.set(parsed.theme);
        }
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.error('Failed to load settings', e);
      set({ isLoaded: true });
    }
  },

  setCurrencySymbol: async (currencySymbol: string) => {
    set({ currencySymbol });
    const current = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  },

  setDecimalPlaces: async (decimalPlaces: number) => {
    set({ decimalPlaces });
    const current = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  },

  setDateFormat: async (dateFormat: string) => {
    set({ dateFormat });
    const current = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  },

  setTheme: async (theme: 'light' | 'dark' | 'system') => {
    colorScheme.set(theme);
    set({ theme });
    const current = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  },

  setLastDriveBackup: async (lastDriveBackup: number) => {
    set({ lastDriveBackup });
    const current = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  },

  setLastLocalBackup: async (lastLocalBackup: number) => {
    set({ lastLocalBackup });
    const current = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  },
}));
