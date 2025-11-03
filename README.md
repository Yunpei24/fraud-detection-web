# Fraud Detection Web Application

A modern, responsive web application for real-time fraud detection monitoring and analytics. Built with React, Node.js/Express, and PostgreSQL.

## 🎯 Features

### � **JWT Authentication**
- Secure login with username/password
- Role-based access control (admin, analyst, viewer)
- Automatic token refresh
- User profile management
- Protected routes

### �📊 **Real-time Dashboard**
- Live fraud alerts via WebSocket
- Key metrics cards (transactions, fraud rate, amounts)
- Fraud detection timeline charts
- Auto-refresh capabilities

### 💳 **Transaction Management**
- Advanced search and filtering
- Transaction details with feature importance
- SHAP value visualization
- CSV export functionality

### 📈 **Drift Monitoring**
- Data drift reports
- Model performance tracking
- Severity-based alerts
- Historical drift analysis

### 🔍 **Investigation Workspace**
- Pending transaction reviews
- Analyst feedback submission
- Confidence rating system
- Investigation notes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Fraud Detection System                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐     ┌────────────┐  │
│  │   Frontend   │◄────►│   Backend    │◄───►│ PostgreSQL │  │
│  │  (React +    │      │  (Node.js +  │     │            │  │
│  │  Tailwind)   │      │   Express)   │     │            │  │
│  └──────────────┘      └──────────────┘     └────────────┘  │
│         │                      │               |    ▲       │
│         │                      │               |    │       |
│         ▼                      ▼               |    │       │
│  ┌──────────────┐      ┌──────────────┐        |    │       │
│  │  WebSocket   │      │   FastAPI    │ _______│    |       │
│  │ (Real-time)  │      │ (Prediction) │             │       │
│  └──────────────┘      └──────────────┘             │       │
│                                                     │       │
│                         ┌──────────────┐            │       │
│                         │   Airflow    │───────────-┘       │
│                         │    DAGs      │                    │
│                         └──────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (configured in fraud-detection-ml)
- FastAPI backend running (fraud-detection-ml/api)

### Installation

```bash
# Clone the repository
cd fraud-detection-web

# Install dependencies for all packages
npm run install:all

# Or install individually
cd frontend && npm install
cd ../backend && npm install
```

### Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env

# Edit .env with your configuration:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fraud_detection
DB_USER=fraud_user
DB_PASSWORD=your_password
FASTAPI_URL=http://localhost:8000
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env

# Edit .env:
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=http://localhost:3001
```

### Running Locally

#### 1. Start FastAPI Backend (Required for Authentication)
```bash
cd ../fraud-detection-ml/api
python -m src.main
# FastAPI runs on http://localhost:8000
```

#### 2. Development Mode (Both Web Services)
```bash
cd fraud-detection-web
npm run dev
```

#### Or Run Separately

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

#### 3. Login to the Application

Navigate to http://localhost:3000 and login with demo credentials:

| Username | Password   | Role    | Description       |
|----------|------------|---------|-------------------|
| admin    | admin123   | admin   | Full access       |
| analyst  | analyst123 | analyst | Most features     |
| viewer   | viewer123  | viewer  | Read-only access  |

> 📖 **For detailed authentication setup**, see [AUTH_SETUP.md](./AUTH_SETUP.md)

### Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📡 API Endpoints

### Backend API Reference

#### Fraud Endpoints
- `GET /api/frauds/recent` - Get recent fraud alerts
- `GET /api/frauds/stats?period=24h` - Get fraud statistics
- `GET /api/frauds/timeline?hours=24` - Get fraud timeline

#### Transaction Endpoints
- `GET /api/transactions/search` - Search transactions with filters
- `GET /api/transactions/:id` - Get transaction details
- `GET /api/transactions/:id/history` - Get feedback history
- `POST /api/transactions/:id/feedback` - Submit analyst feedback
- `POST /api/transactions/predict` - Proxy to FastAPI prediction

#### Drift Endpoints
- `GET /api/drift/reports` - Get drift reports
- `GET /api/drift/latest` - Get latest drift analysis
- `GET /api/drift/history?days=7` - Get drift history
- `GET /api/drift/stats` - Get drift statistics

#### Metrics Endpoints
- `GET /api/metrics/dashboard?period=24h` - Dashboard metrics
- `GET /api/metrics/hourly?hours=24` - Hourly metrics
- `GET /api/metrics/top-features` - Top contributing features

#### Webhook Endpoint
- `POST /api/predictions` - Receive predictions from realtime_pipeline

## 🔌 Real-time Updates

The application uses WebSocket (Socket.IO) for real-time fraud alerts:

```javascript
// Frontend automatically connects and subscribes
// When realtime_pipeline sends predictions to /api/predictions
// Backend broadcasts to WebSocket clients
// Dashboard shows live alert banner
```

### Testing WebSocket

Send predictions from your pipeline:
```bash
cd fraud-detection-ml/data
python -m src.pipelines.realtime_pipeline --mode batch --count 1000
```

Watch the dashboard for live alerts! 🚨

## 🚢 Deployment

### Frontend Deployment (Vercel)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# REACT_APP_API_URL=https://your-backend.onrender.com
# REACT_APP_WS_URL=https://your-backend.onrender.com
```

