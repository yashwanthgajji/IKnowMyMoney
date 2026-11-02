export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'wallet' | 'bank' | 'card' | 'savings' | 'loan' | 'investment';

export type CategoryType = 'expense' | 'income';

export type BudgetPeriod = 'monthly' | 'yearly';

export type RecurrenceFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'yearly' | 'custom';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  initial_balance: number; // in cents
  is_asset: number; // 1 = asset, 0 = liability
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface AccountWithBalance extends Account {
  current_balance: number; // computed in cents
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: number;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface Transaction {
  id: number;
  amount: number; // in cents
  type: TransactionType;
  category_id: number | null;
  account_id: number;
  to_account_id: number | null;
  date: number; // epoch ms
  note: string;
  recurring_id: number | null;
  created_at: number;
  updated_at: number;
}

export interface TransactionWithDetails extends Transaction {
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  account_name: string;
  account_icon: string;
  to_account_name?: string;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  budget_amount: number | null; // in cents, optional budget
  created_at: number;
}

export interface TagWithStats extends Tag {
  transaction_count: number;
  total_amount: number; // in cents, sum of expenses
  last_used_date: number | null;
  budget_progress?: number; // 0-100+ percentage
}

export interface Budget {
  id: number;
  category_id: number;
  amount: number; // in cents
  period: BudgetPeriod;
  start_date: number;
  created_at: number;
  updated_at: number;
}

export interface BudgetWithDetails extends Budget {
  category_name: string;
  category_icon: string;
  category_color: string;
  spent_amount: number; // in cents for current period
}

export interface RecurringTransaction {
  id: number;
  amount: number;
  type: TransactionType;
  category_id: number | null;
  account_id: number;
  to_account_id: number | null;
  note: string;
  frequency: RecurrenceFrequency;
  custom_interval_days: number | null;
  start_date: number;
  end_date: number | null;
  last_generated_date: number | null;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface DriveBackupMeta {
  id: number;
  drive_file_id: string;
  file_name: string;
  file_size_bytes: number;
  db_version: number;
  created_at: number;
}

export interface CategorySpendSummary {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number; // in cents
  percentage: number;
}
