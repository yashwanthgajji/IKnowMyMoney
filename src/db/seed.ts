import { SQLiteDatabase } from 'expo-sqlite';

export async function seedInitialData(db: SQLiteDatabase): Promise<void> {
  const accountCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM accounts;'
  );

  const now = Date.now();

  if (!accountCount || accountCount.count === 0) {
    await db.runAsync(
      `INSERT INTO accounts (name, type, icon, color, initial_balance, is_asset, sort_order, created_at, updated_at) VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'Cash Wallet', 'wallet', 'Wallet', '#047857', 0, 1, 0, now, now,
        'Main Checking', 'bank', 'Landmark', '#1D4ED8', 0, 1, 1, now, now
      ]
    );
  }

  const categoryCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories;'
  );

  if (!categoryCount || categoryCount.count === 0) {
    const expenseCategories = [
      ['Food & Dining', 'expense', 'Utensils', '#E11D48', 1, 0],
      ['Groceries', 'expense', 'ShoppingBag', '#D97706', 1, 1],
      ['Transportation', 'expense', 'Car', '#2563EB', 1, 2],
      ['Bills & Utilities', 'expense', 'Receipt', '#7C3AED', 1, 3],
      ['Entertainment', 'expense', 'Film', '#DB2777', 1, 4],
      ['Healthcare', 'expense', 'HeartPulse', '#059669', 1, 5],
      ['Education', 'expense', 'GraduationCap', '#4F46E5', 1, 6],
      ['Personal Care', 'expense', 'Sparkles', '#0D9488', 1, 7],
      ['Housing', 'expense', 'Home', '#B45309', 1, 8],
      ['Other Expense', 'expense', 'CircleEllipsis', '#6B7280', 1, 9],
    ];

    const incomeCategories = [
      ['Salary', 'income', 'Briefcase', '#047857', 1, 0],
      ['Freelance', 'income', 'Laptop', '#0284C7', 1, 1],
      ['Investments', 'income', 'TrendingUp', '#65A30D', 1, 2],
      ['Gift / Allowance', 'income', 'Gift', '#9333EA', 1, 3],
      ['Other Income', 'income', 'CircleDollarSign', '#4B5563', 1, 4],
    ];

    for (const [name, type, icon, color, isDefault, sortOrder] of [...expenseCategories, ...incomeCategories]) {
      await db.runAsync(
        `INSERT INTO categories (name, type, icon, color, is_default, sort_order, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [name, type, icon, color, isDefault, sortOrder, now, now]
      );
    }
  }
}
