import { getDatabase } from '../db/database';
import { Budget, BudgetWithDetails } from '../types';

export const BudgetRepository = {
  async getAllWithSpent(start: number, end: number): Promise<BudgetWithDetails[]> {
    const db = await getDatabase();
    const query = `
      SELECT 
        b.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        COALESCE((
          SELECT SUM(t.amount)
          FROM transactions t
          WHERE t.category_id = b.category_id
            AND t.type = 'expense'
            AND t.date >= ? AND t.date <= ?
        ), 0) AS spent_amount
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      ORDER BY b.amount DESC;
    `;
    return await db.getAllAsync<BudgetWithDetails>(query, [start, end]);
  },

  async getById(id: number): Promise<Budget | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Budget>(
      'SELECT * FROM budgets WHERE id = ?;',
      [id]
    );
    return result || null;
  },

  async create(data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const db = await getDatabase();
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT INTO budgets (category_id, amount, period, start_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [data.category_id, data.amount, data.period || 'monthly', data.start_date || now, now, now]
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: Partial<Omit<Budget, 'id' | 'created_at'>>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
    if (data.period !== undefined) { fields.push('period = ?'); values.push(data.period); }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(`UPDATE budgets SET ${fields.join(', ')} WHERE id = ?;`, values);
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM budgets WHERE id = ?;', [id]);
  },
};
