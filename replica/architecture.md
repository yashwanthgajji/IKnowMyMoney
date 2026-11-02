# Architecture: IKnowMyMoney (a rebuild of MyMoney's core features)

## Stack

| layer | choice | why |
| --- | --- | --- |
| platform | React Native (Expo SDK 52+) — iOS + Android | Cross-platform from a single TypeScript codebase; Expo handles native modules |
| language | TypeScript (strict mode) | Type safety, better DX, catches bugs at compile time |
| UI framework | React Native + Expo components | Expo's managed workflow handles native config; no Xcode/Gradle manual setup |
| navigation | Expo Router (file-based) | File-system routing like Next.js; deep links, tabs, stacks out of the box |
| styling | NativeWind (Tailwind for RN) | Utility-first styling; consistent spacing/colors; works on both platforms |
| database | expo-sqlite + Drizzle ORM | Local-first SQLite; Drizzle gives type-safe queries with zero overhead |
| state management | Zustand + TanStack Query | Zustand for UI state; TanStack Query for reactive DB queries with caching |
| charts | react-native-gifted-charts | Pie, bar, line charts; Skia-based, smooth animations, well-maintained |
| DI / config | Environment variables via Expo | `.env` for API keys; Expo constants for build-time config |
| Drive backup | @react-native-google-signin + Google Drive REST API v3 | Sign in with Google for Drive scope; REST calls for upload/download |
| background jobs | expo-notifications + expo-task-manager | Local notifications for reminders; background task for recurring txn generation |
| file export | expo-file-system + expo-sharing | CSV export to local file, share via system sheet |
| preferences | @react-native-async-storage/async-storage | Simple key-value for app settings (currency, theme, etc.) |
| widget | react-native-android-widget + WidgetKit (iOS) | Homescreen widget for balance; platform-specific but Expo-compatible |
| build & deploy | EAS Build + EAS Submit | Cloud builds for both platforms; OTA updates via expo-updates |

No server. No microservices. Everything runs on-device with an optional manual push to the user's own Google Drive.

## Project Structure

```
iknowmymoney/
├── app/                          # Expo Router file-based routes
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── index.tsx             # Home / Dashboard (S01)
│   │   ├── transactions.tsx      # Transactions list (S03)
│   │   ├── accounts.tsx          # Accounts list (S05)
│   │   ├── budget.tsx            # Budget planner (S09)
│   │   ├── analytics.tsx         # Charts (S11)
│   │   └── settings.tsx          # Settings hub (S12)
│   ├── transaction/
│   │   ├── add.tsx               # Add transaction (S02)
│   │   └── [id].tsx              # Edit transaction (S04)
│   ├── account/
│   │   ├── add.tsx               # Add account (S06)
│   │   └── [id].tsx              # Edit account (S06)
│   ├── category/
│   │   ├── index.tsx             # Categories management (S07)
│   │   ├── add.tsx               # Add category (S08)
│   │   └── [id].tsx              # Edit category (S08)
│   ├── budget/
│   │   ├── add.tsx               # Add budget (S10)
│   │   └── [id].tsx              # Edit budget (S10)
│   ├── recurring/
│   │   ├── index.tsx             # Recurring list (S15)
│   │   ├── add.tsx               # Add recurring (S16)
│   │   └── [id].tsx              # Edit recurring (S16)
│   ├── backup/
│   │   ├── local.tsx             # Local backup/restore (S13)
│   │   └── drive.tsx             # Google Drive backup (S17)
│   └── _layout.tsx               # Root layout (Stack)
├── src/
│   ├── db/
│   │   ├── schema.ts             # Drizzle table definitions
│   │   ├── migrations/           # SQL migration files
│   │   ├── seed.ts               # Default categories + "Cash" account
│   │   └── client.ts             # expo-sqlite + Drizzle client init
│   ├── repositories/
│   │   ├── account.repository.ts
│   │   ├── category.repository.ts
│   │   ├── transaction.repository.ts
│   │   ├── budget.repository.ts
│   │   ├── recurring.repository.ts
│   │   └── drive-backup.repository.ts
│   ├── hooks/                    # TanStack Query hooks wrapping repositories
│   │   ├── useAccounts.ts
│   │   ├── useCategories.ts
│   │   ├── useTransactions.ts
│   │   ├── useBudgets.ts
│   │   ├── useAnalytics.ts
│   │   └── useDriveBackup.ts
│   ├── stores/                   # Zustand stores for UI state
│   │   ├── settings.store.ts     # Currency, theme, date format
│   │   └── ui.store.ts           # Selected month, active tab, etc.
│   ├── services/
│   │   ├── drive.service.ts      # Google Drive API wrapper
│   │   ├── backup.service.ts     # DB export/import (local + Drive)
│   │   ├── recurring.service.ts  # Generate due recurring txns
│   │   └── csv-export.service.ts # Transaction CSV export
│   ├── components/
│   │   ├── ui/                   # Shared primitives
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── TransactionListItem.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── AmountInput.tsx
│   │   │   ├── IconPicker.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── charts/
│   │   │   ├── ExpensePieChart.tsx
│   │   │   ├── IncomePieChart.tsx
│   │   │   ├── CashFlowChart.tsx
│   │   │   └── AccountContributionChart.tsx
│   │   └── forms/
│   │       ├── TransactionForm.tsx   # Shared between add/edit
│   │       ├── AccountForm.tsx
│   │       ├── CategoryForm.tsx
│   │       └── BudgetForm.tsx
│   ├── utils/
│   │   ├── money.ts              # Cents ↔ display formatting
│   │   ├── dates.ts              # Date helpers, period boundaries
│   │   └── constants.ts          # Default categories, icons, colors
│   └── types/
│       └── index.ts              # Shared TypeScript types & enums
├── assets/                       # App icon, splash, fonts
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── tsconfig.json
├── drizzle.config.ts
├── tailwind.config.js            # NativeWind config
└── package.json
```

