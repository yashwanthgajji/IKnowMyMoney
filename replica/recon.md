# Recon map: MyMoney — Track Expense & Budget (Android)

Scope: Full app clone — expense/income tracking, budget planner, analytics charts, accounts management, category customization, settings, local backup/restore. Plus custom addition: manual Google Drive backup/restore (like Monefy).
For: User's own product — "IKnowMyMoney", a personal finance tracker with local-first data and optional manual Drive backup.
Date: 2026-11-01

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Google Play Store listing (Free) | https://play.google.com/store/apps/details?id=com.raha.app.mymoney.free&hl=en_US | Screenshots, description, ratings, feature list |
| 2 | Google Play Store listing (Pro) | https://play.google.com/store/apps/details?id=com.raha.app.mymoney | Pro version ~$4.99, record duplication, PDF export |
| 3 | AppBrain listing | appbrain.com/app/mymoney-track-expense-budget | Metadata, version history, install stats |
| 4 | Web research & reviews | Multiple sources (Substack, UpdateStar, etc.) | Feature walkthroughs, UI descriptions, user reviews |
| 5 | Competitor analysis (Monefy) | Play Store + reviews | Google Drive backup reference implementation |
| 6 | No help center / docs site | N/A | Developer uses in-app tooltips + Play Store contact email only |
| 7 | No public API / changelog | N/A | No dedicated changelog page; updates noted in Play Store "What's New" |

## Core loop

**Log an expense or income in under 5 seconds → see where your money goes via charts and budgets → stay in control of spending.**

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Home Dashboard | App launch / Bottom nav "Home" | Financial overview: balance, monthly income/expense, recent transactions | Summary cards (balance, income, expense), month/year selector, transaction list grouped by date, FAB (+) | filled (has transactions), empty (first launch, no data), filtered by month |
| S02 | Add Transaction | FAB (+) from S01 or S03 | Log a new expense, income, or transfer | Type toggle tabs (Expense/Income/Transfer), amount input with numpad, category grid, account picker, date picker, note field, save button | expense mode, income mode, transfer mode, validation error |
| S03 | Transactions List | Bottom nav "Transactions" | Browse and search all transactions | Date range filter tabs (Day/Month/Year/Custom), search bar, transaction list with swipe actions, sort controls | filled, empty, filtered, search results |
| S04 | Edit Transaction | Tap a transaction in S01 or S03 | Modify or delete an existing record | Same as S02 but pre-filled, delete button | filled, confirm-delete dialog |
| S05 | Accounts List | Bottom nav "Accounts" | View and manage all financial accounts | Account cards grouped by Asset/Liability, total balance per group, net worth summary, add account button | filled (multiple accounts), single default account, empty |
| S06 | Add/Edit Account | "Add Account" from S05 or tap existing | Create or modify a financial account | Name input, type selector (wallet/bank/card/savings/loan), icon picker, color picker, initial balance input, isAsset toggle | new account, editing existing, validation error |
| S07 | Categories Management | Settings → Categories, or from S02 | View, add, edit, delete income/expense categories | Tab toggle (Income/Expense), category grid with icons, add/edit/delete actions | income tab, expense tab, editing mode |
| S08 | Add/Edit Category | "Add" from S07 or tap existing | Create or customize a category | Name input, icon picker grid, color picker, type selector (income/expense) | new, editing existing |
| S09 | Budget Planner | Bottom nav "Budget" | Set and monitor monthly spending limits per category | Budget list with progress bars (green→yellow→red), add budget button, monthly overview summary, remaining budget display | has active budgets, no budgets set, over-budget warning, all within limit |
| S10 | Add/Edit Budget | "Add Budget" from S09 or tap existing | Set a spending limit for a category | Category selector, amount input, period selector (monthly/yearly), start date | new, editing, validation error |
| S11 | Analytics / Charts | Bottom nav "Analytics" or "Charts" | Visual breakdown of spending and income patterns | Pie chart (expense by category), pie chart (income by category), cash flow bar/line chart, account contribution bar chart, date range selector | filled with data, no data for period, different date ranges |
| S12 | Settings | Bottom nav "Settings" or hamburger menu | App configuration and data management | Currency selector, decimal format, date format, theme toggle (Light/Dark/System), reminder settings, backup/restore section, about/version | default state, modified preferences |
| S13 | Local Backup / Restore | Settings → Backup & Restore | Export and import local database backups | Backup button, restore button (file picker), export to CSV/Excel, backup history list | no backups, has backups, backup in progress, restore confirmation dialog |
| S14 | Homescreen Widget | Android homescreen | Quick balance view and one-tap add | Mini balance card, quick add shortcut | has data, no data |
| S15 | Recurring Transactions | Settings → Recurring or dedicated section | Manage auto-repeating entries | Recurring list (separated by expense/income/transfer), frequency display, add recurring button | has recurring items, empty |
| S16 | Add/Edit Recurring | "Add" from S15 or tap existing | Set up an automated repeating transaction | Same fields as S02, plus frequency selector (weekly/fortnightly/monthly/yearly/custom), end date option (indefinite/specific date) | new, editing |
| S17 | Google Drive Backup (NEW) | Settings → Cloud Backup | Manual backup/restore to user's Google Drive | Google Sign-In button, backup button, restore button, backup list from Drive, upload progress, last backup timestamp | signed out, signed in, backup in progress, restore file picker, no backups on Drive |