**Or via Vercel Dashboard:**
1. Connect GitHub repo
2. Select `fraud-detection-web/frontend` as root directory
3. Set build command: `npm run build`
4. Set output directory: `build`
5. Add environment variables

### Backend Deployment (Render)

1. Go to [render.com](https://render.com)
2. New Web Service
3. Connect your GitHub repo
4. Root directory: `fraud-detection-web/backend`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Add environment variables (from .env.example)

**Important Environment Variables:**
- `DB_HOST` - Your PostgreSQL host
- `DB_PASSWORD` - Database password
- `FASTAPI_URL` - Your FastAPI deployment URL
- `CORS_ORIGIN` - Your Vercel frontend URL

### Update realtime_pipeline.py

Update the WEBAPP_URL in your data pipeline:
```python
# In fraud-detection-ml/data/src/config/constants.py
WEBAPP_URL = "https://your-backend.onrender.com"
```

## 📦 Project Structure

```
fraud-detection-web/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Dashboard/
│   │   │   ├── Transactions/
│   │   │   ├── Drift/
│   │   │   ├── Investigation/
│   │   │   ├── Layout.js
│   │   │   └── ProtectedRoute.js  # Auth guard
│   │   ├── contexts/
│   │   │   └── AuthContext.js     # JWT state management
│   │   ├── pages/           # Page components
│   │   │   ├── Login.js           # Login page
│   │   │   ├── Dashboard.js
│   │   │   ├── Transactions.js
│   │   │   ├── DriftMonitoring.js
│   │   │   └── Investigation.js
│   │   ├── services/        # API & WebSocket clients
│   │   ├── utils/           # Helper functions
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── vercel.json
│
├── backend/                 # Node.js/Express server
│   ├── config/
│   │   └── database.js      # PostgreSQL connection
│   ├── routes/
│   │   ├── auth.js          # Authentication (proxy to FastAPI)
│   │   ├── fraud.js
│   │   ├── transactions.js
│   │   ├── drift.js
│   │   ├── metrics.js
│   │   └── predictionWebhook.js
│   ├── server.js
│   ├── package.json
│   └── render.yaml
│
├── AUTH_SETUP.md            # JWT authentication guide
├── DEPLOYMENT.md            # Deployment instructions
├── ARCHITECTURE.md          # System architecture
├── package.json             # Root package.json
└── README.md                # This file
```

## 🎨 UI Components

### Color Scheme
- **High Risk:** Red (`#dc2626`)
- **Medium Risk:** Orange (`#f59e0b`)
- **Low Risk:** Yellow (`#fbbf24`)
- **Safe:** Green (`#10b981`)

## 🐛 Troubleshooting

### Authentication Issues

**Problem:** Can't login / "Authentication service unavailable"

**Solution:**
```bash
# 1. Ensure FastAPI is running
curl http://localhost:8000/health

# 2. Check demo users exist
docker exec -it fraud-postgres psql -U fraud_user -d fraud_detection -c "SELECT username, role FROM users;"

# 3. Verify FASTAPI_URL in backend/.env
cat backend/.env | grep FASTAPI_URL
```

See [AUTH_SETUP.md](./AUTH_SETUP.md) for complete troubleshooting guide.

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U fraud_user -d fraud_detection -h localhost

# Verify credentials in backend/.env
```

### WebSocket Not Connecting
```bash
# Check CORS settings in backend/server.js
# Ensure REACT_APP_WS_URL matches backend URL
```

### Real-time Alerts Not Showing
```bash
# Verify realtime_pipeline is configured with correct WEBAPP_URL
# Check backend logs for incoming predictions
# Open browser console to see WebSocket connection status
```

## 📄 License

MIT License

## 👨‍💻 Author

Built for academic fraud detection ML project
