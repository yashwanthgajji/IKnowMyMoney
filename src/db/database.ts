import * as SQLite from 'expo-sqlite';
import {
  CREATE_ACCOUNTS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_BUDGETS_TABLE,
  CREATE_RECURRING_TABLE,
  CREATE_DRIVE_BACKUPS_TABLE,
  CREATE_TAGS_TABLE,
  CREATE_TRANSACTION_TAGS_TABLE,
} from './schema';
import { seedInitialData } from './seed';

export const DB_NAME = 'iknowmymoney.db';
export const DB_VERSION = 3;

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function migrateDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 2) {
    await db.execAsync(CREATE_TAGS_TABLE);
    await db.execAsync(CREATE_TRANSACTION_TAGS_TABLE);
    await db.execAsync('PRAGMA user_version = 2;');
  }

  if (currentVersion < 3) {
    await db.execAsync('UPDATE accounts SET is_asset = 1 WHERE is_asset = 0;');
    await db.execAsync('PRAGMA user_version = 3;');
  }
}

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
  await db.execAsync(CREATE_TAGS_TABLE);
  await db.execAsync(CREATE_TRANSACTION_TAGS_TABLE);

  // Run version migrations
  await migrateDatabase(db);

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
