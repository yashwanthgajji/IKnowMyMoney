import { getDatabase } from '../db/database';
import { Category, CategoryType } from '../types';

export const CategoryRepository = {
  async getAll(): Promise<Category[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Category>(
      'SELECT * FROM categories ORDER BY sort_order ASC, name ASC;'
    );
  },

  async getByType(type: CategoryType): Promise<Category[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Category>(
      'SELECT * FROM categories WHERE type = ? ORDER BY sort_order ASC, name ASC;',
      [type]
    );
  },

  async getById(id: number): Promise<Category | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Category>(
      'SELECT * FROM categories WHERE id = ?;',
      [id]
    );
    return result || null;
  },

  async create(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const db = await getDatabase();
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT INTO categories (name, type, icon, color, is_default, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.name,
        data.type,
        data.icon,
        data.color,
        data.is_default || 0,
        data.sort_order || 0,
        now,
        now,
      ]
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
    if (data.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(data.sort_order); }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?;`, values);
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
  },
};
