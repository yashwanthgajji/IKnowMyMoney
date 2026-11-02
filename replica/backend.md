# Backend & Integrations: IKnowMyMoney

Architecture: Local-first Single-User SQLite + Google Drive API v3 (REST)

---

## 🗄️ Database (Local SQLite)
- Engine: SQLite via `expo-sqlite` (WAL Mode enabled)
- Database file: `${FileSystem.documentDirectory}SQLite/iknowmymoney.db`
- Tables created:
  - `accounts`: id, name, type, icon, color, initial_balance, is_asset, sort_order, timestamps
  - `categories`: id, name, type, icon, color, is_default, sort_order, timestamps
  - `transactions`: id, amount (cents), type, category_id (FK ON DELETE SET NULL), account_id (FK ON DELETE CASCADE), to_account_id (FK), date, note, timestamps
  - `budgets`: id, category_id (FK UNIQUE ON DELETE CASCADE), amount, period, start_date, timestamps
  - `recurring_transactions`: id, amount, type, category_id, account_id, to_account_id, frequency, timestamps
  - `drive_backups`: id, drive_file_id, file_name, file_size_bytes, db_version, created_at
- Default Seed:
  - Accounts: Cash Wallet, Main Checking
  - Expense Categories: Food & Dining, Groceries, Transportation, Bills, Entertainment, Healthcare, Education, Personal Care, Housing, Other
  - Income Categories: Salary, Freelance, Investments, Gift/Allowance, Other

---

## 🔐 Google OAuth & Drive Integration
- **OAuth Provider:** Google Identity via `expo-auth-session/providers/google`
- **Scope Requested:** `https://www.googleapis.com/auth/drive.file`
  - *Critical Privacy Guarantee:* `drive.file` allows reading and writing **only** files that are opened or created by IKnowMyMoney. The app **cannot** view, read, or access any other files on the user's Google Drive.
- **REST Endpoints Used:**
  - `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart` — Multipart file upload (metadata + base64 SQLite binary).
  - `GET https://www.googleapis.com/drive/v3/files?q=name contains 'iknowmymoney_backup'` — Lists existing remote backups.
  - `GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media` — Downloads raw database file to device.
- **OAuth Credentials:**
  - Configured via environment variables defined in `.env.example`:
    - `EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID`
    - `EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS`
    - `EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB`

---

## 🛡️ Security Checklist
- [x] Secrets / Client IDs managed via environment variables and `.env.example`
- [x] Sensitive DB credentials eliminated (zero external server; local SQLite on-device)
- [x] Principle of Least Privilege: OAuth scope restricted to `drive.file` only (no full drive access)
- [x] Input sanitization: Amount parsed to integer cents; RFC 4180 escaping on CSV export
- [x] Atomic transactions & WAL mode enabled in SQLite
- [x] Restore safety: Destructive prompt required before replacing local SQLite file
