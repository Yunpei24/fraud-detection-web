# Deployment Guide - Fraud Detection Web Application

This guide walks you through deploying the fraud detection web application to Vercel (frontend) and Render (backend).

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ Vercel account (free tier available)
- ✅ Render account (free tier available)
- ✅ PostgreSQL database accessible from the internet
- ✅ FastAPI backend deployed and accessible

## 🎯 Deployment Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Vercel     │────────▶│   Render     │────────▶│  PostgreSQL  │
│  (Frontend)  │         │  (Backend)   │         │  (Database)  │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   FastAPI    │
                         │   (ML API)   │
                         └──────────────┘
```

## 🚀 Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
cd fraud-detection-project
git add fraud-detection-web/
git commit -m "Add fraud detection web application"
git push origin main
```

### 1.2 Verify File Structure

Ensure your structure looks like this:
```
fraud-detection-web/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vercel.json
│   └── ...
├── backend/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── render.yaml
├── package.json
└── README.md
```

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** `fraud-detection-backend`
   - **Root Directory:** `/` (empty)
   - **Environment:** `Node`
   - **Region:** Choose closest to your database
   - **Branch:** `main` (or your branch)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

### 2.2 Add Environment Variables

Add these environment variables in Render dashboard:

```bash
NODE_ENV=production
PORT=3001

# Database Configuration
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_NAME=fraud_detection
DB_USER=fraud_user
DB_PASSWORD=your_secure_password

# FastAPI Configuration
FASTAPI_URL=https://your-fastapi-deployment.com

# CORS (will update after frontend deployment)
CORS_ORIGIN=http://localhost:3000  # Temporary, update later
```

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (usually 2-5 minutes)
3. Note your backend URL: `https://fraud-detection-backend.onrender.com`

### 2.4 Test Backend

```bash
# Test health endpoint
curl https://fraud-detection-backend.onrender.com/health

# Expected response:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `fraud-detection-web/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

### 3.3 Add Environment Variables

In Vercel project settings, add:

```bash
REACT_APP_API_URL=https://fraud-detection-backend.onrender.com
REACT_APP_WS_URL=https://fraud-detection-backend.onrender.com
```

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build (usually 1-3 minutes)
3. Note your frontend URL: `https://fraud-detection-web.vercel.app`

## 🔄 Step 4: Update CORS Settings

### 4.1 Update Backend CORS

Go back to Render dashboard:
1. Find your backend service
2. Update `CORS_ORIGIN` environment variable:
   ```bash
   CORS_ORIGIN=https://fraud-detection-web.vercel.app
   ```
3. Save and redeploy

### 4.2 Test CORS

Open your Vercel URL and check browser console for any CORS errors.

## 🔌 Step 5: Configure realtime_pipeline

Update your data pipeline to send predictions to the deployed backend:

### 5.1 Update constants.py

```python
# In fraud-detection-ml/data/src/config/constants.py

# Production deployment
WEBAPP_URL = os.getenv(
    "WEBAPP_URL",
    "https://fraud-detection-backend.onrender.com"
)
```

### 5.2 Set Environment Variable

```bash
export WEBAPP_URL=https://fraud-detection-backend.onrender.com
```

### 5.3 Test Pipeline

```bash
cd fraud-detection-ml/data
python -m src.pipelines.realtime_pipeline --mode batch --count 100
```

Watch your deployed dashboard for real-time alerts! 🚨

## ✅ Step 6: Verify Deployment

### 6.1 Frontend Checklist

- [ ] Dashboard loads without errors
- [ ] Metrics cards display data
- [ ] Can search transactions
- [ ] Transaction modal opens
- [ ] Drift reports display

### 6.2 Backend Checklist

- [ ] `/health` endpoint returns healthy status
- [ ] `/api/frauds/recent` returns data
- [ ] `/api/metrics/dashboard` returns metrics
- [ ] WebSocket connection established

### 6.3 End-to-End Test

1. Run realtime_pipeline with small batch
2. Check backend logs for received predictions
3. Open deployed frontend
4. Verify fraud alerts appear in dashboard
5. Search for a transaction
6. Open transaction details

## 🐛 Troubleshooting

### Backend Won't Start

**Check logs in Render:**
```bash
# Common issues:
# - Database connection failed: Check DB credentials
# - Module not found: Ensure package.json is correct
# - Port already in use: Render manages ports automatically
```

### Frontend Build Fails

**Check Vercel logs:**
```bash
# Common issues:
# - Missing dependencies: Check package.json
# - Syntax errors: Fix any ES6+ issues
# - Environment variables: Ensure REACT_APP_* are set
```

### CORS Errors

```bash
# Solution 1: Verify CORS_ORIGIN in backend
# Solution 2: Check browser console for exact error
# Solution 3: Ensure URLs don't have trailing slashes
```

### Database Connection Timeout

```bash
# Render may need IP whitelisting
# Check your PostgreSQL host firewall settings
# Ensure PostgreSQL accepts external connections
```

### Real-time Updates Not Working

```bash
# 1. Check WebSocket connection in browser console
# 2. Verify REACT_APP_WS_URL is correct
# 3. Ensure backend WebSocket is enabled
# 4. Check if Render supports WebSockets (it does!)
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable PostgreSQL SSL connections
- [ ] Add rate limiting to backend
- [ ] Enable Vercel password protection (optional)
- [ ] Set up proper authentication (future enhancement)
- [ ] Monitor backend logs for suspicious activity

### Recommended: Add API Authentication

```javascript
// backend/middleware/auth.js
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Apply to routes
app.use('/api', authMiddleware);
```

## 📊 Monitoring

### Render Metrics

Monitor in Render dashboard:
- CPU usage
- Memory usage
- Response times
- Error rates

### Vercel Analytics

Enable Vercel Analytics for:
- Page views
- Load times
- Web Vitals

### Database Monitoring

Monitor PostgreSQL:
- Active connections
- Query performance
- Storage usage

## 🔄 Updates and Maintenance

### Deploy Updates

**Frontend:**
```bash
git push origin main
# Vercel auto-deploys on push
```

**Backend:**
```bash
git push origin main
# Render auto-deploys on push
```

### Rollback

Both platforms support rollback to previous deployments via their dashboards.

## 💰 Cost Estimation

### Free Tier Limits

**Vercel:**
- 100 GB bandwidth/month
- 6,000 build minutes/month
- Perfect for this use case ✅

**Render:**
- 750 hours/month (enough for 1 service 24/7)
- Service spins down after 15 min inactivity
- Cold start ~30 seconds
- Good for development ✅

**Upgrade if needed:**
- Vercel Pro: $20/month
- Render Starter: $7/month

## 🎓 Academic Deployment Tips

### For Demonstrations

1. **Pre-load data** before demo
2. **Keep backend warm** by pinging `/health` every 10 minutes
3. **Test pipeline** beforehand
4. **Prepare screenshots** in case of connectivity issues

### For Reports

1. Include deployment architecture diagram
2. Document environment variables used
3. Show deployment logs
4. Capture screenshots of live system
5. Record video of real-time updates

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [WebSocket Deployment Guide](https://render.com/docs/web-services#websocket-support)

## 🎉 Success!

Your fraud detection web application is now live and ready to detect fraud in real-time!

### What's Next?

- ✅ Monitor system performance
- ✅ Collect analyst feedback
- ✅ Improve UI/UX based on usage
- ✅ Add more features (authentication, email alerts, etc.)

---

**Need Help?** Check Render and Vercel logs first, then refer to the troubleshooting section above.
