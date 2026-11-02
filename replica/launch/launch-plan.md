# Launch & Publishing Plan: IKnowMyMoney

**Target Release:** Android 15 & Cross-Platform Mobile  
**Package Name:** `com.iknowmymoney.app`  
**Distribution Channel:** Google Play Store (Internal Testing → Closed Beta → Production Track) & Direct `.apk` Standalone Build  

---

## 1. Google Play Console Publishing Steps

### Step 1: Set Up App in Google Play Console
1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create App**:
   - App name: `IKnowMyMoney Expense Tracker`
   - Default language: `English (United States)`
   - App or Game: `App`
   - Free or Paid: `Free`
   - Declarations: Accept Developer Program Policies.

### Step 2: Complete Store Listing Tasks
- **App Access:** "All functionality is available without special access" (no login credentials required).
- **Ads:** "No, my app does not contain ads".
- **Content Rating:** Complete the IARC questionnaire (Utility / Financial Tracker — yields PEGI 3 / Everyone).
- **Target Audience:** Ages 18 and over.
- **Financial Features:** "Personal financial management (PFM) / Expense Tracking". Offline local tool.
- **Data Safety Form:**
  - Does your app collect or share any user data? **NO**.
  - All data is stored exclusively in client-side SQLite storage on device.

### Step 3: Graphical Assets Checklist
- **App Icon:** 512 × 512 px 32-bit PNG (Emerald background `#047857`, White currency symbol).
- **Feature Graphic:** 1024 × 500 px JPG or 24-bit PNG.
- **Phone Screenshots:** At least 4 screenshots (aspect ratio 16:9 or 9:16). We already have high-resolution Pixel 9 screenshots ready:
  1. `evidence-f14-dashboard-final.png` (Home Dashboard & Net Worth)
  2. `evidence-f07-budget-tracker.png` (Category Budget Planner)
  3. `evidence-f08-analytics.png` (Spending Breakdown & Charts)
  4. `evidence-f05-search-filter.png` (Transaction History & Real-Time Search)

---

## 2. Production Build Execution via Expo EAS

### Build Command (Production `.aab` for Play Store):
```bash
# 1. Install EAS CLI globally if not already installed
npm install -g eas-cli

# 2. Log in to your Expo account
eas login

# 3. Configure EAS build
eas build:configure

# 4. Trigger cloud build for Google Play Android App Bundle (.aab)
eas build --platform android --profile production
```

### Alternative: Standalone Direct Install `.apk`:
```bash
# Generate direct installable APK for immediate testing on any phone
eas build --platform android --profile preview
```

---

## 3. Post-Launch Validation
- Submit `.aab` to Google Play Console **Internal Testing** track first.
- Invite tester emails to verify installation on physical devices.
- Promote to Production once verification completes.
