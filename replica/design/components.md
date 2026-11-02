# Component Specifications: IKnowMyMoney

Design system component specs mapped from the recon inventory. Built for React Native with NativeWind / Tailwind styling.

---

### BottomNavBar
- **variants:** standard 5-tab layout (Home, Transactions, Accounts, Budget, Analytics/Settings)
- **sizes:** height 56px + safe-area-inset-bottom
- **states:** active (accent icon + label, font-weight 600), inactive (text-muted icon + label), pressed
- **tokens:** `bg-surface`, `border-border`, active: `text-accent`, inactive: `text-muted`
- **a11y:** `accessibilityRole="tablist"`, active tab has `accessibilityState={{ selected: true }}`
- **used on:** All root tab screens (S01, S03, S05, S09, S11, S12)

---

### FAB (Floating Action Button)
- **variants:** primary (large icon +), mini (secondary quick actions)
- **sizes:** primary: 56x56px circular, icon 28px; mini: 44x44px
- **states:** default (elevated with pop shadow), pressed (opacity 0.9, scale 0.96), disabled
- **tokens:** `bg-accent text-accent-foreground rounded-full shadow-pop`
- **a11y:** `accessibilityRole="button"`, `accessibilityLabel="Add new transaction"`
- **used on:** S01 (Dashboard), S03 (Transactions), S05 (Accounts), S09 (Budget)

---

### SummaryCard
- **variants:** balance card (prominent full-width), income summary card (compact), expense summary card (compact)
- **sizes:** hero balance: 96px height; summary stat cards: 72px height, half-width pair
- **states:** positive (accent/income), negative (danger/expense), neutral (text-muted), loading skeleton
- **tokens:** `bg-surface-elevated rounded-xl border border-border p-4 shadow-card`
- **a11y:** Accessible label reading "Total Balance: $X.XX" or "Monthly Income: $X.XX"
- **used on:** S01 (Home Dashboard), S05 (Accounts overview)

---

### TransactionListItem
- **variants:** expense (minus, danger/subtle text), income (plus, income text), transfer (blue icon, neutral text)
- **sizes:** height 68px, icon container 44x44px
- **states:** default, pressed (highlight bg), swiped-left (delete action revealed), swiped-right (duplicate)
- **tokens:** `bg-surface-elevated active:bg-surface border-b border-border text-text text-muted`
- **a11y:** `accessibilityRole="button"`, announce title, category, account, formatted amount
- **used on:** S01 (Recent feed), S03 (Full history)

---

### TypeToggleTabs
- **variants:** 3-segment pill toggle: Expense | Income | Transfer
- **sizes:** container height 44px, pill height 36px
- **states:** selected (animated pill background matching type: Expense=danger, Income=income, Transfer=transfer), unselected
- **tokens:** container: `bg-surface rounded-xl p-1`; active: colored bg with white text; inactive: `text-muted`
- **a11y:** `accessibilityRole="tablist"`, selected tab announces current mode
- **used on:** S02 (Add Transaction), S04 (Edit Transaction), S16 (Add Recurring)

---

### NumericKeypad
- **variants:** custom in-app 12-key calculator pad (0-9, decimal `.`, backspace `⌫`)
- **sizes:** key height 54px, 3x4 grid
- **states:** default, pressed (subtle scale + highlight), disabled
- **tokens:** keys: `bg-surface-elevated active:bg-surface text-text rounded-lg text-xl font-semibold`
- **a11y:** Accessible button labels for each number and action ("Backspace", "Decimal point")
- **used on:** S02 (Add Transaction), S04 (Edit Transaction), S10 (Budget amount)

---

### CategoryGrid
- **variants:** compact 4-column icon grid, scrollable list
- **sizes:** item 72x72px, icon bubble 48x48px, label 11px
- **states:** unselected (surface bg, neutral icon), selected (accent ring + badge), active edit mode
- **tokens:** bubble: `bg-surface-elevated rounded-full border border-border`, selected: `border-accent ring-2 ring-accent`
- **a11y:** `accessibilityRole="radio"`, announce category name and selected state
- **used on:** S02 (Transaction Form), S07 (Category Management)

---

### AccountPickerDropdown / Sheet
- **variants:** bottom sheet modal selector, inline horizontal chip list
- **sizes:** sheet item height 56px; chip height 36px
- **states:** selected, unselected, disabled
- **tokens:** `bg-surface-elevated rounded-xl border border-border`, chip: `bg-surface text-text`
- **a11y:** `accessibilityRole="combobox"`, announces active account name and balance
- **used on:** S02, S04, S05, S16

---

