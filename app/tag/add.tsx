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
import { Check, Trash2, Tag as TagIcon } from 'lucide-react-native';
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
        // For new tags, get count to preview next assigned color
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Color & Icon Preview Banner */}
        <View className="items-center my-4">
          <View
            style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}
            className="w-16 h-16 rounded-2xl border items-center justify-center mb-2"
          >
            <View style={{ backgroundColor: color }} className="w-6 h-6 rounded-full" />
          </View>
          <Text className="text-xs text-gray-400 font-medium">
            {isEditing ? 'Tag Color' : 'Auto-assigned Color'}
          </Text>
        </View>

        {/* Tag Name Input */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Tag Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. LV Trip, Costco, Me, AllState"
            placeholderTextColor="#9CA3AF"
            maxLength={30}
            className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-sm text-gray-800"
          />
          <Text className="text-[10px] text-gray-400 mt-1 text-right">
            {name.length}/30 characters
          </Text>
        </View>

        {/* Optional Budget Input */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Budget Target (Optional)
            </Text>
            <Text className="text-[11px] text-emerald-700 font-medium">For trips & events</Text>
          </View>
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <Text className="text-sm font-semibold text-gray-500 mr-2">
              {currencySymbol}
            </Text>
            <TextInput
              value={budgetStr}
              onChangeText={setBudgetStr}
              placeholder="0.00 (leave empty for no budget)"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              className="flex-1 text-sm text-gray-800"
            />
          </View>
          <Text className="text-[11px] text-gray-400 mt-1">
            Setting a budget gives you a spending progress bar for this tag.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          className="w-full py-3.5 bg-emerald-700 rounded-xl items-center justify-center flex-row shadow-sm"
        >
          <Check size={18} color="#FFFFFF" className="mr-2" />
          <Text className="text-white text-sm font-bold">
            {isEditing ? 'Save Changes' : 'Create Tag'}
          </Text>
        </TouchableOpacity>

        {/* Delete Button (Editing only) */}
        {isEditing && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDelete}
            className="w-full py-3.5 mt-3 bg-red-50 rounded-xl items-center justify-center flex-row border border-red-200"
          >
            <Trash2 size={16} color="#DC2626" className="mr-2" />
            <Text className="text-red-600 text-sm font-bold">Delete Tag</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
