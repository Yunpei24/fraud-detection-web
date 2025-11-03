# Fraud Detection System - User Guide

**Version:** 1.0.0  
**Last Updated:** November 3, 2025

Welcome to the Fraud Detection System! This guide will help you understand and use all features of the application based on your role.

---

## 📚 Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Dashboard](#dashboard)
4. [Transactions](#transactions)
5. [Investigation Workspace](#investigation-workspace)
6. [Drift Monitoring](#drift-monitoring)
7. [User Management (Admin Only)](#user-management-admin-only)
8. [Tips & Best Practices](#tips--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Accessing the Application

1. **Open your web browser** and navigate to:
   ```
   http://localhost:3002  (Development)
   https://your-app-url.com  (Production)
   ```

2. **Login Page**: You'll see a secure login screen

   ![Login Screen Preview]
   ```
   ┌─────────────────────────────┐
   │  Fraud Detection System     │
   ├─────────────────────────────┤
   │  Username: [_____________]  │
   │  Password: [_____________]  │
   │  [ Login ]                  │
   └─────────────────────────────┘
   ```

3. **Enter Your Credentials**:
   - Username: Provided by your administrator
   - Password: Your secure password

4. **Click "Login"** - You'll be redirected to the Dashboard

### First Time Login

If this is your first time logging in:

1. ✅ Check your email for credentials from IT/Admin team
2. ✅ Change your password immediately (coming soon)
3. ✅ Familiarize yourself with the interface
4. ✅ Review this user guide

---

## 👥 User Roles & Permissions

The system has **three role types**, each with different access levels:

### 🔴 Admin (Administrator)

**Full System Access**

✅ **Can Do Everything:**
- View all dashboards and reports
- Search and analyze transactions
- Investigate and provide feedback
- Monitor drift and model performance
- **Manage users** (create, edit, delete, activate/deactivate)
- **View production models** and deployment status
- Access all administrative features

**Use Cases:**
- System configuration and maintenance
- User account management
- Critical fraud investigation oversight
- Strategic decision making

---

### 🟡 Analyst

**Investigation & Analysis Access**

✅ **Can Do:**
- View dashboard metrics and alerts
- Search and analyze transactions
- **Investigate suspicious transactions**
- **Provide expert feedback** on fraud cases
- Access SHAP explanations for model decisions
- Monitor drift reports
- View production model status

❌ **Cannot Do:**
- Create or manage user accounts
- Access admin-only features
- Change system configurations

**Use Cases:**
- Daily fraud investigation
- Transaction review and feedback
- Pattern analysis and reporting
- Collaboration with fraud teams

---

### 🟢 Viewer

**Read-Only Access**

✅ **Can Do:**
- View dashboard metrics
- Browse transaction history
- See fraud alerts and statistics
- View drift monitoring reports
- Check model performance

❌ **Cannot Do:**
- Investigate transactions (no feedback submission)
- Access SHAP explanations
- Manage users
- Change any data

**Use Cases:**
- Monitoring fraud trends
- Generating reports for management
- Observing system health
- Educational purposes

---

## 📊 Dashboard

**Access:** All roles  
**Path:** `/` or `/dashboard`

The Dashboard is your **home base** for real-time fraud monitoring.

### Key Components

#### 1. **Metrics Cards** (Top Row)

```
┌──────────────────────────────────────────────────────────────┐
│  Total Transactions    Fraud Detected    Unique Customers    │
│      125,450              245              45,230            │
│   $1,245,890.00        1.95% rate       12,450 merchants    │
└──────────────────────────────────────────────────────────────┘
│                    Fraud Amount                              │
│                    $89,450.00                                │
│                  7.18% of total                              │
└──────────────────────────────────────────────────────────────┘
```

**What You See:**
- **Total Transactions**: Number of transactions processed
- **Fraud Detected**: Count and percentage of fraudulent transactions
- **Unique Customers**: Active customers and merchants
- **Fraud Amount**: Total dollar value of detected fraud

**How to Use:**
- Quick health check at start of day
- Spot unusual spikes in fraud rate
- Monitor transaction volumes

#### 2. **Production Models Card**

```
┌─────────────────────────────────────────────────────────────┐
│  Production Models                    ✅ PRODUCTION         │
│  ✅ Stable Production                                        │
├─────────────────────────────────────────────────────────────┤
│  ✓ Champion Models                                          │
│    📦 fraud_detection_xgboost/Production        Active      │
│    📦 fraud_detection_random_forest/Production  Active      │
├─────────────────────────────────────────────────────────────┤
│  Last updated: Nov 3, 2025, 12:30 PM                        │
└─────────────────────────────────────────────────────────────┘
```

**What You See:**
- Current deployment mode (Production or Canary)
- Active ML models serving predictions
- Traffic split if canary deployment is active
- Last configuration update time

**Status Indicators:**
- 🟢 **PRODUCTION** - Models are stable and serving 100% traffic
- 🟡 **CANARY** - New models being tested with partial traffic

**What This Means:**
- You can trust the predictions from these models
- If you see "Canary Active", new models are being gradually rolled out
- Model names tell you which algorithm is being used (XGBoost, Random Forest)

#### 3. **Live Fraud Alert Banner** (When Active)

```
┌─────────────────────────────────────────────────────────────┐
│  🚨 5 New Fraud Alerts Detected!                    [Dismiss]│
│  Just received from real-time pipeline - Check Investigation│
└─────────────────────────────────────────────────────────────┘
```

**When You See This:**
1. New fraud has been detected in real-time
2. Click anywhere on the alert to go to Investigation page
3. Or dismiss to continue working (alerts saved automatically)

#### 4. **Fraud Alert Stream** (Main Content)

```
┌─────────────────────────────────────────────────────────────┐
│  Recent Fraud Alerts                                         │
├─────────────────────────────────────────────────────────────┤
│  🔴 HIGH RISK (0.95)                                         │
│  TXN-123456 | $1,245.00 | Customer: C-789                   │
│  2 minutes ago                                               │
│  ────────────────────────────────────────────────────────────│
│  🟠 MEDIUM RISK (0.67)                                       │
│  TXN-123457 | $345.50 | Customer: C-234                     │
│  15 minutes ago                                              │
└─────────────────────────────────────────────────────────────┘
```

**Risk Levels:**
- 🔴 **HIGH** (≥80%): Immediate attention required
- 🟠 **MEDIUM** (50-79%): Review recommended
- 🟡 **LOW** (30-49%): Monitor
- 🟢 **SAFE** (<30%): Low concern

**Actions:**
- Click on any alert to view full transaction details
- Alerts auto-refresh every 30 seconds

#### 5. **Fraud Timeline Chart** (Bottom)

```
Fraud Detection Over Time (24 Hours)

Transactions: ▬▬▬▬▬▬▬▬ (bar chart)
Fraud Rate:   ▬ ▬ ▬ ▬ (line chart)

Time axis: 00:00 → 04:00 → 08:00 → 12:00 → 16:00 → 20:00 → 24:00
```

**What It Shows:**
- Blue bars: Total transactions per hour
- Red line: Fraud rate percentage over time

**How to Use:**
- Identify peak fraud hours
- Spot unusual patterns or spikes
- Compare current trends to historical data

### Dashboard Controls

**Auto-Refresh Toggle:**
```
☑ Auto-refresh (30s)  [Refresh Now]
```

- **Checked**: Dashboard updates automatically every 30 seconds
- **Unchecked**: Manual refresh only (click "Refresh Now" button)

**When to Use:**
- ✅ Enable auto-refresh during active monitoring
- ❌ Disable when analyzing specific data or taking screenshots

---

## 💳 Transactions

**Access:** All roles  
**Path:** `/transactions`

Search, filter, and analyze all transactions in the system.

### Search Interface

```
┌────────────────────────────────────────────────────────────┐
│  Search Transactions                                        │
├────────────────────────────────────────────────────────────┤
│  Search: [_________________________]  🔍                    │
│                                                             │
│  Filters:                                                   │
│    Date Range: [From: ____] [To: ____]                     │
│    Amount:     [Min: ____] [Max: ____]                     │
│    Fraud Risk: [All ▼] [High/Medium/Low/Safe]              │
│    Status:     [All ▼] [Fraud/Legitimate/Pending]          │
│                                                             │
│  [ Apply Filters ]  [ Clear ]                              │
└────────────────────────────────────────────────────────────┘
```

### Search Tips

**By Transaction ID:**
```
TXN-123456
```

**By Customer ID:**
```
CUST-789
```

**By Amount Range:**
```
Min: 100.00
Max: 500.00
```

**By Date:**
```
From: 2025-11-01
To: 2025-11-03
```

**By Risk Level:**
- Select "High" to see only high-risk transactions
- Combine with date range for specific periods

### Transaction Table

```
┌──────────────┬─────────┬──────────┬────────────┬───────────┐
│ Transaction  │ Amount  │ Customer │ Risk Score │ Status    │
├──────────────┼─────────┼──────────┼────────────┼───────────┤
│ TXN-123456   │ $1,245  │ C-789    │ 0.95 🔴   │ Fraud     │
│ TXN-123457   │ $345    │ C-234    │ 0.67 🟠   │ Pending   │
│ TXN-123458   │ $89     │ C-567    │ 0.15 🟢   │ Legit     │
└──────────────┴─────────┴──────────┴────────────┴───────────┘
```

**Column Descriptions:**
- **Transaction ID**: Unique identifier (click to view details)
- **Amount**: Transaction value in USD
- **Customer**: Customer ID (click to see customer history)
- **Risk Score**: ML model confidence (0.00 - 1.00)
- **Status**: Current classification (Fraud/Legitimate/Pending)

### Viewing Transaction Details

**Click on any transaction** to open the detail modal:

```
┌─────────────────────────────────────────────────────────────┐
│  Transaction Details                              [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│  Transaction ID: TXN-123456                                 │
│  Amount: $1,245.00                                          │
│  Time: Nov 3, 2025, 14:35:22                                │
│  Customer ID: CUST-789                                      │
│  Merchant ID: MERCH-456                                     │
│                                                             │
│  Risk Assessment:                                           │
│  Score: 0.95 (HIGH RISK) 🔴                                 │
│  Model Version: v1.2.3                                      │
│  Prediction Time: 2025-11-03 14:35:23                       │
│                                                             │
│  Top Contributing Features:                                 │
│  1. Transaction Amount (+0.35)                              │
│  2. Time of Day (+0.28)                                     │
│  3. Customer Location (+0.22)                               │
│                                                             │
│  [ View Full Details ]  [ Export CSV ]                      │
└─────────────────────────────────────────────────────────────┘
```

### Exporting Data

**Export Button** (Top Right):
```
[ ↓ Export CSV ]
```

**What Gets Exported:**
- All visible transactions (based on current filters)
- Maximum 10,000 rows per export
- Includes: ID, Amount, Date, Customer, Risk Score, Status

**CSV Format:**
```csv
transaction_id,amount,time,customer_id,risk_score,status
TXN-123456,1245.00,2025-11-03 14:35:22,CUST-789,0.95,fraud
TXN-123457,345.50,2025-11-03 14:40:15,CUST-234,0.67,pending
```

---

## 🔍 Investigation Workspace

**Access:** Analyst, Admin only  
**Path:** `/investigation`

The Investigation Workspace is where analysts review suspicious transactions and provide expert feedback.

### Why Investigation Matters

Your feedback helps:
- ✅ Improve ML model accuracy
- ✅ Reduce false positives
- ✅ Catch sophisticated fraud patterns
- ✅ Train future models

### Investigation Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Pending Reviews (25 transactions)                          │
├─────────────────────────────────────────────────────────────┤
│  🔴 TXN-123456 | $1,245.00 | Risk: 0.95 | 2 min ago        │
│  [ Investigate ]  [ View SHAP ]                             │
│  ────────────────────────────────────────────────────────────│
│  🟠 TXN-123457 | $345.50 | Risk: 0.67 | 15 min ago         │
│  [ Investigate ]  [ View SHAP ]                             │
└─────────────────────────────────────────────────────────────┘
```

### Investigation Process

#### Step 1: Review Transaction

Click **"Investigate"** to open the feedback form:

```
┌─────────────────────────────────────────────────────────────┐
│  Investigation - TXN-123456                       [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│  Transaction Details:                                       │
│  Amount: $1,245.00                                          │
│  Customer: CUST-789                                         │
│  Model Risk: 0.95 (HIGH)                                    │
│                                                             │
│  Your Expert Assessment:                                    │
│  ○ Confirmed Fraud                                          │
│  ○ Legitimate Transaction (False Positive)                  │
│  ○ Needs More Investigation                                 │
│                                                             │
│  Confidence Level: [Slider 0%──────●───100%] 75%           │
│                                                             │
│  Investigation Notes:                                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Suspicious pattern: Large amount, unusual time,     │  │
│  │ customer location mismatch. Recommend account lock. │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [ Submit Feedback ]  [ Cancel ]                            │
└─────────────────────────────────────────────────────────────┘
```

#### Step 2: Make Your Assessment

**Choose One:**

1. **✅ Confirmed Fraud**
   - You're certain this is fraudulent
   - Use when: Multiple red flags, customer confirms, verified fraud pattern

2. **❌ Legitimate Transaction (False Positive)**
   - Model was wrong, transaction is legitimate
   - Use when: Customer verified, known business pattern, ML misclassified

3. **🔄 Needs More Investigation**
   - Not enough information yet
   - Use when: Waiting for customer contact, need additional data

#### Step 3: Set Confidence Level

Move the slider to indicate your confidence:

- **90-100%**: Very certain of your assessment
- **70-89%**: Confident but some uncertainty
- **50-69%**: Moderate confidence
- **Below 50%**: Low confidence (consider "Needs More Investigation")

#### Step 4: Add Notes

**Good Investigation Notes Include:**

✅ **Do:**
```
- Customer confirmed unauthorized transaction
- IP address from known fraud location
- Similar pattern to TXN-123400 (confirmed fraud)
- Card not present transaction, suspicious
```

❌ **Don't:**
```
- "looks bad" (too vague)
- "fraud" (no explanation)
- Empty notes (always provide reasoning)
```

**Character Limit:** 500 characters

#### Step 5: Submit

Click **"Submit Feedback"** - Your assessment is now logged and will help train future models!

### Understanding SHAP Explanations

Click **"View SHAP"** to see why the ML model flagged this transaction:

```
┌─────────────────────────────────────────────────────────────┐
│  SHAP Explanation - TXN-123456                    [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│  Model Type: [Ensemble ▼]  (XGBoost + Random Forest)       │
│                                                             │
│  Feature Contributions to Fraud Prediction:                 │
│                                                             │
│  Amount ($1,245.00)        ████████████ +0.35 (34%)        │
│  Time (02:30 AM)          ████████ +0.28 (27%)            │
│  Location Mismatch        ████ +0.15 (15%)                 │
│  Transaction Frequency    ███ +0.12 (12%)                  │
│  Customer History         ▌ +0.05 (5%)                     │
│                                                             │
│  Base Value: 0.02  → Prediction: 0.95                       │
│                                                             │
│  Interpretation:                                            │
│  • High amount strongly indicates fraud (+0.35)            │
│  • Unusual time (2:30 AM) adds risk (+0.28)                │
│  • Transaction from different location than usual          │
│                                                             │
│  [ Download Chart ]                                         │
└─────────────────────────────────────────────────────────────┘
```

**What SHAP Shows:**

- **Feature Contributions**: How much each feature pushed the prediction toward "fraud"
- **Bar Length**: Magnitude of contribution
- **+ Values**: Increased fraud likelihood
- **Base Value**: Starting probability before considering features

**How to Use SHAP:**

1. **Validate Model Logic**: Does the model's reasoning make sense?
2. **Find Weaknesses**: Is the model over-relying on one feature?
3. **Improve Investigations**: Focus on top contributing features
4. **Explain to Others**: Show stakeholders why ML made this decision

### Investigation Best Practices

#### ✅ Do's

- **Investigate promptly**: Review high-risk transactions within 1 hour
- **Be thorough**: Check all available data before making assessment
- **Use SHAP**: Understand why model flagged the transaction
- **Document reasoning**: Always add detailed notes
- **Set appropriate confidence**: Be honest about uncertainty
- **Follow up**: If you selected "Needs More Investigation", revisit later

#### ❌ Don'ts

- **Don't rush**: Take time to analyze properly
- **Don't ignore model input**: SHAP helps you understand patterns
- **Don't leave blank notes**: Always explain your reasoning
- **Don't mark 100% confidence**: Unless absolutely certain
- **Don't forget to submit**: Unsaved feedback doesn't help the system

---

## 📈 Drift Monitoring

**Access:** All roles (Read-only for Viewer)  
**Path:** `/drift`

Monitor how model performance and data patterns change over time.

### What is Drift?

**Data Drift**: When incoming transaction patterns change compared to training data  
**Model Drift**: When model accuracy decreases over time

**Why It Matters:**
- Models trained on old patterns may not catch new fraud techniques
- Business changes (new products, regions) affect transaction patterns
- Seasonal variations impact fraud rates

### Drift Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Drift Monitoring Overview                                  │
├─────────────────────────────────────────────────────────────┤
│  Current Status: ⚠️ WARNING                                 │
│  Last Check: 5 minutes ago                                  │
│                                                             │
│  Drift Statistics:                                          │
│  ┌──────────┬─────────┬──────────┬───────────┐             │
│  │ Metric   │ Current │ Baseline │ Drift %   │             │
│  ├──────────┼─────────┼──────────┼───────────┤             │
│  │ Accuracy │ 94.2%   │ 96.5%    │ -2.3% 🟡  │             │
│  │ Precision│ 89.1%   │ 91.2%    │ -2.1% 🟡  │             │
│  │ Recall   │ 92.5%   │ 93.8%    │ -1.3% 🟢  │             │
│  └──────────┴─────────┴──────────┴───────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Drift Reports Table

```
┌──────────────────────────────────────────────────────────────┐
│  Recent Drift Reports                                         │
├──────────────────────────────────────────────────────────────┤
│  🔴 CRITICAL | Feature Drift Detected | 2 hours ago          │
│  Feature 'Amount' distribution shifted significantly          │
│  [ View Details ]                                             │
│  ──────────────────────────────────────────────────────────── │
│  🟡 WARNING | Performance Degradation | 1 day ago            │
│  Accuracy dropped from 96.5% to 94.2%                        │
│  [ View Details ]                                             │
└──────────────────────────────────────────────────────────────┘
```

**Severity Levels:**

- 🔴 **CRITICAL**: Immediate action required, model may need retraining
- 🟠 **HIGH**: Significant drift, schedule review
- 🟡 **MEDIUM**: Monitor closely
- 🔵 **LOW**: Minor drift, informational
- ⚪ **INFO**: No action needed

### What to Do When You See Drift

**For All Users:**
1. **Note the severity**: Critical requires immediate escalation
2. **Check frequency**: One-time vs. recurring drift
3. **Review recent changes**: New products? Marketing campaigns?
4. **Document**: Report to team lead if unusual patterns

**For Admins:**
1. **Alert data science team**: They may need to retrain models
2. **Review recent deployments**: Did a new model cause this?
3. **Check data pipeline**: Are data collection processes working?
4. **Schedule retraining**: If drift persists beyond thresholds

---

## 👥 User Management (Admin Only)

**Access:** Admin only  
**Path:** `/admin/users`

Administrators can manage user accounts, roles, and access.

### User Management Interface

```
┌─────────────────────────────────────────────────────────────┐
│  User Management                        [ + Create User ]   │
├─────────────────────────────────────────────────────────────┤
│  Search: [_______________] 🔍                                │
│                                                             │
│  ┌──────────┬──────────┬───────┬────────┬──────────────┐   │
│  │ Username │ Email    │ Role  │ Status │ Actions      │   │
│  ├──────────┼──────────┼───────┼────────┼──────────────┤   │
│  │ john_doe │ john@... │ Admin │ Active │ [Edit] [⋮]  │   │
│  │ jane_s   │ jane@... │ Analyst│ Active│ [Edit] [⋮]  │   │
│  │ bob_v    │ bob@...  │ Viewer │ Inactive│[Edit] [⋮] │   │
│  └──────────┴──────────┴───────┴────────┴──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Creating a New User

Click **"+ Create User"**:

```
┌─────────────────────────────────────────────────────────────┐
│  Create New User                                  [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│  Username: [__________________] *required                   │
│  Email:    [__________________] *required                   │
│  Password: [__________________] *required (min 8 chars)     │
│                                                             │
│  Role:     ○ Admin  ○ Analyst  ○ Viewer                     │
│                                                             │
│  ☑ Active (user can login immediately)                      │
│  ☐ Verified (email verified)                                │
│                                                             │
│  [ Create User ]  [ Cancel ]                                │
└─────────────────────────────────────────────────────────────┘
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (@$!%*?&)

### Editing Users

Click **"Edit"** next to any user:

```
┌─────────────────────────────────────────────────────────────┐
│  Edit User: john_doe                              [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│  Email:    [john.doe@company.com]                           │
│  Role:     ○ Admin  ● Analyst  ○ Viewer                     │
│                                                             │
│  Status:   ☑ Active                                         │
│            ☑ Verified                                       │
│                                                             │
│  [ Change Password ]                                        │
│                                                             │
│  [ Save Changes ]  [ Cancel ]                               │
└─────────────────────────────────────────────────────────────┘
```

### User Actions Menu (⋮)

Click the **three dots** for additional actions:

```
┌───────────────────────┐
│ View Details          │
│ Change Role           │
│ Reset Password        │
│ ─────────────────────│
│ Deactivate Account    │
│ Delete User           │
└───────────────────────┘
```

**Action Descriptions:**

- **View Details**: See full user profile and activity log
- **Change Role**: Quickly switch between Admin/Analyst/Viewer
- **Reset Password**: Generate temporary password for user
- **Deactivate**: Prevent login without deleting account
- **Delete**: Permanently remove user (⚠️ Cannot be undone)

### Best Practices

#### Security

✅ **Do:**
- Review user list quarterly
- Deactivate users who leave the company immediately
- Use strong passwords
- Enable "Verified" only after confirming email
- Assign minimum necessary role (principle of least privilege)

❌ **Don't:**
- Share admin accounts
- Use default passwords
- Keep inactive accounts active
- Give Admin role to everyone

#### Role Assignment Guidelines

**Give Admin to:**
- System administrators
- Team leads
- IT staff managing the platform

**Give Analyst to:**
- Fraud analysts
- Investigation team members
- Risk assessment specialists

**Give Viewer to:**
- Management (viewing reports)
- Stakeholders (monitoring only)
- Trainees (learning the system)

---

## 💡 Tips & Best Practices

### For All Users

#### Daily Routine

**Morning Checklist:**
1. ✅ Check Dashboard for overnight activity
2. ✅ Review any critical alerts
3. ✅ Check model status (any canary deployments?)
4. ✅ Scan drift reports for warnings

**End of Day:**
1. ✅ Complete pending investigations
2. ✅ Document any unusual patterns
3. ✅ Report significant findings to team

#### Efficiency Tips

**Keyboard Shortcuts:**
- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + R`: Refresh current page
- `Esc`: Close modals

**Bookmarks:**
- Bookmark frequently used filters
- Save common date ranges
- Create custom dashboard views

**Browser Settings:**
- Enable notifications for real-time alerts
- Use a dedicated browser profile for work
- Keep multiple tabs open (Dashboard + Investigation)

### For Analysts

#### Investigation Workflow

**Prioritize by Risk:**
1. 🔴 HIGH (≥80%): Review within 1 hour
2. 🟠 MEDIUM (50-79%): Review within 4 hours
3. 🟡 LOW (30-49%): Review within 24 hours

**Use SHAP Extensively:**
- Always check SHAP before making final assessment
- Look for unusual feature patterns
- Document if model reasoning seems incorrect

**Collaborate:**
- Share complex cases with team
- Use investigation notes to communicate findings
- Create pattern documentation for recurring fraud types

**Quality Over Quantity:**
- Better to investigate 10 cases thoroughly than 50 superficially
- High-quality feedback trains better models
- Your confidence level should reflect real certainty

### For Admins

#### System Monitoring

**Weekly Tasks:**
- Review drift reports summary
- Check model performance trends
- Audit user activity logs
- Review any system errors

**Monthly Tasks:**
- Evaluate user roles and access
- Review false positive rates
- Coordinate with data science on model updates
- Generate management reports

**Quarterly Tasks:**
- User access audit
- Security review
- Performance optimization assessment
- Training needs assessment

#### Crisis Management

**If High Fraud Spike:**
1. Alert team immediately
2. Check for system issues (drift, model errors)
3. Increase monitoring frequency
4. Contact data science team if model-related
5. Document incident timeline

**If System Outage:**
1. Check health endpoint: `http://your-app/health`
2. Verify database connectivity
3. Check FastAPI backend status
4. Review logs for errors
5. Contact DevOps/IT if infrastructure issue

---

## 🔧 Troubleshooting

### Common Issues

#### Cannot Login

**Symptoms:**
- "Invalid credentials" error
- "Authentication service unavailable"

**Solutions:**

1. **Verify Credentials**:
   ```
   ✓ Username is correct (case-sensitive)
   ✓ Password is correct
   ✓ Account is active (ask admin)
   ```

2. **Check Caps Lock**: Passwords are case-sensitive

3. **Clear Browser Cache**:
   ```
   Chrome: Ctrl+Shift+Delete → Clear cached images and files
   Firefox: Ctrl+Shift+Delete → Cache
   Safari: Cmd+Option+E
   ```

4. **Try Different Browser**: Test in incognito/private mode

5. **Contact Admin**: Your account may be deactivated

#### Data Not Loading

**Symptoms:**
- Blank screens
- Spinning loaders forever
- "Failed to load data" errors

**Solutions:**

1. **Refresh Page**: Ctrl/Cmd + R

2. **Check Internet Connection**: Ensure you're connected

3. **Check Browser Console**:
   ```
   Press F12 → Console tab
   Look for red error messages
   Screenshot and send to admin
   ```

4. **Try Again Later**: May be temporary server issue

5. **Clear Cache**: Old cached data may cause issues

#### Real-time Alerts Not Appearing

**Symptoms:**
- Dashboard says "connecting..." forever
- No live alerts even though fraud is occurring

**Solutions:**

1. **Check WebSocket Connection**:
   - Open browser console (F12)
   - Look for "WebSocket connected" message
   - Should see: `Connected to WebSocket server`

2. **Disable Browser Extensions**: Ad blockers may block WebSocket

3. **Check Firewall**: Corporate firewalls may block WebSocket connections

4. **Verify Backend Status**: Ask admin to check backend health

#### SHAP Explanation Fails

**Symptoms:**
- "Failed to load SHAP explanation" error
- Modal opens but shows error

**Solutions:**

1. **Check Transaction Has Features**: Very old transactions may not have feature data

2. **Wait and Retry**: SHAP calculation takes time (10-15 seconds)

3. **Try Different Model**: Switch between Ensemble/XGBoost/Random Forest

4. **Report to Admin**: If consistently failing, may be backend issue

#### Slow Performance

**Symptoms:**
- Pages load slowly
- Search takes forever
- Laggy interface

**Solutions:**

1. **Reduce Filter Range**:
   - Don't query more than 30 days at once
   - Limit search results to 1,000 records

2. **Close Other Tabs**: Browser may be memory-constrained

3. **Clear Browser Cache**: Old data may slow down app

4. **Check Internet Speed**: Slow connection affects performance

5. **Report Persistent Issues**: May be server-side optimization needed

---

## 📞 Getting Help

### In-App Help

**Help Icons:** Look for `❓` icons throughout the interface for contextual help

**Status Page:** Check system status at `/health`

### Contact Support

**Internal Support:**
- **IT Help Desk**: it-support@company.com
- **Fraud Team Lead**: fraud-lead@company.com
- **System Admin**: admin@company.com

**What to Include in Support Requests:**

```
Subject: [Issue Type] Brief Description

1. Your username: john_doe
2. Your role: Analyst
3. What you were doing: Investigating TXN-123456
4. What happened: SHAP explanation failed to load
5. Error message: "Failed to load explanation: 500 Internal Server Error"
6. Browser: Chrome 119.0
7. Time: 2025-11-03 14:35 UTC
8. Screenshots: [Attached]
```

### Training Resources

**Available Training:**
- 📚 Video tutorials: `http://training.company.com/fraud-detection`
- 📖 Knowledge base: `http://wiki.company.com/fraud-detection`
- 🎓 Certification program: Contact HR for enrollment

**New User Onboarding:**
- Week 1: System overview and basic navigation
- Week 2: Investigation techniques and SHAP analysis
- Week 3: Advanced features and best practices
- Week 4: Team collaboration and reporting

---

## 📋 Glossary

**Common Terms:**

- **SHAP**: SHapley Additive exPlanations - Method to explain ML model predictions
- **Drift**: Change in data patterns or model performance over time
- **False Positive**: Transaction flagged as fraud but actually legitimate
- **False Negative**: Fraudulent transaction not caught by model
- **Ensemble Model**: Combination of multiple ML models for better accuracy
- **Risk Score**: Probability (0-1) that transaction is fraudulent
- **Feature**: Data point used by model (amount, time, location, etc.)
- **Canary Deployment**: Gradual rollout of new model to small percentage of traffic
- **Champion Model**: Currently best-performing production model
- **Challenger Model**: New model being tested in canary deployment

---

## 📝 Change Log

**Version 1.0.0** (November 3, 2025)
- Initial user guide release
- Covers all main features
- Role-specific instructions
- Troubleshooting section

---

## 📄 License

Internal Use Only - Confidential

---

**Questions or feedback on this guide?**  
Contact: documentation@company.com
