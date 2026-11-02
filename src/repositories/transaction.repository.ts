import { getDatabase } from '../db/database';
import {
  Transaction,
  TransactionWithDetails,
  TransactionType,
  CategorySpendSummary,
} from '../types';
import { TagRepository } from './tag.repository';

export const TransactionRepository = {
  async getRecent(limit: number = 20): Promise<TransactionWithDetails[]> {
    const db = await getDatabase();
    const query = `
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        a.name AS account_name,
        a.icon AS account_icon,
        toa.name AS to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts toa ON t.to_account_id = toa.id
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT ?;
    `;
    const txns = await db.getAllAsync<TransactionWithDetails>(query, [limit]);
    if (txns.length === 0) return [];

    const tagMap = await TagRepository.getTagsForTransactions(txns.map((t) => t.id));
    return txns.map((t) => ({
      ...t,
      tags: tagMap.get(t.id) || [],
    }));
  },

  async getByDateRange(
    start: number,
    end: number,
    type?: TransactionType
  ): Promise<TransactionWithDetails[]> {
    const db = await getDatabase();
    let query = `
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        a.name AS account_name,
        a.icon AS account_icon,
        toa.name AS to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts toa ON t.to_account_id = toa.id
      WHERE t.date >= ? AND t.date <= ?
    `;

    const params: any[] = [start, end];

    if (type) {
      query += ` AND t.type = ?`;
      params.push(type);
    }

    query += ` ORDER BY t.date DESC, t.created_at DESC;`;

    const txns = await db.getAllAsync<TransactionWithDetails>(query, params);
    if (txns.length === 0) return [];

    const tagMap = await TagRepository.getTagsForTransactions(txns.map((t) => t.id));
    return txns.map((t) => ({
      ...t,
      tags: tagMap.get(t.id) || [],
    }));
  },

  async getById(id: number): Promise<TransactionWithDetails | null> {
    const db = await getDatabase();
    const query = `
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        a.name AS account_name,
        a.icon AS account_icon,
        toa.name AS to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts toa ON t.to_account_id = toa.id
      WHERE t.id = ?;
    `;
    const result = await db.getFirstAsync<TransactionWithDetails>(query, [id]);
    if (!result) return null;

    const tags = await TagRepository.getTagsForTransaction(id);
    return {
      ...result,
      tags,
    };
  },

  async getByAccountId(accountId: number): Promise<TransactionWithDetails[]> {
    const db = await getDatabase();
    const query = `
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        a.name AS account_name,
        a.icon AS account_icon,
        toa.name AS to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts toa ON t.to_account_id = toa.id
      WHERE t.account_id = ? OR t.to_account_id = ?
      ORDER BY t.date DESC, t.created_at DESC;
    `;
    const txns = await db.getAllAsync<TransactionWithDetails>(query, [accountId, accountId]);
    if (txns.length === 0) return [];

    const tagMap = await TagRepository.getTagsForTransactions(txns.map((t) => t.id));
    return txns.map((t) => ({
      ...t,
      tags: tagMap.get(t.id) || [],
    }));
  },

  async search(queryText: string): Promise<TransactionWithDetails[]> {
    const db = await getDatabase();
    const query = `
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        a.name AS account_name,
        a.icon AS account_icon,
        toa.name AS to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts toa ON t.to_account_id = toa.id
      WHERE t.note LIKE ? 
         OR c.name LIKE ? 
         OR a.name LIKE ?
         OR EXISTS (
            SELECT 1 FROM transaction_tags tt
            JOIN tags tg ON tg.id = tt.tag_id
            WHERE tt.transaction_id = t.id AND tg.name LIKE ?
         )
      ORDER BY t.date DESC, t.created_at DESC;
    `;
    const searchPattern = `%${queryText}%`;
    const txns = await db.getAllAsync<TransactionWithDetails>(query, [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    ]);
    if (txns.length === 0) return [];

    const tagMap = await TagRepository.getTagsForTransactions(txns.map((t) => t.id));
    return txns.map((t) => ({
      ...t,
      tags: tagMap.get(t.id) || [],
    }));
  },

  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const db = await getDatabase();
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT INTO transactions (amount, type, category_id, account_id, to_account_id, date, note, recurring_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.amount,
        data.type,
        data.category_id,
        data.account_id,
        data.to_account_id,
        data.date,
        data.note || '',
        data.recurring_id || null,
        now,
        now,
      ]
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
    if (data.account_id !== undefined) { fields.push('account_id = ?'); values.push(data.account_id); }
    if (data.to_account_id !== undefined) { fields.push('to_account_id = ?'); values.push(data.to_account_id); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
    if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?;`, values);
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
  },

  async getTotalsForPeriod(
    start: number,
    end: number
  ): Promise<{ income: number; expense: number; net: number }> {
    const db = await getDatabase();
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
      FROM transactions
      WHERE date >= ? AND date <= ?;
    `;
    const result = await db.getFirstAsync<{ income: number; expense: number }>(query, [
      start,
      end,
    ]);

    const income = result ? result.income : 0;
    const expense = result ? result.expense : 0;

    return {
      income,
      expense,
      net: income - expense,
    };
  },

  async getCategorySpendSummary(
    start: number,
    end: number,
    type: 'expense' | 'income' = 'expense'
  ): Promise<CategorySpendSummary[]> {
    const db = await getDatabase();
    const query = `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        SUM(t.amount) AS total_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = ? AND t.date >= ? AND t.date <= ?
      GROUP BY c.id
      ORDER BY total_amount DESC;
    `;

    const rows = await db.getAllAsync<{
      category_id: number;
      category_name: string;
      category_icon: string;
      category_color: string;
      total_amount: number;
    }>(query, [type, start, end]);

    const totalSum = rows.reduce((acc, curr) => acc + curr.total_amount, 0);

    return rows.map((r) => ({
      ...r,
      percentage: totalSum > 0 ? Math.round((r.total_amount / totalSum) * 100) : 0,
    }));
  },
};
