const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * GET /api/metrics/dashboard
 * Get comprehensive dashboard metrics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Determine time condition
    let timeCondition = "DATE(t.time) = CURRENT_DATE";
    if (period === '7d') {
      timeCondition = "t.time >= NOW() - INTERVAL '7 days'";
    } else if (period === '30d') {
      timeCondition = "t.time >= NOW() - INTERVAL '30 days'";
    }
    
    // Get transaction and fraud metrics
    const metricsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN p.is_fraud_predicted THEN 1 ELSE 0 END) as fraud_count,
        AVG(p.fraud_score) as avg_fraud_score,
        MAX(p.fraud_score) as max_fraud_score,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        COUNT(DISTINCT t.merchant_id) as unique_merchants,
        SUM(t.amount) as total_amount,
        SUM(CASE WHEN p.is_fraud_predicted THEN t.amount ELSE 0 END) as fraud_amount,
        AVG(t.amount) as avg_transaction_amount
      FROM transactions t
      LEFT JOIN predictions p ON t.transaction_id = p.transaction_id
      WHERE ${timeCondition}
    `;
    
    const metricsResult = await pool.query(metricsQuery);
    const metrics = metricsResult.rows[0];
    
    // Get model performance stats
    const modelQuery = `
      SELECT 
        model_version,
        COUNT(*) as prediction_count,
        AVG(fraud_score) as avg_confidence
      FROM predictions
      WHERE prediction_time >= NOW() - INTERVAL '24 hours'
      GROUP BY model_version
      ORDER BY prediction_count DESC
      LIMIT 1
    `;
    
    const modelResult = await pool.query(modelQuery);
    const modelStats = modelResult.rows[0] || {};
    
    // Calculate fraud rate
    const fraudRate = metrics.total_transactions > 0 
      ? (metrics.fraud_count / metrics.total_transactions * 100).toFixed(2)
      : 0;
    
    res.json({
      period,
      timestamp: new Date().toISOString(),
      transactions: {
        total: parseInt(metrics.total_transactions),
        unique_customers: parseInt(metrics.unique_customers),
        unique_merchants: parseInt(metrics.unique_merchants),
        total_amount: parseFloat(metrics.total_amount || 0).toFixed(2),
        avg_amount: parseFloat(metrics.avg_transaction_amount || 0).toFixed(2)
      },
      fraud: {
        count: parseInt(metrics.fraud_count),
        rate: parseFloat(fraudRate),
        amount: parseFloat(metrics.fraud_amount || 0).toFixed(2),
        avg_score: parseFloat(metrics.avg_fraud_score || 0).toFixed(4),
        max_score: parseFloat(metrics.max_fraud_score || 0).toFixed(4),
        amount_percentage: metrics.total_amount > 0
          ? ((metrics.fraud_amount / metrics.total_amount) * 100).toFixed(2)
          : 0
      },
      model: {
        version: modelStats.model_version || 'unknown',
        predictions_24h: parseInt(modelStats.prediction_count || 0),
        avg_confidence: parseFloat(modelStats.avg_confidence || 0).toFixed(4)
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics', message: error.message });
  }
});

/**
 * GET /api/metrics/hourly
 * Get hourly metrics for charts
 */
router.get('/hourly', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    
    const query = `
      SELECT 
        DATE_TRUNC('hour', t.time) as hour,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN p.is_fraud_predicted THEN 1 ELSE 0 END) as fraud_count,
        AVG(p.fraud_score) as avg_fraud_score,
        SUM(t.amount) as total_amount
      FROM transactions t
      LEFT JOIN predictions p ON t.transaction_id = p.transaction_id
      WHERE t.time >= NOW() - INTERVAL '${hours} hours'
      GROUP BY hour
      ORDER BY hour ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      period: `${hours}h`,
      data: result.rows.map(row => ({
        hour: row.hour,
        transaction_count: parseInt(row.transaction_count),
        fraud_count: parseInt(row.fraud_count || 0),
        fraud_rate: row.transaction_count > 0
          ? ((row.fraud_count / row.transaction_count) * 100).toFixed(2)
          : 0,
        avg_fraud_score: parseFloat(row.avg_fraud_score || 0).toFixed(4),
        total_amount: parseFloat(row.total_amount || 0).toFixed(2)
      }))
    });

  } catch (error) {
    console.error('Error fetching hourly metrics:', error);
    res.status(500).json({ error: 'Failed to fetch hourly metrics', message: error.message });
  }
});

/**
 * GET /api/metrics/top-features
 * Get top features contributing to fraud detection
 */
router.get('/top-features', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // This aggregates feature importance from recent predictions
    const query = `
      SELECT 
        jsonb_object_keys(feature_importance) as feature,
        AVG((feature_importance->>jsonb_object_keys(feature_importance))::float) as avg_importance
      FROM predictions
      WHERE feature_importance IS NOT NULL
        AND is_fraud_predicted = true
        AND prediction_time >= NOW() - INTERVAL '7 days'
      GROUP BY feature
      ORDER BY avg_importance DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    res.json({
      top_features: result.rows.map(row => ({
        feature: row.feature,
        avg_importance: parseFloat(row.avg_importance).toFixed(4)
      }))
    });

  } catch (error) {
    console.error('Error fetching top features:', error);
    res.status(500).json({ error: 'Failed to fetch top features', message: error.message });
  }
});

module.exports = router;
