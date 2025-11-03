const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { pool } = require('./config/database');
const authRoutes = require('./routes/auth');
const adminUsersRoutes = require('./routes/adminUsers');
const fraudRoutes = require('./routes/fraud');
const transactionRoutes = require('./routes/transactions');
const driftRoutes = require('./routes/drift');
const metricsRoutes = require('./routes/metrics');
const modelsRoutes = require('./routes/models');
const explainRoutes = require('./routes/explain');
const predictionWebhookRoutes = require('./routes/predictionWebhook');

const app = express();
const server = http.createServer(app);

// Socket.IO for real-time updates
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'fraud-detection-web-backend'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      database: 'disconnected'
    });
  }
});

// API Routes
app.use('/auth', authRoutes); // Authentication routes (proxy to FastAPI)
app.use('/admin/users', adminUsersRoutes); // Admin user management (proxy to FastAPI)
app.use('/api/frauds', fraudRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/drift', driftRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/models', modelsRoutes); // Models deployment status
app.use('/api/explain', explainRoutes); // SHAP explanations and feature importance
app.use('/api/predictions', predictionWebhookRoutes); // Webhook from realtime_pipeline

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Fraud Detection Web API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      frauds: '/api/frauds',
      transactions: '/api/transactions',
      drift: '/api/drift',
      metrics: '/api/metrics',
      predictions: '/api/predictions (webhook)'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      timestamp: new Date().toISOString()
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('subscribe:fraud-alerts', () => {
    socket.join('fraud-alerts');
    console.log('Client subscribed to fraud alerts:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket enabled for real-time updates`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  server.close(() => {
    pool.end();
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, io };
