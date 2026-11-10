import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, Trash2 } from 'lucide-react-native';
import { TagRepository, TAG_PALETTE } from '../../src/repositories/tag.repository';
import { useSettingsStore } from '../../src/stores/settings.store';
import { parseAmountToCents, centsToInputValue } from '../../src/utils/money';

export default function TagFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const [name, setName] = useState('');
  const [budgetStr, setBudgetStr] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    async function loadTag() {
      if (!id) {
        try {
          const all = await TagRepository.getAll();
          setColor(TAG_PALETTE[all.length % TAG_PALETTE.length]);
        } catch (e) {
          // ignore
        }
        return;
      }

      try {
        const tag = await TagRepository.getById(parseInt(id, 10));
        if (!tag) {
          Alert.alert('Not Found', 'Tag not found');
          router.back();
          return;
        }
        setName(tag.name);
        setColor(tag.color);
        if (tag.budget_amount && tag.budget_amount > 0) {
          setBudgetStr(centsToInputValue(tag.budget_amount));
        }
      } catch (e) {
        console.error('Failed to load tag', e);
      } finally {
        setLoading(false);
      }
    }

    loadTag();
  }, [id]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Tag Name Required', 'Please enter a name for the tag.');
      return;
    }

    if (trimmed.length > 30) {
      Alert.alert('Name Too Long', 'Tag name must be 30 characters or less.');
      return;
    }

    let budgetAmount: number | null = null;
    if (budgetStr.trim().length > 0) {
      const parsed = parseAmountToCents(budgetStr);
      if (parsed > 0) {
        budgetAmount = parsed;
      }
    }

    try {
      if (isEditing) {
        await TagRepository.update(parseInt(id!, 10), {
          name: trimmed,
          budget_amount: budgetAmount,
        });
      } else {
        await TagRepository.create({
          name: trimmed,
          budget_amount: budgetAmount,
        });
      }
      router.back();
    } catch (e: any) {
      console.error('Failed to save tag', e);
      if (e?.message?.includes('UNIQUE')) {
        Alert.alert('Tag Already Exists', `A tag named "${trimmed}" already exists.`);
      } else {
        Alert.alert('Error', 'Failed to save tag.');
      }
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete Tag',
      `Delete "${name}"? It will be removed from all associated transactions. Transactions will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TagRepository.delete(parseInt(id, 10));
              router.back();
            } catch (e) {
              console.error('Failed to delete tag', e);
              Alert.alert('Error', 'Failed to delete tag');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#E8EBE6] dark:bg-[#121411] items-center justify-center">
        <Text className="text-xs font-bold text-[#868685]">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-[#E8EBE6] dark:bg-[#121411]">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Color & Icon Preview Banner */}
        <View className="items-center my-4">
          <View
            style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}
            className="w-16 h-16 rounded-2xl border items-center justify-center mb-2"
          >
            <View style={{ backgroundColor: color }} className="w-5 h-5 rounded-full" />
          </View>
          <Text className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-black uppercase tracking-wider">
            {isEditing ? 'Tag Color' : 'Auto-assigned Color'}
          </Text>
        </View>

        {/* Tag Name Input */}
        <View className="mb-4 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest mb-1.5">
            Tag Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. LV Trip, Costco, Me, AllState"
            placeholderTextColor="#868685"
            maxLength={30}
            className="bg-[#F4F6F2] dark:bg-[#242921] rounded-xl px-4 py-3 border border-[#D5D8CF] dark:border-[#2B3028] text-xs font-bold text-[#0E0F0C] dark:text-[#F4F6F2]"
          />
          <Text className="text-[10px] text-[#868685] font-bold mt-1 text-right">
            {name.length}/30 characters
          </Text>
        </View>

        {/* Optional Budget Input */}
        <View className="mb-6 bg-white dark:bg-[#1B1E19] p-4 rounded-2xl border border-[#D5D8CF] dark:border-[#2B3028]">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-black text-[#5B5F5A] dark:text-[#A3A8A0] uppercase tracking-widest">
              Budget Target (Optional)
            </Text>
            <Text className="text-[11px] text-[#054D28] dark:text-[#4ADE80] font-black">For trips & events</Text>
          </View>
          <View className="flex-row items-center bg-[#F4F6F2] dark:bg-[#242921] rounded-xl px-4 py-3 border border-[#D5D8CF] dark:border-[#2B3028]">
            <Text className="text-sm font-black text-[#0E0F0C] dark:text-[#F4F6F2] mr-2">
              {currencySymbol}
            </Text>
            <TextInput
              value={budgetStr}
              onChangeText={setBudgetStr}
              placeholder="0.00 (leave empty for no budget)"
              placeholderTextColor="#868685"
              keyboardType="decimal-pad"
              className="flex-1 text-xs font-bold text-[#0E0F0C] dark:text-[#F4F6F2]"
            />
          </View>
          <Text className="text-[11px] text-[#868685] font-medium mt-1.5">
            Setting a budget gives you a spending progress bar for this tag.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          className="w-full py-4 bg-[#9FE870] rounded-full items-center justify-center flex-row border border-[#86D454]"
        >
          <Check size={18} color="#0E0F0C" strokeWidth={3} className="mr-2" />
          <Text className="text-[#0E0F0C] text-xs font-black uppercase tracking-wider">
            {isEditing ? 'Save Changes' : 'Create Tag'}
          </Text>
        </TouchableOpacity>

        {/* Delete Button (Editing only) */}
        {isEditing && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDelete}
            className="w-full py-3.5 mt-3 bg-red-50 dark:bg-red-950/30 rounded-full items-center justify-center flex-row border border-red-200 dark:border-red-900"
          >
            <Trash2 size={16} color="#A7000D" className="mr-2" />
            <Text className="text-[#A7000D] dark:text-[#F87171] text-xs font-black uppercase tracking-wider">Delete Tag</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
