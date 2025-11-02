#!/bin/bash

# Quick Start Script - Fraud Detection Web Application
# Run this script to quickly test if everything works

echo "🚀 Fraud Detection Web - Quick Start Test"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from fraud-detection-web directory"
    exit 1
fi

# Check Node.js
echo "1️⃣ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js $(node -v) found"
echo ""

# Check if dependencies are installed
echo "2️⃣ Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing dependencies (this may take a few minutes)..."
    npm install --silent
    cd frontend && npm install --silent && cd ..
    cd backend && npm install --silent && cd ..
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Check environment files
echo "3️⃣ Checking environment files..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found. Creating from example..."
    cp frontend/.env.example frontend/.env
    echo "✅ frontend/.env created"
fi
echo ""

# Test database connection
echo "4️⃣ Testing database connection..."
cd backend
node -e "
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

pool.query('SELECT 1')
  .then(() => {
    console.log('✅ Database connection successful');
    pool.end();
  })
  .catch(err => {
    console.log('⚠️  Database connection failed:', err.message);
    console.log('   Please check your backend/.env configuration');
    pool.end();
  });
" 2>&1
cd ..
echo ""

echo "=========================================="
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start the application:"
echo "   npm run dev"
echo ""
echo "2. Open in browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "3. Test real-time updates:"
echo "   cd ../fraud-detection-ml/data"
echo "   python -m src.pipelines.realtime_pipeline --mode batch --count 100"
echo ""
echo "📚 Documentation:"
echo "   README.md           - Complete guide"
echo "   DEPLOYMENT.md       - Deployment instructions"
echo "   QUICK_REFERENCE.md  - Quick commands"
echo "   PROJECT_SUMMARY.md  - Project overview"
echo ""
echo "Happy fraud detecting! 🔍"
