# Quick Reference - Fraud Detection Web App

## 🚀 Quick Commands

### Setup
```bash
./setup.sh                    # Interactive setup
npm run install:all           # Install all dependencies
```

### Development
```bash
npm run dev                   # Start both frontend & backend
npm run frontend              # Start frontend only (port 3000)
npm run backend               # Start backend only (port 3001)
cd backend && npm run dev     # Backend with auto-reload
cd frontend && npm start      # Frontend with auto-reload
```

### Build
```bash
cd frontend && npm run build  # Build production frontend
```

### Testing
```bash
# Test backend health
curl http://localhost:3001/health

# Test database connection
node -e "require('./backend/config/database').pool.query('SELECT 1')"
```

## 📡 API Quick Reference

### Base URLs
- **Local Backend:** http://localhost:3001
- **Local Frontend:** http://localhost:3000
- **Production:** Update in deployment

### Key Endpoints

#### Fraud
```bash
GET  /api/frauds/recent?limit=20
GET  /api/frauds/stats?period=24h
GET  /api/frauds/timeline?hours=24
```

#### Transactions
```bash
GET  /api/transactions/search?customer_id=123
GET  /api/transactions/:id
POST /api/transactions/:id/feedback
POST /api/transactions/predict
```

#### Drift
```bash
GET  /api/drift/reports?limit=10
GET  /api/drift/latest
GET  /api/drift/stats
```

#### Metrics
```bash
GET  /api/metrics/dashboard?period=24h
GET  /api/metrics/hourly?hours=24
```

#### Webhook
```bash
POST /api/predictions
# Receives predictions from realtime_pipeline
```

## 🔌 WebSocket Events

### Subscribe
```javascript
socket.emit('subscribe:fraud-alerts')
```

### Listen
```javascript
socket.on('new-fraud-alert', (data) => {
  // data: { count, alerts, timestamp }
})

socket.on('new-predictions', (data) => {
  // data: { total, fraud_count, fraud_rate, timestamp }
})
```

## 🎨 Component Structure

### Pages
- `Dashboard` - Real-time overview
- `Transactions` - Search & review
- `DriftMonitoring` - Drift reports
- `Investigation` - Analyst feedback

### Key Components
- `MetricsCards` - Statistics display
- `FraudAlertStream` - Live fraud alerts
- `TransactionTable` - Searchable list
- `TransactionModal` - Detail view
- `FeedbackForm` - Analyst input

## ⚙️ Environment Variables

### Backend (.env)
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fraud_detection
DB_USER=fraud_user
DB_PASSWORD=secret
FASTAPI_URL=http://localhost:8000
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=http://localhost:3001
```

## 🐛 Common Issues

### Database Connection Error
```bash
# Fix: Check PostgreSQL is running
psql -U fraud_user -d fraud_detection -h localhost

# Fix: Verify credentials in backend/.env
```

### Port Already in Use
```bash
# Fix: Kill process on port
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### CORS Error
```bash
# Fix: Verify CORS_ORIGIN in backend/.env matches frontend URL
```

### WebSocket Not Connecting
```bash
# Fix: Ensure backend is running
# Fix: Check browser console for errors
# Fix: Verify REACT_APP_WS_URL is correct
```

## 📊 Database Tables Used

### Primary Tables
- `transactions` - All transactions
- `predictions` - ML predictions
- `drift_reports` - Drift detection results
- `feedback_labels` - Analyst feedback
- `users` - System users

### Queries Example
```sql
-- Recent frauds
SELECT t.*, p.fraud_score 
FROM transactions t
JOIN predictions p ON t.transaction_id = p.transaction_id
WHERE p.is_fraud_predicted = true
ORDER BY p.prediction_time DESC
LIMIT 20;

-- Dashboard metrics
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN p.is_fraud_predicted THEN 1 ELSE 0 END) as fraud_count
FROM transactions t
LEFT JOIN predictions p ON t.transaction_id = p.transaction_id
WHERE DATE(t.time) = CURRENT_DATE;
```

## 🚢 Deployment URLs

### Vercel (Frontend)
```bash
vercel                        # Deploy
vercel --prod                 # Deploy to production
vercel env add               # Add environment variable
```

### Render (Backend)
- Dashboard: https://dashboard.render.com
- Auto-deploys on git push
- Manual deploy: Click "Manual Deploy" button

## 📈 Performance Tips

### Frontend
- Enable auto-refresh for live updates
- Limit result count for large queries
- Use pagination for transaction lists

### Backend
- Database connection pooling (already configured)
- Index on frequently queried fields (already done)
- Cache frequent queries (TODO)

## 🔐 Security Notes

### Production Checklist
- [ ] Use strong database passwords
- [ ] Enable SSL for PostgreSQL
- [ ] Add API rate limiting
- [ ] Implement authentication
- [ ] Monitor access logs
- [ ] Keep dependencies updated

## 📞 Integration with ML Pipeline

### Send Predictions to Web App
```python
# In realtime_pipeline.py
WEBAPP_URL = "http://localhost:3001"  # Local
# WEBAPP_URL = "https://your-backend.onrender.com"  # Production

# Sends POST to /api/predictions
# Dashboard receives real-time alerts via WebSocket
```

### Test Integration
```bash
cd fraud-detection-ml/data
python -m src.pipelines.realtime_pipeline --mode batch --count 100
# Watch dashboard for live alerts!
```

## 📚 Additional Commands

### Check Versions
```bash
node -v                       # Node version
npm -v                        # npm version
psql --version                # PostgreSQL version
```

### Clean Install
```bash
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install:all
```

### Logs
```bash
# Backend logs (in terminal)
cd backend && npm run dev

# Frontend logs (browser console)
# Open DevTools → Console

# Render logs (production)
# Dashboard → Service → Logs tab
```

## 🎯 Testing Scenarios

### 1. Dashboard Metrics
- Open http://localhost:3000/dashboard
- Verify 4 metric cards display
- Check charts render

### 2. Transaction Search
- Go to Transactions page
- Search by transaction ID
- Click "View" to see details

### 3. Real-time Alerts
- Run realtime_pipeline
- Watch dashboard for alert banner
- Verify WebSocket connection in console

### 4. Analyst Feedback
- Go to Investigation page
- Select a high-risk transaction
- Submit feedback (fraud/legitimate)
- Verify saved in database

## 💡 Tips & Tricks

### Development
- Use `console.log()` liberally in React components
- Check Network tab for API call failures
- Use React DevTools extension
- Enable verbose logging in backend

### Debugging
```javascript
// Frontend - Add to component
useEffect(() => {
  console.log('Component data:', { metrics, loading, error });
}, [metrics, loading, error]);

// Backend - Add to routes
console.log('Request:', req.method, req.path, req.body);
```

### Hot Tips
- Backend auto-restarts with nodemon ✅
- Frontend hot-reloads on save ✅
- PostgreSQL queries are logged in terminal
- WebSocket events logged in browser console

---

**Pro Tip:** Keep this file open in a second monitor while developing! 🚀