## Flows

```
F01 Log an expense
    S01 -> S02 (tap FAB) -> S01 (after save)
    happy path clicks: 4 (FAB → select category → enter amount → save)
    edge: no categories configured, no accounts exist, amount validation (zero/negative)

F02 Log an income
    S01 -> S02 (tap FAB, switch to Income tab) -> S01 (after save)
    happy path clicks: 5 (FAB → Income tab → select category → enter amount → save)
    edge: same as F01

F03 Transfer between accounts
    S01 -> S02 (tap FAB, switch to Transfer tab) -> S01
    happy path clicks: 6 (FAB → Transfer tab → select from-account → select to-account → enter amount → save)
    edge: only one account exists, insufficient balance warning, same from/to account

F04 Edit or delete a transaction
    S01 or S03 -> S04 (tap transaction) -> S01/S03 (after save/delete)
    happy path clicks: 3 (tap transaction → modify → save) or 3 (tap → delete → confirm)
    edge: delete confirmation, transaction linked to recurring entry

F05 Browse and search transactions
    S03 (browse list, use search, apply filters)
    happy path clicks: 2 (nav to transactions → type search query)
    edge: no results found, empty state for selected date range

F06 Create a new account
    S05 -> S06 (add account) -> S05
    happy path clicks: 5 (nav to accounts → add → name → type → balance → save)
    edge: duplicate account name, validation errors

F07 Set a budget for a category
    S09 -> S10 (add budget) -> S09
    happy path clicks: 4 (nav to budget → add → select category → enter amount → save)
    edge: category already has a budget, zero amount, no categories exist

F08 View analytics and charts
    S11 (select date range, switch chart types)
    happy path clicks: 2 (nav to analytics → select period)
    edge: no data for selected period, only income or only expenses logged

F09 Customize categories
    S07 -> S08 (add/edit) -> S07
    happy path clicks: 4 (settings → categories → add → name/icon → save)
    edge: delete category with existing transactions, duplicate name

F10 Configure app settings
    S12 (modify preferences)
    happy path clicks: 2 (nav to settings → change value)
    edge: none significant

F11 Local backup and restore
    S12 -> S13 (backup section)
    happy path clicks: 3 (settings → backup → confirm)
    edge: no storage permission, corrupt backup file on restore, overwrite confirmation

F12 Set up recurring transaction
    S15 -> S16 (add recurring) -> S15
    happy path clicks: 6 (settings → recurring → add → fill details → set frequency → save)
    edge: end date before start date, conflicting frequency, edit existing recurrence

F13 Manual Google Drive backup (NEW - custom feature)
    S12 -> S17 (cloud backup) -> sign in with Google -> tap Backup -> S17 (success)
    happy path clicks: 4 (settings → cloud backup → backup → confirm)
    edge: not signed in, no internet, Drive storage full, upload fails mid-way

F14 Restore from Google Drive (NEW - custom feature)
    S12 -> S17 -> select backup from list -> confirm -> S17 (restored)
    happy path clicks: 5 (settings → cloud backup → restore → select file → confirm)
    edge: no backups on Drive, corrupt file, overwrite warning, version mismatch
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| BottomNavBar | 4-5 tabs (Home, Transactions, Budget, Analytics, Settings) | selected, unselected | all main screens |
| FAB (Floating Action Button) | primary add (+) | default, pressed | S01, S03, S05, S09 |
| SummaryCard | balance card, income card, expense card | filled, zero, negative | S01, S05 |
| TransactionListItem | income (green), expense (red), transfer (blue) | default, swiped (edit/delete) | S01, S03 |
| TypeToggleTabs | Expense / Income / Transfer | selected, unselected | S02, S04, S16 |
| NumericKeypad | calculator-style amount input | default, with decimal, backspace | S02, S04, S10, S16 |
| CategoryGrid | icon grid with labels | default, selected, edit mode | S02, S04, S07 |
| AccountPickerDropdown | single-select, from/to pair (for transfer) | default, expanded, selected | S02, S04, S06 |
| DatePicker | material date picker | default, selecting, selected | S02, S04, S11, S16 |
| DateRangeSelector | Day / Week / Month / Year / Custom tabs | selected tab, custom range open | S03, S11 |
| MonthYearSelector | left/right arrows with month-year label | navigating | S01, S09 |
| ProgressBar | budget progress (green→yellow→red) | under 50%, 50-80%, 80-100%, over 100% | S09 |
| PieChart | income distribution, expense distribution | has data, no data, single category | S11 |
| BarChart | cash flow, account contribution | has data, no data, single bar | S11 |
| LineChart | cash flow trend over time | has data, no data | S11 |
| AccountCard | asset, liability | default, tapped | S05 |
| IconPicker | grid of Material icons | default, selected | S06, S08 |
| ColorPicker | preset color swatches | default, selected | S06, S08 |
| SearchBar | text input with icon | collapsed, expanded, has query, no results | S03 |
| ConfirmDialog | delete, restore, overwrite | shown, dismissed | S04, S13, S17 |
| Toast / Snackbar | success, error, info | shown (auto-dismiss) | all |
| SettingsRow | toggle switch, dropdown, navigation | default, toggled | S12 |
| DriveBackupListItem | backup file with date, size | default, selected for restore | S17 |
| ProgressIndicator | upload/download progress | determinate, indeterminate | S13, S17 |
| Widget | mini balance card | has data, empty | S14 (homescreen) |

## Inferred data model

```
Account     id (PK), name, type (enum: wallet|bank|card|savings|loan|investment),
            icon, color, initialBalance, currentBalance, isAsset (bool),
            createdAt, updatedAt
            evidence: S05 account cards, S06 add form, S02 account picker
            confidence: high

