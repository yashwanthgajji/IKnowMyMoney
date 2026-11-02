# Launch & Publishing Plan: IKnowMyMoney

**Target Release:** v1.1.0 (Android 15 & Cross-Platform Mobile)  
**Package Name:** `com.iknowmymoney.app`  
**Version Code:** `2`  
**Distribution Channel:** Google Play Store (Internal Testing → Closed Beta → Production Track) & Direct `.apk` Standalone Build  

---

## 1. Google Play Console Publishing Steps (Developer Account)

### Step 1: Create App in Google Play Console
1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create App**:
   - **App name:** `IKnowMyMoney Expense Tracker`
   - **Default language:** `English (United States)`
   - **App or Game:** `App`
   - **Free or Paid:** `Free`
   - **Declarations:** Accept Developer Program Policies and US export laws.

### Step 2: Store Presence & Metadata
- **Short description (78/80 chars):**  
  `Private offline expense tracker. Manage accounts, budgets, and visual reports.`
- **Full description:** Copy from `replica/launch/listing.json` (linted & policy compliant).
- **App Category:** `Finance`
- **Tags:** `Personal finance`, `Expense tracker`, `Budgeting`, `Money manager`.

### Step 3: Complete Policy & Data Safety Declarations
- **App Access:** "All functionality is available without special access" (no login/password required).
- **Ads:** "No, my app does not contain ads".
- **Content Rating (IARC Questionnaire):**  
  - Category: Consumer / Utility / Financial tool.
  - Answers: No violence, no offensive language, no controlled substances.
  - Rating result: PEGI 3 / Everyone.
- **Target Audience:** 18 and over.
- **Financial Features declaration:** Personal financial management (PFM) / Expense Tracking.
- **Data Safety Form (Crucial for Privacy Apps):**
  - Does your app collect or share any user data? **Select NO**.
  - Does your app use encryption in transit? **N/A (100% offline local storage)**.
  - Can users request data deletion? **Yes (All data is deleted when user uninstalls app or clears app data)**.

### Step 4: Graphical Assets Checklist
- **App Icon:** 512 × 512 px 32-bit PNG (`assets/icon.png` or export from design tokens).
- **Feature Graphic:** 1024 × 500 px JPG or 24-bit PNG.
- **Phone Screenshots (Pixel 9 1080×2424):**
  1. `evidence-f14-dashboard-final.png` (Home Dashboard & Net Worth)
  2. `evidence-f07-budget-tracker.png` (Category Budget Planner & Monthly History)
  3. `evidence-f08-analytics.png` (Spending Breakdown & Visual Analytics)
  4. `evidence-f05-search-filter.png` (Transaction History & Real-Time Search)
  5. `evidence-f06-new-account.png` (Multi-Account & Asset Management)

---

## 2. Production Build Execution via Expo EAS

### Build Command (Production `.aab` for Play Store):
```bash
# 1. Install EAS CLI globally if not already installed
npm install -g eas-cli

# 2. Log in to your Expo account
eas login

# 3. Trigger cloud build for Google Play Android App Bundle (.aab)
eas build --platform android --profile production
```
*The resulting `.aab` file will be generated in Expo's cloud and downloaded to your machine.*

### Alternative: Standalone Direct Install `.apk`:
```bash
# Generate direct installable APK for immediate testing on your phone
eas build --platform android --profile preview
```

---

## 3. Play Store Release Tracks
1. **Internal Testing Track:**  
   - Upload the production `.aab`.
   - Add your Google account email to the internal tester list.
   - Instantly receive a Google Play install link to test on your Pixel 9.
2. **Closed Testing (if required for new developer accounts):**  
   - Google requires 14 days of closed testing with 12 testers for new personal developer accounts.
3. **Production Track:**  
   - Promote the validated `.aab` from testing to Production.
   - Google review typically completes within 24 to 72 hours.
