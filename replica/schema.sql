-- IKnowMyMoney — SQLite Database Schema
-- Version: 1
-- Engine: SQLite (via expo-sqlite + Drizzle ORM)
-- Platform: React Native (Expo) — iOS + Android
-- Money: stored as INTEGER (cents)
-- Dates: stored as INTEGER (epoch millis)
-- Enums: stored as TEXT

-- ============================================================
-- accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    type            TEXT    NOT NULL DEFAULT 'wallet'
                    CHECK (type IN ('wallet','bank','card','savings','loan','investment')),
    icon            TEXT    NOT NULL DEFAULT 'account_balance_wallet',
    color           TEXT    NOT NULL DEFAULT '#4CAF50',
    initial_balance INTEGER NOT NULL DEFAULT 0,
    is_asset        INTEGER NOT NULL DEFAULT 1,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_accounts_type     ON accounts (type);
CREATE INDEX IF NOT EXISTS idx_accounts_is_asset ON accounts (is_asset);

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    type            TEXT    NOT NULL DEFAULT 'expense'
                    CHECK (type IN ('income','expense')),
    icon            TEXT    NOT NULL DEFAULT 'category',
    color           TEXT    NOT NULL DEFAULT '#FF9800',
    is_default      INTEGER NOT NULL DEFAULT 0,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories (type);

-- ============================================================
-- transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    amount          INTEGER NOT NULL,
    type            TEXT    NOT NULL DEFAULT 'expense'
                    CHECK (type IN ('expense','income','transfer')),
    category_id     INTEGER,
    account_id      INTEGER NOT NULL,
    to_account_id   INTEGER,
    date            INTEGER NOT NULL,
    note            TEXT    DEFAULT '',
    recurring_id    INTEGER,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL,

    FOREIGN KEY (category_id)   REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (account_id)    REFERENCES accounts(id)   ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id)   ON DELETE SET NULL,
    FOREIGN KEY (recurring_id)  REFERENCES recurring_transactions(id) ON DELETE SET NULL,

    CHECK (
        (type IN ('expense','income') AND category_id IS NOT NULL AND to_account_id IS NULL)
        OR
        (type = 'transfer' AND to_account_id IS NOT NULL AND account_id != to_account_id)
    )
);
CREATE INDEX IF NOT EXISTS idx_txn_account    ON transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_txn_to_account ON transactions (to_account_id);
CREATE INDEX IF NOT EXISTS idx_txn_category   ON transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_txn_date       ON transactions (date DESC);
CREATE INDEX IF NOT EXISTS idx_txn_type_date  ON transactions (type, date DESC);
CREATE INDEX IF NOT EXISTS idx_txn_recurring  ON transactions (recurring_id);

-- ============================================================
-- budgets
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id     INTEGER NOT NULL UNIQUE,
    amount          INTEGER NOT NULL,
    period          TEXT    NOT NULL DEFAULT 'monthly'
                    CHECK (period IN ('monthly','yearly')),
    start_date      INTEGER NOT NULL,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL,

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets (category_id);

-- ============================================================
-- recurring_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    amount                INTEGER NOT NULL,
    type                  TEXT    NOT NULL DEFAULT 'expense'
                          CHECK (type IN ('expense','income','transfer')),
    category_id           INTEGER,
    account_id            INTEGER NOT NULL,
    to_account_id         INTEGER,
    note                  TEXT    DEFAULT '',
    frequency             TEXT    NOT NULL DEFAULT 'monthly'
                          CHECK (frequency IN ('weekly','fortnightly','monthly','yearly','custom')),
    custom_interval_days  INTEGER,
    start_date            INTEGER NOT NULL,
    end_date              INTEGER,
    last_generated_date   INTEGER,
    is_active             INTEGER NOT NULL DEFAULT 1,
    created_at            INTEGER NOT NULL,
    updated_at            INTEGER NOT NULL,

    FOREIGN KEY (category_id)   REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (account_id)    REFERENCES accounts(id)   ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id)   ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_transactions (is_active, start_date);

-- ============================================================
-- drive_backups (local metadata of what's on Drive)
-- ============================================================
CREATE TABLE IF NOT EXISTS drive_backups (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    drive_file_id   TEXT    NOT NULL,
    file_name       TEXT    NOT NULL,
    file_size_bytes INTEGER NOT NULL DEFAULT 0,
    db_version      INTEGER NOT NULL,
    created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_drive_backups_date ON drive_backups (created_at DESC);
