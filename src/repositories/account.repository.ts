import { getDatabase } from '../db/database';
import { Account, AccountWithBalance } from '../types';

export const AccountRepository = {
  async getAllWithBalances(): Promise<AccountWithBalance[]> {
    const db = await getDatabase();
    
    // Compute real balance directly using SQLite aggregation
    const query = `
      SELECT 
        a.*,
        (
          a.initial_balance +
          COALESCE((
            SELECT SUM(t.amount) 
            FROM transactions t 
            WHERE t.account_id = a.id AND t.type = 'income'
          ), 0) -
          COALESCE((
            SELECT SUM(t.amount) 
            FROM transactions t 
            WHERE t.account_id = a.id AND t.type = 'expense'
          ), 0) +
          COALESCE((
            SELECT SUM(t.amount) 
            FROM transactions t 
            WHERE t.to_account_id = a.id AND t.type = 'transfer'
          ), 0) -
          COALESCE((
            SELECT SUM(t.amount) 
            FROM transactions t 
            WHERE t.account_id = a.id AND t.type = 'transfer'
          ), 0)
        ) AS current_balance
      FROM accounts a
      ORDER BY a.sort_order ASC, a.created_at ASC;
    `;

    const results = await db.getAllAsync<AccountWithBalance>(query);
    return results;
  },

  async getById(id: number): Promise<AccountWithBalance | null> {
    const db = await getDatabase();
    const query = `
      SELECT 
        a.*,
        (
          a.initial_balance +
          COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.account_id = a.id AND t.type = 'income'), 0) -
          COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.account_id = a.id AND t.type = 'expense'), 0) +
          COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.to_account_id = a.id AND t.type = 'transfer'), 0) -
          COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.account_id = a.id AND t.type = 'transfer'), 0)
        ) AS current_balance
      FROM accounts a
      WHERE a.id = ?;
    `;
    const result = await db.getFirstAsync<AccountWithBalance>(query, [id]);
    return result || null;
  },

  async create(data: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const db = await getDatabase();
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT INTO accounts (name, type, icon, color, initial_balance, is_asset, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.name,
        data.type,
        data.icon,
        data.color,
        data.initial_balance,
        data.is_asset,
        data.sort_order || 0,
        now,
        now,
      ]
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: Partial<Omit<Account, 'id' | 'created_at'>>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
    if (data.initial_balance !== undefined) { fields.push('initial_balance = ?'); values.push(data.initial_balance); }
    if (data.is_asset !== undefined) { fields.push('is_asset = ?'); values.push(data.is_asset); }
    if (data.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(data.sort_order); }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?;`, values);
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM accounts WHERE id = ?;', [id]);
  },

  async getTotalBalance(): Promise<number> {
    const accounts = await this.getAllWithBalances();
    return accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  },

  async getNetWorth(): Promise<{ assets: number; liabilities: number; netWorth: number }> {
    const accounts = await this.getAllWithBalances();
    let total = 0;

    for (const acc of accounts) {
      total += acc.current_balance;
    }

    return {
      assets: total,
      liabilities: 0,
      netWorth: total,
    };
  },
};
