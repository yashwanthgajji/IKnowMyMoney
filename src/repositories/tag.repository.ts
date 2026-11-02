import { getDatabase } from '../db/database';
import { Tag, TagWithStats, TransactionWithDetails } from '../types';

export const TAG_PALETTE = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
  '#14B8A6', // teal
  '#64748B', // slate
];

export const TagRepository = {
  async getAll(): Promise<Tag[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Tag>('SELECT * FROM tags ORDER BY name ASC;');
  },

  async getById(id: number): Promise<Tag | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Tag>('SELECT * FROM tags WHERE id = ?;', [id]);
    return result || null;
  },

  async create(data: { name: string; budget_amount?: number | null }): Promise<number> {
    const db = await getDatabase();
    const countResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tags;');
    const tagCount = countResult?.count ?? 0;
    const color = TAG_PALETTE[tagCount % TAG_PALETTE.length];
    const now = Date.now();

    const result = await db.runAsync(
      `INSERT INTO tags (name, color, budget_amount, created_at) VALUES (?, ?, ?, ?);`,
      [data.name.trim(), color, data.budget_amount ?? null, now]
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: { name?: string; budget_amount?: number | null }): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name.trim());
    }
    if (data.budget_amount !== undefined) {
      fields.push('budget_amount = ?');
      values.push(data.budget_amount);
    }

    if (fields.length > 0) {
      values.push(id);
      await db.runAsync(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?;`, values);
    }
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tags WHERE id = ?;', [id]);
  },

  async getTagsForTransaction(transactionId: number): Promise<Tag[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Tag>(
      `SELECT t.* FROM tags t
       JOIN transaction_tags tt ON t.id = tt.tag_id
       WHERE tt.transaction_id = ?
       ORDER BY t.name ASC;`,
      [transactionId]
    );
  },

  async getTagsForTransactions(transactionIds: number[]): Promise<Map<number, Tag[]>> {
    const tagMap = new Map<number, Tag[]>();
    if (transactionIds.length === 0) return tagMap;

    const db = await getDatabase();
    const placeholders = transactionIds.map(() => '?').join(',');
    const rows = await db.getAllAsync<{
      transaction_id: number;
      id: number;
      name: string;
      color: string;
      budget_amount: number | null;
      created_at: number;
    }>(
      `SELECT tt.transaction_id, t.*
       FROM tags t
       JOIN transaction_tags tt ON t.id = tt.tag_id
       WHERE tt.transaction_id IN (${placeholders})
       ORDER BY t.name ASC;`,
      transactionIds
    );

    for (const row of rows) {
      const tag: Tag = {
        id: row.id,
        name: row.name,
        color: row.color,
        budget_amount: row.budget_amount,
        created_at: row.created_at,
      };
      const existing = tagMap.get(row.transaction_id) ?? [];
      existing.push(tag);
      tagMap.set(row.transaction_id, existing);
    }

    return tagMap;
  },

  async setTransactionTags(transactionId: number, tagIds: number[]): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM transaction_tags WHERE transaction_id = ?;', [transactionId]);
    for (const tagId of tagIds) {
      await db.runAsync(
        'INSERT OR IGNORE INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?);',
        [transactionId, tagId]
      );
    }
  },

  async getWithStats(): Promise<TagWithStats[]> {
    const db = await getDatabase();
    const query = `
      SELECT 
        tg.id,
        tg.name,
        tg.color,
        tg.budget_amount,
        tg.created_at,
        COUNT(tt.transaction_id) AS transaction_count,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_amount,
        MAX(t.date) AS last_used_date
      FROM tags tg
      LEFT JOIN transaction_tags tt ON tg.id = tt.tag_id
      LEFT JOIN transactions t ON tt.transaction_id = t.id
      GROUP BY tg.id
      ORDER BY transaction_count DESC, tg.name ASC;
    `;
    const rows = await db.getAllAsync<{
      id: number;
      name: string;
      color: string;
      budget_amount: number | null;
      created_at: number;
      transaction_count: number;
      total_amount: number;
      last_used_date: number | null;
    }>(query);

    return rows.map((r) => {
      let budget_progress: number | undefined;
      if (r.budget_amount && r.budget_amount > 0) {
        budget_progress = Math.round((r.total_amount / r.budget_amount) * 100);
      }
      return {
        ...r,
        budget_progress,
      };
    });
  },

  async getTransactionsByTag(tagId: number): Promise<TransactionWithDetails[]> {
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
      JOIN transaction_tags tt ON t.id = tt.transaction_id
      LEFT JOIN categories c ON t.category_id = c.id
      JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts toa ON t.to_account_id = toa.id
      WHERE tt.tag_id = ?
      ORDER BY t.date DESC, t.created_at DESC;
    `;
    const txns = await db.getAllAsync<TransactionWithDetails>(query, [tagId]);
    if (txns.length === 0) return [];

    const txnIds = txns.map((t) => t.id);
    const tagMap = await TagRepository.getTagsForTransactions(txnIds);
    return txns.map((t) => ({
      ...t,
      tags: tagMap.get(t.id) || [],
    }));
  },
};
