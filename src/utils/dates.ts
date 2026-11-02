import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isToday,
  isYesterday,
  subMonths,
  addMonths,
} from 'date-fns';

export function getMonthBounds(date: Date = new Date()): { start: number; end: number } {
  return {
    start: startOfMonth(date).getTime(),
    end: endOfMonth(date).getTime(),
  };
}

export function getYearBounds(date: Date = new Date()): { start: number; end: number } {
  return {
    start: startOfYear(date).getTime(),
    end: endOfYear(date).getTime(),
  };
}

export function formatDateHeading(epochMs: number): string {
  const date = new Date(epochMs);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d, yyyy');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function formatShortDate(epochMs: number): string {
  return format(new Date(epochMs), 'MMM d');
}

export function formatDateTime(epochMs: number): string {
  return format(new Date(epochMs), 'MMM d, yyyy h:mm a');
}

export function formatTimeOnly(epochMs: number): string {
  return format(new Date(epochMs), 'h:mm a');
}

export function formatDateFull(epochMs: number): string {
  return format(new Date(epochMs), 'EEE, MMM d, yyyy');
}

export function formatDateTimeBadge(epochMs: number): string {
  const d = new Date(epochMs);
  const timeStr = format(d, 'h:mm a');
  if (isToday(d)) return `Today, ${timeStr}`;
  if (isYesterday(d)) return `Yesterday, ${timeStr}`;
  return `${format(d, 'MMM d')}, ${timeStr}`;
}

export interface DateGroup<T> {
  heading: string;
  dateKey: string;
  items: T[];
  totalExpense: number;
}

export function groupTransactionsByDate(
  transactions: { date: number; amount: number; type: string }[]
): DateGroup<any>[] {
  const groups: DateGroup<any>[] = [];
  const map = new Map<string, DateGroup<any>>();

  for (const txn of transactions) {
    const d = new Date(txn.date);
    const dateKey = format(d, 'yyyy-MM-dd');
    let group = map.get(dateKey);
    if (!group) {
      group = {
        heading: formatDateHeading(txn.date),
        dateKey,
        items: [],
        totalExpense: 0,
      };
      map.set(dateKey, group);
      groups.push(group);
    }
    group.items.push(txn);
    if (txn.type === 'expense') {
      group.totalExpense += txn.amount;
    }
  }

  return groups;
}

export { subMonths, addMonths };
