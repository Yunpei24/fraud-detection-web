# Fraud Detection Web - Quick Reference Card

**Version:** 1.0.0 | **Last Updated:** November 3, 2025

## 🚀 Quick Access

| Resource | URL |
|----------|-----|
| **Application** | http://localhost:3002 |
| **Backend API** | http://localhost:3001 |
| **FastAPI ML** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |
| **Health Check** | http://localhost:3001/health |

## 🔑 Demo Credentials

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `admin123` | Admin | Full access + user management |
| `analyst` | `analyst123` | Analyst | Investigation + SHAP explanations |
| `viewer` | `viewer123` | Viewer | Read-only dashboard access |

## 📱 Main Features

### For All Users
- ✅ Real-time fraud detection dashboard
- ✅ Transaction search and filtering
- ✅ Drift monitoring reports
- ✅ Production model status

### For Analysts & Admins
- ✅ Investigation workspace with feedback
- ✅ SHAP explanations for ML decisions
- ✅ Confidence ratings and notes

### For Admins Only
- ✅ User account management
- ✅ Role assignment (Admin/Analyst/Viewer)
- ✅ Account activation/deactivation

## 🎯 Risk Levels

| Level | Score | Color | Priority |
|-------|-------|-------|----------|
| **HIGH** | ≥0.80 | 🔴 Red | Review within 1 hour |
| **MEDIUM** | 0.50-0.79 | 🟠 Orange | Review within 4 hours |
| **LOW** | 0.30-0.49 | 🟡 Yellow | Review within 24 hours |
| **SAFE** | <0.30 | 🟢 Green | Monitoring only |

## 📊 Dashboard Metrics

### Metrics Cards
- **Total Transactions**: Count + total amount
- **Fraud Detected**: Count + fraud rate percentage
- **Unique Customers**: Customers + merchants count
- **Fraud Amount**: Total fraud $ + percentage of volume

### Production Models Card
- Shows active ML models in production
- Traffic split if canary deployment active
- Last configuration update timestamp

## 🔍 Investigation Workflow

1. **Review** → Go to Investigation page
2. **Assess** → Choose: Fraud / Legitimate / Needs Investigation
3. **Confidence** → Set slider (0-100%)
4. **SHAP** → View ML model reasoning (optional)
5. **Notes** → Add investigation comments (required)
6. **Submit** → Save feedback for model improvement

## 🧠 SHAP Explanation

**What it shows:**
- How ML model made its decision
- Which features contributed most
- Why transaction was flagged

**How to use:**
1. Click "View SHAP" on any transaction
2. Review top contributing features
3. Validate if model reasoning makes sense
4. Use insights in your investigation notes

## 🎨 UI Color Coding

### Risk Indicators
- 🔴 High Risk (Red)
- 🟠 Medium Risk (Orange)
- 🟡 Low Risk (Yellow)
- 🟢 Safe (Green)

### Deployment Status
- 🟢 PRODUCTION (Stable, 100% traffic)
- 🟡 CANARY (Testing, partial traffic)

### Drift Severity
- 🔴 CRITICAL (Immediate action)
- 🟠 HIGH (Schedule review)
- 🟡 MEDIUM (Monitor closely)
- 🔵 LOW (Informational)
- ⚪ INFO (No action needed)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick search |
| `Ctrl/Cmd + R` | Refresh page |
| `Esc` | Close modal |

## 🔧 Quick Troubleshooting

### Can't Login
```bash
# Check FastAPI is running
curl http://localhost:8000/health

# Verify user exists
psql -U fraud_user -d fraud_detection \
  -c "SELECT username, role, is_active FROM users;"
```

### No Data Loading
1. Refresh page (Ctrl/Cmd + R)
2. Clear browser cache
3. Check browser console (F12)
4. Verify internet connection

### SHAP Fails
1. Wait 10-15 seconds (calculation takes time)
2. Try different model (Ensemble/XGBoost/Random Forest)
3. Check transaction has feature data

### Real-time Alerts Not Showing
1. Check WebSocket connection (Browser Console F12)
2. Disable ad blockers
3. Verify backend is running