## Schema

Tables: **6** (plus AsyncStorage for settings). Access rules: **single-user local app** — all data belongs to the device owner.

> Money is stored as integer cents (no floating point). Dates stored as Unix epoch milliseconds (INTEGER).
> Enums stored as TEXT. Drizzle ORM provides type-safe access.

```sql
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
```

### Hard constraints enforced by the schema

| constraint | how |
| --- | --- |
| One budget per category | `UNIQUE` on `budgets.category_id` |
| Transfer must have different from/to | `CHECK` on transactions |
| Expense/income must have category | `CHECK` on transactions |
| Delete account → cascade transactions | `ON DELETE CASCADE` on `account_id` |
| Delete category → nullify transactions | `ON DELETE SET NULL` on `category_id` |
| Delete category → cascade its budget | `ON DELETE CASCADE` on budgets |

### AppSettings (AsyncStorage, not a table)

| key | type | default |
| --- | --- | --- |
| currency_symbol | string | "$" |
| decimal_places | number | 2 |
| date_format | string | "MM/dd/yyyy" |
| theme | string | "system" |
| reminder_enabled | boolean | false |
| reminder_hour | number | 20 |
| reminder_minute | number | 0 |
| last_local_backup_millis | number | 0 |
| last_drive_backup_millis | number | 0 |
| drive_user_email | string | "" |

## Data Access Layer (Repositories)

Since this is an on-device app with no server, the repository layer is the API. Each repository wraps Drizzle queries.

### AccountRepository

| method | does | flow |
| --- | --- | --- |
| `getAll(): Account[]` | All accounts sorted | S05 |
| `getAssets(): Account[]` | Assets for net worth | S05 |
| `getLiabilities(): Account[]` | Liabilities | S05 |
| `getById(id): Account \| null` | Single account | S06 |
| `create(data): Account` | Insert new | F06 |
| `update(id, data): Account` | Edit | F06 |
| `delete(id): void` | Remove + cascade txns | F06 |
| `getBalance(id): number` | Computed: initial + income - expense ± transfers | S01, S05 |
| `getTotalBalance(): number` | Sum all accounts | S01 |

### CategoryRepository

