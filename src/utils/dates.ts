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

export { subMonths, addMonths };