### DatePicker
- **variants:** native date picker modal (iOS spinner/calendar, Android Material dialog)
- **sizes:** trigger chip: height 38px
- **states:** default (shows "Today" or formatted date), active picker open
- **tokens:** trigger: `bg-surface border border-border text-text rounded-md px-3`
- **a11y:** announce formatted date, e.g. "Selected date: November 1st, 2026"
- **used on:** S02, S04, S10, S16

---

### DateRangeSelector
- **variants:** Day | Week | Month | Year | Custom tabs
- **sizes:** height 36px
- **states:** active tab (pill indicator), inactive tab
- **tokens:** `bg-surface rounded-lg p-1 text-muted active:text-text active:bg-surface-elevated`
- **a11y:** `accessibilityRole="tablist"`
- **used on:** S03 (Transactions List), S11 (Analytics)

---

### MonthYearSelector
- **variants:** inline header navigator with left chevron, month-year title, right chevron
- **sizes:** height 44px
- **states:** default, disabled next (when viewing current future month), pressed chevron
- **tokens:** `text-text font-semibold text-base chevron:text-text-muted`
- **a11y:** buttons have labels "Previous month", "Next month", heading announces current month
- **used on:** S01 (Dashboard), S09 (Budget)

---

### ProgressBar (Budget)
- **variants:** linear progress with color thresholds (0-75% green/income, 75-99% warning, 100%+ danger)
- **sizes:** track height 8px, rounded pill
- **states:** normal, warning, exceeded
- **tokens:** track: `bg-surface rounded-pill`, fill: `bg-accent` or `bg-warning` or `bg-danger`
- **a11y:** `accessibilityRole="progressbar"`, `accessibilityValue={{ min: 0, max: 100, now: pct }}`
- **used on:** S09 (Budget Planner), S10 (Budget Detail)

---

### PieChart / DonutChart
- **variants:** donut chart with center total callout, legend list below
- **sizes:** chart diameter 200px, stroke width 28px
- **states:** loaded with data, empty state (grey ring placeholder), slice tapped/highlighted
- **tokens:** slices use palette `chart-1` through `chart-8`, center text `text-text font-bold`
- **a11y:** accessible legend with percentages and amounts for screen readers
- **used on:** S11 (Analytics screen)

---

### CashFlowChart (Bar / Line)
- **variants:** grouped bar chart (income vs expense by day/month), line trend
- **sizes:** height 220px, responsive width
- **states:** loaded, empty, tooltip active on touch
- **tokens:** income bars: `bg-income`, expense bars: `bg-expense`, grid: `border-border`
- **a11y:** accessible data table summary accessible via screen reader
- **used on:** S11 (Analytics screen)

---

### AccountCard
- **variants:** asset card, liability card
- **sizes:** card height 76px
- **states:** default, pressed (navigate to account transactions), swipe actions
- **tokens:** `bg-surface-elevated border border-border rounded-xl shadow-card`
- **a11y:** announce account name, account type, balance
- **used on:** S05 (Accounts Management)

---

### IconPicker & ColorPicker
- **variants:** 6-column grid of curated Lucide financial & lifestyle icons; 8-swatch color picker
- **sizes:** icon cell 44x44px; color swatch 36x36px circle
- **states:** selected (ring-2, checkmark), default
- **tokens:** swatch: `rounded-full`, selected: `ring-2 ring-offset-2 ring-accent`
- **a11y:** announce icon name ("Shopping bag icon") or color name ("Emerald green")
- **used on:** S06 (Add/Edit Account), S08 (Add/Edit Category)

---

### ConfirmDialog
- **variants:** destructive confirmation (Delete transaction, Delete account, Overwrite DB restore), warning confirmation
- **sizes:** modal width 90% (max 360px)
- **states:** open, closing
- **tokens:** `bg-surface-elevated rounded-2xl p-6 shadow-pop`, action button `bg-danger text-white`
- **a11y:** alertdialog role with focus trapped inside modal
- **used on:** S04, S06, S08, S13, S17

---

### DriveBackupListItem
- **variants:** backup file card (shows file name, timestamp, size in KB/MB, cloud icon)
- **sizes:** height 64px
- **states:** default, selected for restore, downloading indicator
- **tokens:** `bg-surface-elevated border border-border rounded-xl p-3`
- **a11y:** announce "Backup from [Date], size [X] kilobytes, tap to restore"
- **used on:** S17 (Google Drive Backup screen)

---

### EmptyState
- **variants:** no transactions, no budgets, no search results, no cloud backups
- **sizes:** centered container with 64px illustration icon, title, subtitle, CTA button
- **states:** default static
- **tokens:** icon: `text-text-muted`, title: `text-text font-semibold`, button: `bg-accent`
- **a11y:** clearly announces absence of records and next suggested action
- **used on:** S01, S03, S05, S09, S11, S17