| method | does | flow |
| --- | --- | --- |
| `getByType(type): Category[]` | Income or expense | S02, S07 |
| `getById(id): Category \| null` | Single | S08 |
| `create(data): Category` | Insert | F09 |
| `update(id, data): Category` | Edit | F09 |
| `delete(id): void` | Remove, nullify txns | F09 |
| `seedDefaults(): void` | Populate on first launch | First run |

### TransactionRepository

| method | does | flow |
| --- | --- | --- |
| `getByDateRange(start, end): TransactionWithDetails[]` | List with joins | S01, S03 |
| `search(query): TransactionWithDetails[]` | Search by note | F05 |
| `create(data): Transaction` | Insert | F01, F02, F03 |
| `update(id, data): Transaction` | Edit | F04 |
| `delete(id): void` | Remove | F04 |
| `getSumByType(type, start, end): number` | Monthly totals | S01 |
| `getSumByCategory(categoryId, start, end): number` | Budget tracking | S09 |
| `getExpensesByCategory(start, end): CategorySum[]` | Pie chart | S11 |
| `getIncomeByCategory(start, end): CategorySum[]` | Pie chart | S11 |
| `getDailyTotals(start, end): DailyTotal[]` | Bar/line chart | S11 |
| `getByAccount(start, end): AccountSum[]` | Account chart | S11 |

### BudgetRepository

| method | does | flow |
| --- | --- | --- |
| `getAll(): BudgetWithCategory[]` | Budget list | S09 |
| `getById(id): BudgetWithCategory \| null` | Single | S10 |
| `create(data): Budget` | Insert | F07 |
| `update(id, data): Budget` | Edit | F07 |
| `delete(id): void` | Remove | F07 |

### RecurringTransactionRepository

| method | does | flow |
| --- | --- | --- |
| `getActive(): RecurringWithDetails[]` | Active list | S15 |
| `getDue(today): RecurringTransaction[]` | For background gen | Background |
| `create(data): RecurringTransaction` | Insert | F12 |
| `update(id, data): RecurringTransaction` | Edit | F12 |
| `delete(id): void` | Remove | F12 |
| `markGenerated(id, date): void` | After spawning txn | Background |

### DriveBackupRepository

| method | does | flow |
| --- | --- | --- |
| `getAll(): DriveBackup[]` | Backup history | S17 |
| `create(data): DriveBackup` | After upload | F13 |
| `deleteAll(): void` | On restore | F14 |

## Background Jobs

| job | mechanism | schedule | what it does |
| --- | --- | --- | --- |
| RecurringTransactionTask | expo-task-manager `BackgroundFetch` | ~daily (OS-managed) | Queries due recurring txns, generates Transaction rows, updates `last_generated_date` |
| BackupReminderNotification | expo-notifications scheduled | Daily at configured hour | Checks `last_drive_backup_millis`; if > 7 days, fires local notification |

## Google Drive Integration

| operation | method | details |
| --- | --- | --- |
| Sign in | `@react-native-google-signin/google-signin` | Request `drive.file` scope (app-created files only). Works on iOS + Android. |
| Backup | `POST` multipart to Drive API v3 | 1. Close DB (Drizzle disconnect). 2. Read DB file via `expo-file-system`. 3. Upload to `appDataFolder` or `IKnowMyMoney/backups/` folder. 4. Record metadata locally. |
| List backups | `GET files` from Drive API v3 | Query by folder + mimeType, return name + size + date. |
| Restore | `GET file content` from Drive API v3 | 1. Download DB file. 2. Validate schema version. 3. Close current DB. 4. Replace DB file. 5. Re-initialize Drizzle. 6. Refresh all queries. |

## The parts that bite