## 📡 API Endpoints Quick Reference

### Authentication
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user

### Transactions
- `GET /api/transactions/search` - Search transactions
- `GET /api/transactions/:id` - Get details
- `POST /api/transactions/:id/feedback` - Submit feedback

### Fraud
- `GET /api/frauds/recent` - Recent fraud alerts
- `GET /api/frauds/stats` - Fraud statistics
- `GET /api/frauds/timeline` - Timeline chart data

### Drift
- `GET /api/drift/reports` - Drift reports
- `GET /api/drift/latest` - Latest drift analysis

### Models
- `GET /api/models/status` - Production model status

### Explain (Analyst+)
- `POST /api/v1/explain/shap` - Get SHAP explanation

### Admin Only
- `POST /admin/users` - Create user
- `GET /admin/users` - List users
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| [User Guide](./frontend_docs/USER_GUIDE.md) | Complete end-user manual |
| [Architecture](./frontend_docs/ARCHITECTURE.md) | System design |
| [Auth Setup](./frontend_docs/AUTH_SETUP.md) | Authentication config |
| [Deployment](./frontend_docs/DEPLOYMENT.md) | Production deployment |
| [API Reference](./frontend_docs/FASTAPI_ROUTES_REFERENCE.md) | All endpoints |
| [SHAP Guide](./frontend_docs/SHAP_EXPLANATION_INTEGRATION.md) | ML explainability |

## 🆘 Support

### Contact
- **IT Support**: it-support@company.com
- **Fraud Team**: fraud-lead@company.com
- **System Admin**: admin@company.com

### Include in Support Request
- Your username and role
- What you were doing
- Error message (full text)
- Screenshot
- Browser and version
- Time of issue

## 💡 Best Practices

### Daily Routine
- ☑️ Check dashboard in morning
- ☑️ Review high-risk alerts first
- ☑️ Complete pending investigations
- ☑️ Document unusual patterns

### Investigation Quality
- ✅ Always add detailed notes
- ✅ Use SHAP to validate model
- ✅ Set honest confidence levels
- ✅ Prioritize by risk level

### Security
- ✅ Never share credentials
- ✅ Logout when leaving desk
- ✅ Report suspicious activity
- ✅ Use strong passwords

## 🔐 Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### Account Security
- Change password regularly
- Don't share accounts
- Report lost/stolen credentials immediately
- Use unique passwords (don't reuse)

## 📈 KPIs to Monitor

### Fraud Metrics
- **Fraud Rate**: Should be <5%
- **False Positive Rate**: Target <10%
- **Detection Speed**: <1 second per transaction

### Model Performance
- **Accuracy**: Target >95%
- **Precision**: Target >90%
- **Recall**: Target >90%

### Drift Alerts
- **Critical**: 0 per week (ideal)
- **High**: <2 per week
- **Medium**: <5 per week

## 🚦 System Status Indicators

### Health Check Response
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "fraud-detection-web-backend"
}
```

### Model Status
- ✅ **Stable Production**: All systems normal
- ⚠️ **Canary Active**: New models being tested
- ❌ **Error**: Contact admin immediately

## 📞 Emergency Contacts

### Severity Levels

**P1 - Critical** (System Down)
- Call: +1-XXX-XXX-XXXX (24/7 hotline)
- Email: critical@company.com

**P2 - High** (Major Feature Broken)
- Email: support@company.com
- Response: Within 2 hours

**P3 - Medium** (Minor Issue)
- Submit ticket: support.company.com
- Response: Within 24 hours

**P4 - Low** (Question/Enhancement)
- Email: help@company.com
- Response: Within 3 business days

## 📅 Maintenance Windows

- **Weekly**: Sundays 2:00-4:00 AM UTC
- **Monthly**: First Saturday 10:00 PM - 2:00 AM UTC
- **Emergency**: Announced via email

---

**Print this card** and keep it at your desk for quick reference!

**Last Updated:** November 3, 2025  
**Version:** 1.0.0  
**Maintained by:** Fraud Detection Team
