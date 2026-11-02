# Bug Reports: IKnowMyMoney

Track bugs found during testing, their severity, and resolutions.

---

### BUG-001: Incorrect relative import path in transactions screen
- **Severity:** S2 (Build blocking)
- **Flow / case:** F05 / F05-H1
- **Screen:** S03 (`app/(tabs)/transactions.tsx`)
- **Build:** 1.0.0-beta

**Steps:**
1. Run `npx tsc --noEmit`.
2. Inspect import line 17 in `app/(tabs)/transactions.tsx`.

- **Expected:** Module `../../src/utils/money` imports correctly.
- **Actual:** Import pointed to `../../utils/money` resulting in TS2307 compilation error.
- **Evidence:** `TS2307: Cannot find module '../../utils/money'`
- **Fix:** Updated import path to `../../src/utils/money`.
- **Status:** Fixed

---

### BUG-002: Expo FileSystem Next missing legacy `documentDirectory` export
- **Severity:** S2 (Feature blocking)
- **Flow / case:** F10, F11, F13
- **Screen:** S12, S13, S17 (`settings.tsx`, `local.tsx`, `drive.tsx`)
- **Build:** 1.0.0-beta

**Steps:**
1. Run `npx tsc --noEmit`.
2. Attempt to read `FileSystem.documentDirectory`.

- **Expected:** `FileSystem.documentDirectory` provides path to app files.
- **Actual:** Expo SDK 58 introduced FileSystem Next, moving legacy methods to `expo-file-system/legacy`.
- **Evidence:** `TS2339: Property 'documentDirectory' does not exist on type 'typeof import("expo-file-system")'`
- **Fix:** Switched imports to `import * as FileSystem from 'expo-file-system/legacy'`.
- **Status:** Fixed

---

### BUG-003: Missing declaration for CSS side-effect import
- **Severity:** S3 (TypeScript warning / error)
- **Flow / case:** Root Layout
- **Screen:** Root (`app/_layout.tsx`)
- **Build:** 1.0.0-beta

**Steps:**
1. Run `npx tsc --noEmit`.
2. `app/_layout.tsx` imports `../global.css`.

- **Expected:** CSS file imports cleanly without type error.
- **Actual:** TS2882 error: Cannot find module or type declarations for side-effect import of '../global.css'.
- **Fix:** Added `declare module '*.css'` to `nativewind-env.d.ts`.
- **Status:** Fixed

---

---

### BUG-004: Android 15 edge-to-edge system bar overlaps bottom navigation and headers
- **Severity:** S2 (Major UI / interaction obstruction)
- **Flow / case:** Global UI Navigation
- **Screen:** All screens & Bottom Navigation Bar
- **Build:** 1.0.0-beta

**Steps:**
1. Run app on Google Pixel 9 running Android 15.
2. Bottom 3-button navigation bar overlaps bottom tab bar items.
3. Top camera hole-punch and status bar overlaps screen titles.

- **Expected:** Content properly inset inside safe display regions.
- **Actual:** Native React Native `SafeAreaView` only functions on iOS; Android 15 enforces edge-to-edge rendering by default.
- **Fix:** Wrapped `app/_layout.tsx` in `<SafeAreaProvider>`, dynamically padded tab bar with `useSafeAreaInsets().bottom`, and migrated all 15 screens to `react-native-safe-area-context`.
- **Status:** Fixed

---

### BUG-005: NativeWind runtime transition and scale mutation crash on category tap
- **Severity:** S2 (Crash on user action)
- **Flow / case:** F01 / F02 (Log Expense / Income)
- **Screen:** S02 (`src/components/ui/CategoryGrid.tsx`)
- **Build:** 1.0.0-beta

**Steps:**
1. Tap FAB (+) to log an expense.
2. Tap any category pill (e.g. Groceries).

- **Expected:** Category is selected and highlighted.
- **Actual:** NativeWind v4 dynamically mutates `<View>` into `AnimatedComponent` when evaluating `transition-all scale-105`, which crashed React 19 Fiber with `Couldn't find a LinkingContext`.
- **Fix:** Removed dynamic `transition-all scale-105` classes from `CategoryGrid.tsx`, using static border styles instead.
- **Status:** Fixed

---

### BUG-006: Hardcoded SQLite database path causes "Database Not Found" during backup export
- **Severity:** S2 (Feature blocking)
- **Flow / case:** F11 / F12 (Local Backup & Drive Backup)
- **Screen:** `app/backup/local.tsx`, `app/backup/drive.tsx`
- **Build:** 1.0.0-beta

**Steps:**
1. Go to Settings → Local Device Backup.
2. Tap "Export Backup File (.ikmm)".

- **Expected:** Database snapshot exported to `.ikmm` and system share sheet opened.
- **Actual:** App threw alert: "Database Not Found: No local database file exists yet." due to hardcoded path `${FileSystem.documentDirectory}SQLite/iknowmymoney.db`.
- **Fix:** Used `(await getDatabase()).databasePath` with fallback to `db.serializeAsync('main')` binary snapshotting directly into the target `.ikmm` file.
- **Status:** Fixed

---

## Bug Summary

| Severity | Found | Open | Fixed |
|----------|-------|------|-------|
| S1 (Critical / Data loss) | 0 | 0 | 0 |
| S2 (Major feature broken) | 5 | 0 | 5 |
| S3 (Minor / Workaround) | 1 | 0 | 1 |
| S4 (Cosmetic) | 0 | 0 | 0 |
| **Total** | **6** | **0** | **6** |

**Zero open bugs. All 14 user flows verified on physical Google Pixel 9.**