| issue | mitigation |
| --- | --- |
| **Money precision** | Store as integer cents. Never use float. Format for display using `currencySymbol` + `decimalPlaces`. |
| **Account balance consistency** | Derived from `initialBalance + SUM(income/transfers-in) - SUM(expense/transfers-out)`. Computed via SQL aggregation, never stored as a mutable field. |
| **Date handling / time zones** | Store epoch millis. Display using device locale via `date-fns`. Budget periods computed in local timezone. |
| **SQLite migrations** | Drizzle handles migration files. Store `db_version` in Drive backups for compatibility check on restore. |
| **Drive backup during writes** | Disconnect Drizzle before reading DB file for backup. Reconnect after. |
| **Drive restore overwrites everything** | Confirmation dialog: "This will replace ALL your current data." Schema version must match. |
| **Offline → Drive upload** | Check `NetInfo` before upload. If offline, show error. No auto-retry (manual = user knows they need internet). |
| **Recurring txn idempotency** | `last_generated_date` column prevents double-generation. |
| **iOS background fetch limitations** | iOS is aggressive about killing background tasks. `BackgroundFetch` interval is a minimum, not guaranteed. Recurring txns also checked on app foreground as fallback. |
| **Widget cross-platform** | Android: `react-native-android-widget`. iOS: WidgetKit via native module. Both read from shared SQLite file. |
| **Deleting category with transactions** | `ON DELETE SET NULL` — transactions keep amount but lose category. Show warning count before delete. |
| **Deleting account with transactions** | `ON DELETE CASCADE` — confirm with count of transactions that will be deleted. |

## Build order

### Milestone 1: Vertical Slice (proves the stack)
**Goal:** Log an expense and see it on the dashboard.

- Screens: S01 (dashboard, minimal), S02 (add expense only)
- Tables: `accounts`, `categories`, `transactions`
- Seed: 1 default "Cash" account, 5 default expense categories
- Nav: Tab shell with Home tab only
- Flow: F01 end-to-end
- S-IDs: S01, S02
- **Validates:** Expo + Drizzle + expo-sqlite + NativeWind + Expo Router all work together

### Milestone 2: Must-haves — Core CRUD
**Goal:** Full transaction lifecycle, accounts, categories.

- Screens: S01 (full), S02 (income + transfer), S03, S04, S05, S06, S07, S08
- All CRUD on `accounts`, `categories`, `transactions`
- Bottom tabs: Home, Transactions, Accounts
- Flows: F01–F06, F09

### Milestone 3: Must-haves — Budget & Analytics
**Goal:** Budget tracking with progress bars, interactive charts.

- Screens: S09, S10, S11
- Table: `budgets` + aggregation queries
- Bottom tabs: add Budget, Analytics
- Charts: Pie (expense/income), bar (daily), line (cash flow), account contribution
- Flows: F07, F08

### Milestone 4: Must-haves — Backup
**Goal:** Local backup/restore + manual Google Drive backup.

- Screens: S12 (settings), S13 (local backup), S17 (Drive backup)
- Table: `drive_backups`
- Integration: `@react-native-google-signin` + Drive API v3
- Flows: F10, F11, F13, F14

### Milestone 5: Should-haves
**Goal:** Polish and convenience.

- Homescreen widget (S14)
- CSV export via `expo-sharing`
- Theme light/dark/system
- Date format, decimal format preferences
- Account contribution chart
- Monthly/yearly budget toggle

### Milestone 6: Could-haves
**Goal:** Nice-to-haves if time permits.

- Recurring transactions (S15, S16, `recurring_transactions` table) — F12
- Record duplication
- Reminder notifications
- PIN/biometric lock (`expo-local-authentication`)
- Backup reminder notification

### Milestone 7: Fixes from replica-entrepreneur
- (To be filled after `/replica-entrepreneur` runs)

## Summary

**Stack:** TypeScript + React Native (Expo) + Drizzle ORM + expo-sqlite + NativeWind + react-native-gifted-charts + Google Drive REST API — cross-platform (iOS + Android), zero-server, local-first.

| metric | count |
| --- | --- |
| Tables | 6 |
| Repository methods | ~35 |
| Screens (routes) | ~20 |
| Background tasks | 2 |
| Build milestones | 7 |

**Three riskiest parts:**
1. Google Drive backup/restore — OAuth on both platforms, DB file copy while ensuring no writes, schema version validation
2. Account balance consistency — always derived from transaction aggregation, never stored
3. iOS background fetch for recurring transactions — unreliable scheduling; must also check on foreground

Next step: `/replica-design`
