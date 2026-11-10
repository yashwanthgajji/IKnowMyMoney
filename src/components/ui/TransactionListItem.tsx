import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeftRight } from 'lucide-react-native';
import { TransactionWithDetails } from '../../types';
import { formatCurrency } from '../../utils/money';
import { formatDateTimeBadge } from '../../utils/dates';
import { DynamicIcon } from './DynamicIcon';
import { TagChip } from './TagChip';

interface TransactionListItemProps {
  transaction: TransactionWithDetails;
  currencySymbol: string;
  onPress: () => void;
}

export function TransactionListItem({
  transaction,
  currencySymbol,
  onPress,
}: TransactionListItemProps) {
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const amountColor = isIncome
    ? 'text-[#054D28] dark:text-[#4ADE80]'
    : isTransfer
    ? 'text-[#1D4ED8] dark:text-[#60A5FA]'
    : 'text-[#A7000D] dark:text-[#F87171]';

  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-';

  const title = isTransfer
    ? `Transfer → ${transaction.to_account_name || 'Account'}`
    : transaction.category_name || 'Uncategorized';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between py-3.5 px-4 bg-white dark:bg-[#1B1E19] border-b border-[#E8EBE6] dark:border-[#2B3028]"
    >
      <View className="flex-row items-center flex-1 mr-3">
        {/* Category / Transfer Icon */}
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{
            backgroundColor: isTransfer
              ? '#DBEAFE'
              : transaction.category_color
              ? `${transaction.category_color}18`
              : '#F3F4F6',
          }}
        >
          {isTransfer ? (
            <ArrowLeftRight size={18} color="#1D4ED8" />
          ) : (
            <DynamicIcon
              name={transaction.category_icon || 'Tag'}
              size={18}
              color={transaction.category_color || '#454745'}
            />
          )}
        </View>

        {/* Text details */}
        <View className="flex-1">
          <Text
            className="text-sm font-bold text-[#0E0F0C] dark:text-[#F4F6F2]"
            numberOfLines={1}
          >
            {title}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Text
              className="text-xs text-[#5B5F5A] dark:text-[#A3A8A0] font-medium mr-2"
              numberOfLines={1}
            >
              {transaction.account_name}
            </Text>
            {transaction.note ? (
              <Text
                className="text-xs text-[#868685] italic flex-1"
                numberOfLines={1}
              >
                • {transaction.note.replace(/\n/g, ' ')}
              </Text>
            ) : null}
          </View>

          {/* Tag chips */}
          {transaction.tags && transaction.tags.length > 0 && (
            <View className="flex-row flex-wrap items-center mt-1">
              {transaction.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag.id} name={tag.name} color={tag.color} size="sm" />
              ))}
              {transaction.tags.length > 3 && (
                <Text className="text-[11px] text-[#868685] font-bold ml-1 mb-1">
                  +{transaction.tags.length - 3}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Amount and Date */}
      <View className="items-end">
        <Text className={`text-sm font-black ${amountColor} tracking-tight`}>
          {amountPrefix}
          {formatCurrency(transaction.amount, currencySymbol)}
        </Text>
        <Text className="text-xs text-[#868685] font-medium mt-0.5">
          {formatDateTimeBadge(transaction.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