Category    id (PK), name, type (enum: income|expense), icon, color,
            isDefault (bool), sortOrder
            evidence: S07 category grid, S02 category selector, S08 add form
            confidence: high

Transaction id (PK), amount (decimal), type (enum: expense|income|transfer),
            categoryId (FK→Category, nullable for transfers), accountId (FK→Account),
            toAccountId (FK→Account, nullable, only for transfers),
            date (date), note (text, nullable), createdAt, updatedAt
            evidence: S02 add form fields, S03 transaction list, S01 recent list
            confidence: high

Budget      id (PK), categoryId (FK→Category), amount (decimal),
            period (enum: monthly|yearly), startDate (date)
            evidence: S09 budget list, S10 add form
            confidence: high

RecurringTransaction
            id (PK), amount, type, categoryId, accountId, toAccountId,
            note, frequency (enum: weekly|fortnightly|monthly|yearly|custom),
            customIntervalDays (int, nullable), startDate, endDate (nullable),
            lastGeneratedDate, isActive (bool)
            evidence: S15 recurring list, S16 add form
            confidence: medium (exact fields inferred from similar apps)

AppSettings (singleton)
            currencySymbol, decimalPlaces (int), dateFormat,
            theme (enum: light|dark|system), reminderEnabled (bool),
            reminderTime, lastLocalBackupDate, lastDriveBackupDate
            evidence: S12 settings screen
            confidence: high

DriveBackup (metadata only, stored locally)
            id (PK), driveFileId, fileName, fileSizeBytes, createdAt
            evidence: S17 drive backup list (NEW feature)
            confidence: high (custom design)
```

Relationships:
- Account 1→n Transaction (via accountId)
- Account 1→n Transaction (via toAccountId, transfers)
- Category 1→n Transaction
- Category 1→n Budget
- Category 1→n RecurringTransaction
- RecurringTransaction generates→ Transaction (on schedule)

## Feature matrix

See `features.csv`. Must: 20, should: 8, could: 5, skip: 2.

## Out of scope (cannot or should not be cloned)

- **Ad network / monetization SDK**: The free version runs ads — our clone does not need this for MVP.
- **Pro version in-app purchase or separate paid listing**: Business decision for later.
- **Existing user base and Play Store reviews**: Cannot be cloned — organic growth required.
- **Developer's brand identity**: We are rebranding to "IKnowMyMoney".
- **Receipt photo attachment**: Not present in original; could be a future enhancement.

## Size

Screens: 17 (15 original + 2 new for Google Drive backup), flows: 14, entities: 7.
Hard parts:
1. **Google Drive API integration** — OAuth2, file upload/download, error handling, offline resilience
2. **Charts/analytics** — Multiple interactive chart types with date filtering
3. **Recurring transactions engine** — Background scheduler to auto-generate entries
4. **Homescreen widget** — Android AppWidget with RemoteViews or Glance

Size: **M** (a few weeks for a focused developer).

Next step: `/replica-architect`
