#!/bin/bash

# Fraud Detection Web Application Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Fraud Detection Web Application Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) installed${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) installed${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

# Root dependencies
echo "Installing root dependencies..."
npm install
echo ""

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo ""

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..
echo ""

echo -e "${GREEN}✅ All dependencies installed${NC}"
echo ""

# Setup environment files
echo "⚙️  Setting up environment files..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Created backend/.env from .env.example${NC}"
    echo -e "${YELLOW}   Please edit backend/.env with your database credentials${NC}"
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✅ Created frontend/.env from .env.example${NC}"
else
    echo -e "${GREEN}✅ frontend/.env already exists${NC}"
fi

echo ""

# Database check
echo "🗄️  Checking database connection..."
read -p "Enter PostgreSQL host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter PostgreSQL port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Enter database name (default: fraud_detection): " DB_NAME
DB_NAME=${DB_NAME:-fraud_detection}

read -p "Enter database user (default: fraud_user): " DB_USER
DB_USER=${DB_USER:-fraud_user}

read -sp "Enter database password: " DB_PASSWORD
echo ""

# Update backend/.env with database credentials
cat > backend/.env << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# FastAPI Configuration
FASTAPI_URL=http://localhost:8000

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
EOF

echo -e "${GREEN}✅ Database configuration saved to backend/.env${NC}"
echo ""

# Test database connection
echo "Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: '$DB_HOST',
  port: $DB_PORT,
  database: '$DB_NAME',
  user: '$DB_USER',
  password: '$DB_PASSWORD'
});

pool.query('SELECT 1')
  .then(() => {
    console.log('✅ Database connection successful');
    pool.end();
  })
  .catch(err => {
    console.log('❌ Database connection failed:', err.message);
    pool.end();
    process.exit(1);
  });
" 2>&1

echo ""

# Final instructions
echo "========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Make sure your FastAPI backend is running:"
echo "   cd ../fraud-detection-ml/api"
echo "   python -m uvicorn src.main:app --reload"
echo ""
echo "2. Start the web application:"
echo "   ${YELLOW}npm run dev${NC}     # Start both frontend and backend"
echo ""
echo "   Or start them separately:"
echo "   ${YELLOW}cd backend && npm run dev${NC}  # Backend on http://localhost:3001"
echo "   ${YELLOW}cd frontend && npm start${NC}  # Frontend on http://localhost:3000"
echo ""
echo "3. Test real-time updates by running the pipeline:"
echo "   cd ../fraud-detection-ml/data"
echo "   python -m src.pipelines.realtime_pipeline --mode batch --count 1000"
echo ""
echo "📚 Documentation: See README.md for more details"
echo ""
echo "Happy fraud detecting! 🔍"
