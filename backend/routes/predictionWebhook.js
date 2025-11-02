const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * POST /api/predictions
 * Webhook endpoint to receive predictions from realtime_pipeline
 * Broadcasts fraud alerts to connected clients via WebSocket
 */
router.post('/', async (req, res) => {
  try {
    const { predictions } = req.body;
    
    if (!predictions || !Array.isArray(predictions)) {
      return res.status(400).json({ 
        error: 'Invalid payload', 
        message: 'Expected { predictions: [...] }' 
      });
    }

    console.log(`📥 Received ${predictions.length} predictions from pipeline`);

    // Filter fraud alerts (predictions with high fraud probability)
    const fraudAlerts = predictions.filter(p => 
      p.predicted_fraud === 1 || p.predicted_fraud === true || p.fraud_probability > 0.5
    );

    if (fraudAlerts.length > 0) {
      console.log(`🚨 ${fraudAlerts.length} fraud alerts detected`);
      
      // Broadcast to all connected WebSocket clients
      const io = req.app.get('io');
      io.to('fraud-alerts').emit('new-fraud-alert', {
        count: fraudAlerts.length,
        alerts: fraudAlerts,
        timestamp: new Date().toISOString()
      });

      // Also broadcast to general listeners
      io.emit('new-predictions', {
        total: predictions.length,
        fraud_count: fraudAlerts.length,
        fraud_rate: (fraudAlerts.length / predictions.length * 100).toFixed(2),
        timestamp: new Date().toISOString()
      });
    }

    res.json({ 
      status: 'success', 
      received: predictions.length,
      fraud_alerts: fraudAlerts.length,
      message: 'Predictions processed and broadcasted'
    });

  } catch (error) {
    console.error('Error processing predictions:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

module.exports = router;
