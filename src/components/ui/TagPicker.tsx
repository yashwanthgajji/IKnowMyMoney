import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Plus, X, Search, Check, Tag as TagIcon } from 'lucide-react-native';
import { Tag } from '../../types';
import { TagRepository } from '../../repositories/tag.repository';
import { TagChip } from './TagChip';

interface TagPickerProps {
  selectedTagIds: number[];
  onTagsChange: (tagIds: number[]) => void;
  maxTags?: number;
}

export function TagPicker({
  selectedTagIds,
  onTagsChange,
  maxTags = 10,
}: TagPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadTags = useCallback(async () => {
    try {
      const tags = await TagRepository.getAll();
      setAllTags(tags);
    } catch (e) {
      console.error('Failed to load tags', e);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags, modalVisible]);

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));
  const unselectedTags = allTags.filter((t) => !selectedTagIds.includes(t.id));

  // Quick suggestions (first 4 unselected)
  const quickSuggestions = unselectedTags.slice(0, 4);

  const handleToggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      if (selectedTagIds.length >= maxTags) {
        Alert.alert('Tag Limit Reached', `You can add up to ${maxTags} tags per transaction.`);
        return;
      }
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleQuickCreateTag = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Check duplicate
    const exists = allTags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      handleToggleTag(exists.id);
      setSearchQuery('');
      return;
    }

    try {
      setIsCreating(true);
      const newId = await TagRepository.create({ name: trimmed });
      await loadTags();
      setSearchQuery('');
      if (selectedTagIds.length < maxTags) {
        onTagsChange([...selectedTagIds, newId]);
      }
    } catch (e) {
      console.error('Failed to create tag', e);
      Alert.alert('Error', 'Failed to create tag');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTags = allTags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const exactMatchExists = allTags.some(
    (t) => t.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  return (
    <View className="px-4 mt-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Tags ({selectedTagIds.length}/{maxTags})
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center"
        >
          <Plus size={14} color="#047857" />
          <Text className="text-xs font-semibold text-emerald-700 ml-1">
            {selectedTagIds.length === 0 ? 'Add Tags' : 'Manage'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Tags list */}
      <View className="flex-row flex-wrap items-center">
        {selectedTags.map((tag) => (
          <TagChip
            key={tag.id}
            name={tag.name}
            color={tag.color}
            selected
            onRemove={() => handleToggleTag(tag.id)}
          />
        ))}

        {selectedTags.length === 0 && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-row items-center px-3 py-1.5 rounded-full border border-dashed border-gray-300 bg-gray-50 mr-2 mb-2"
          >
            <TagIcon size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 font-medium ml-1.5">
              + Tag (e.g. Costco, Trip, Me)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Suggestions below picker */}
      {quickSuggestions.length > 0 && selectedTagIds.length < maxTags && (
        <View className="flex-row flex-wrap items-center mt-1">
          <Text className="text-[11px] text-gray-400 mr-2 mb-1.5">Suggested:</Text>
          {quickSuggestions.map((tag) => (
            <TagChip
              key={tag.id}
              name={tag.name}
              color={tag.color}
              size="sm"
              onPress={() => handleToggleTag(tag.id)}
            />
          ))}
        </View>
      )}

      {/* Modal / Sheet for selecting & creating tags */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%] pt-4 pb-8 px-5">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
              <View>
                <Text className="text-lg font-bold text-gray-900">Select Tags</Text>
                <Text className="text-xs text-gray-500">
                  {selectedTagIds.length} of {maxTags} selected
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-2 rounded-full bg-gray-100"
              >
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search / Quick Create Input */}
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mt-4 mb-3">
              <Search size={16} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search or type a new tag..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-sm text-gray-800 py-1"
                returnKeyType="done"
                onSubmitEditing={handleQuickCreateTag}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Create Prompt if query doesn't match exactly */}
            {searchQuery.trim().length > 0 && !exactMatchExists && (
              <TouchableOpacity
                onPress={handleQuickCreateTag}
                disabled={isCreating}
                className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 mb-3"
              >
                <Plus size={16} color="#047857" />
                <Text className="text-xs font-semibold text-emerald-800 ml-2">
                  Create new tag "{searchQuery.trim()}"
                </Text>
              </TouchableOpacity>
            )}

            {/* Tags Grid / List */}
            <ScrollView className="max-h-72 mt-1">
              <View className="flex-row flex-wrap pt-1">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      activeOpacity={0.7}
                      onPress={() => handleToggleTag(tag.id)}
                      style={{
                        backgroundColor: isSelected ? tag.color : `${tag.color}15`,
                        borderColor: isSelected ? tag.color : `${tag.color}40`,
                      }}
                      className="flex-row items-center px-3.5 py-2 rounded-xl border mr-2 mb-2"
                    >
                      <View
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : tag.color }}
                        className="w-2 h-2 rounded-full mr-2"
                      />
                      <Text
                        style={{ color: isSelected ? '#FFFFFF' : tag.color }}
                        className="text-xs font-semibold mr-1.5"
                      >
                        {tag.name}
                      </Text>
                      {isSelected && <Check size={14} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}

                {filteredTags.length === 0 && searchQuery.trim().length === 0 && (
                  <View className="py-8 items-center w-full">
                    <Text className="text-sm text-gray-400">No tags created yet</Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      Type above to create your first tag (e.g. Costco, Trip)
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Done Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-emerald-700 rounded-xl py-3.5 items-center mt-4"
            >
              <Text className="text-white font-bold text-sm">
                Done ({selectedTagIds.length} Selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
