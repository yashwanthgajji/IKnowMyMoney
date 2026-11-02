import * as SQLite from 'expo-sqlite';
import {
  CREATE_ACCOUNTS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_BUDGETS_TABLE,
  CREATE_RECURRING_TABLE,
  CREATE_DRIVE_BACKUPS_TABLE,
} from './schema';
import { seedInitialData } from './seed';

export const DB_NAME = 'iknowmymoney.db';
export const DB_VERSION = 1;

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Enable WAL mode for high concurrent read performance
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables
  await db.execAsync(CREATE_ACCOUNTS_TABLE);
  await db.execAsync(CREATE_CATEGORIES_TABLE);
  await db.execAsync(CREATE_TRANSACTIONS_TABLE);
  await db.execAsync(CREATE_BUDGETS_TABLE);
  await db.execAsync(CREATE_RECURRING_TABLE);
  await db.execAsync(CREATE_DRIVE_BACKUPS_TABLE);

  // Seed default accounts and categories if first run
  await seedInitialData(db);

  dbInstance = db;
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}
