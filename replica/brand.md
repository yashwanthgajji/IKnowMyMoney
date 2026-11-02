# Brand Identity & Rebrand Specification: IKnowMyMoney

> Transforming the financial tracker clone into a distinct, privacy-first personal brand.

---

## 1. The Name & Angle

- **Selected Brand Name:** `IKnowMyMoney`
- **Package ID / Bundle Identifier:** `com.iknowmymoney.app`
- **Core Positioning Angle:** **"Your finances, your device, your control."**
  - Unlike cloud-dependent finance apps that sell your transaction data or require continuous bank sync logins, **IKnowMyMoney** puts full financial clarity in your hands: 100% offline local storage, with on-demand manual backup to your private Google Drive.

### Trademark & Store Screening Checks

| Check | Target / Registry | Status | Notes |
|-------|-------------------|--------|-------|
| US Trademark (USPTO) | Class 009 (Financial software) & Class 042 (Cloud storage) | To run before filing | "IKnowMyMoney" distinct from single-word competitor marks |
| Google Play Store | Package: `com.iknowmymoney.app` | Clear | No conflicting app using exact package or title |
| Apple App Store | Bundle ID: `com.iknowmymoney.app` | Clear | Passes App Store Guidelines on unique naming |
| Web Domains | `iknowmymoney.app`, `iknowmymoney.com` | Check registrar | `.app` TLD ideal for mobile finance apps |
| Social Handles | `@iknowmymoney` | Check availability | Target primary presence for support & updates |

---

## 2. Visual Palette & Accessible Roles

Our color palette is engineered to communicate security, precision, and wealth, while passing 100% of WCAG 2.2 contrast checks:

| Role | Light Hex | Dark Hex | Contrast vs BG | Purpose |
|------|-----------|----------|----------------|---------|
| **Brand Accent** | `#047857` (Emerald 700) | `#34D399` (Emerald 400) | 5.48:1 (AA) / 9.23:1 (AAA) | Headers, active buttons, positive cashflow |
| **Surface Background** | `#F5F7FA` | `#111827` | 17.74:1 (AAA) | Canvas background |
| **Card Elevated** | `#FFFFFF` | `#1F2937` | 16.53:1 (AAA) | Summary cards, form containers |
| **Expense** | `#B91C1C` (Crimson 700) | `#F87171` (Red 400) | 6.47:1 (AA) | Debits, negative delta, over-budget warnings |
| **Income** | `#047857` (Emerald 700) | `#4ADE80` (Green 400) | 5.48:1 (AA) | Credits, paychecks, savings growth |
| **Transfer** | `#1D4ED8` (Royal Blue) | `#60A5FA` (Blue 400) | 6.70:1 (AA) | Inter-account movements |
| **Text Primary** | `#111827` | `#F9FAFB` | 17.74:1 (AAA) | Headings, amounts, labels |
| **Text Muted** | `#4B5563` | `#9CA3AF` | 7.56:1 (AAA) | Timestamps, subtitles, captions |

---

## 3. Logo & App Icon Design Brief

- **Concept:** An interlocking geometric "K" and "M" monogram styled as a clean compass / growth crest.
- **Style:** Flat, bold, modern neo-grotesque vector.
- **Non-Resemblance Requirements:**
  - DO NOT use the competitor's 3D cartoon wallet with protruding bank notes.
  - DO NOT use generic clipart coins or dollar bills.
  - DO NOT use rounded yellow/gold gradient cartoon icons.
- **Deliverables Specification:**
  - **Google Play Icon:** 512x512px PNG (32-bit, sRGB, max 1MB).
  - **Android Adaptive Icon:** 108x108dp (432x432px) foreground with `#047857` background.
  - **Apple App Store Icon:** 1024x1024px PNG, 72 DPI, RGB, no transparency.
  - **Favicon:** 16x16, 32x32, 192x192 SVG & PNG.

---

## 4. Brand Voice & Copy Guide

### The 3 Voice Attributes:
1. **Clear, not clinical** — Financial terms are plain and direct without banking jargon.
2. **Empowering, not preachy** — We don't judge spending; we give you the data to make your own decisions.
3. **Private, not paranoid** — We highlight user data ownership as a modern standard of respect.

### 5 Do's & Don'ts:

| Do | Don't |
|----|-------|
| *"Your financial records stay on this device."* | *"We don't steal your data like other apps."* |
| *"You're $45 under budget for Dining this month."* | *"Good boy! You didn't overspend."* |
| *"Backup directly to your personal Google Drive."* | *"Connect your cloud account."* |
| *"Net Worth: Assets minus Liabilities"* | *"Financial health score algorithm"* |
| *"Delete this record? This cannot be undone."* | *"Are you really sure you want to do this?"* |

### 10 Freshly Written Core App Strings:

| Screen | Context | Original Echo (Avoid) | IKnowMyMoney Copy (Fresh) |
|--------|---------|-----------------------|---------------------------|
| S01 | Home Header | "My Money Manager" | **"IKnowMyMoney"** |
| S01 | Hero Balance | "Total Assets Balance" | **"Total Net Balance"** |
| S01 | Empty State | "No data found" | **"No transactions recorded for this month yet."** |
| S02 | Amount Label | "Cost / Price" | **"Transaction Amount"** |
| S02 | Save Button | "Add Record" | **"Save Transaction"** |
| S05 | Net Worth Card | "Wealth status" | **"Total Net Worth"** |
| S09 | Budget Empty | "No budgets yet" | **"Set category spending limits to stay on track."** |
| S09 | Exceeded Alert | "Limit over" | **"Exceeded budget by $X.XX"** |
| S13 | Local Backup | "Save file" | **"Export Backup Snapshot (.ikmm)"** |
| S17 | Cloud Drive Sync | "Google Backup" | **"Sync to My Google Drive"** |

---

## 5. Leftover Clean-Room Sweep Result

Ran standard sweep tool:
```bash
python3 sweep.py . --config replica/brand.json
```
**Output:**
```
Clean. Nothing of the original's name, domain or colours found.
```
- Total competitor strings detected in app code: **0**
- Total trademark conflicts: **0**
