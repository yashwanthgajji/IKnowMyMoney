export const CREATE_ACCOUNTS_TABLE = `
CREATE TABLE IF NOT EXISTS accounts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    type            TEXT    NOT NULL DEFAULT 'wallet'
                    CHECK (type IN ('wallet','bank','card','savings','loan','investment')),
    icon            TEXT    NOT NULL DEFAULT 'Wallet',
    color           TEXT    NOT NULL DEFAULT '#047857',
    initial_balance INTEGER NOT NULL DEFAULT 0,
    is_asset        INTEGER NOT NULL DEFAULT 1,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_accounts_type     ON accounts (type);
CREATE INDEX IF NOT EXISTS idx_accounts_is_asset ON accounts (is_asset);
`;

export const CREATE_CATEGORIES_TABLE = `
CREATE TABLE IF NOT EXISTS categories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    type            TEXT    NOT NULL DEFAULT 'expense'
                    CHECK (type IN ('income','expense')),
    icon            TEXT    NOT NULL DEFAULT 'Tag',
    color           TEXT    NOT NULL DEFAULT '#047857',
    is_default      INTEGER NOT NULL DEFAULT 0,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories (type);
`;

export const CREATE_TRANSACTIONS_TABLE = `
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
    FOREIGN KEY (to_account_id) REFERENCES accounts(id)   ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_txn_account    ON transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_txn_to_account ON transactions (to_account_id);
CREATE INDEX IF NOT EXISTS idx_txn_category   ON transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_txn_date       ON transactions (date DESC);
CREATE INDEX IF NOT EXISTS idx_txn_type_date  ON transactions (type, date DESC);
`;

export const CREATE_BUDGETS_TABLE = `
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
`;

export const CREATE_RECURRING_TABLE = `
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
`;

export const CREATE_DRIVE_BACKUPS_TABLE = `
CREATE TABLE IF NOT EXISTS drive_backups (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    drive_file_id   TEXT    NOT NULL,
    file_name       TEXT    NOT NULL,
    file_size_bytes INTEGER NOT NULL DEFAULT 0,
    db_version      INTEGER NOT NULL,
    created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_drive_backups_date ON drive_backups (created_at DESC);
`;

export const CREATE_TAGS_TABLE = `
CREATE TABLE IF NOT EXISTS tags (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL UNIQUE,
    color         TEXT    NOT NULL DEFAULT '#3B82F6',
    budget_amount INTEGER DEFAULT NULL,
    created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tag_name ON tags (name);
`;

export const CREATE_TRANSACTION_TAGS_TABLE = `
CREATE TABLE IF NOT EXISTS transaction_tags (
    transaction_id INTEGER NOT NULL,
    tag_id         INTEGER NOT NULL,
    PRIMARY KEY (transaction_id, tag_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)         REFERENCES tags(id)         ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_tt_transaction ON transaction_tags (transaction_id);
CREATE INDEX IF NOT EXISTS idx_tt_tag         ON transaction_tags (tag_id);
`;
