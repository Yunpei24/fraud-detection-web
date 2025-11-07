const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * GET /api/frauds/recent
 * Get recent fraud alerts from database
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        t.transaction_id,
        t.amount,
        t.time,
        t.class,
        t.source,
        t.timestamp,
        t.ingestion_timestamp,
        -- PCA Features (V1-V28) needed for SHAP explanations
        t.v1, t.v2, t.v3, t.v4, t.v5, t.v6, t.v7, t.v8, t.v9, t.v10,
        t.v11, t.v12, t.v13, t.v14, t.v15, t.v16, t.v17, t.v18, t.v19, t.v20,
        t.v21, t.v22, t.v23, t.v24, t.v25, t.v26, t.v27, t.v28,
        p.fraud_score,
        p.is_fraud_predicted,
        p.prediction_time,
        p.model_version,
        p.feature_importance
      FROM transactions t
      INNER JOIN predictions p ON t.transaction_id = p.transaction_id
      WHERE p.is_fraud_predicted = true
      ORDER BY p.prediction_time DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    
    res.json({
      total: result.rowCount,
      frauds: result.rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching recent frauds:', error);
    res.status(500).json({ error: 'Failed to fetch fraud alerts', message: error.message });
  }
});

/**
 * GET /api/frauds/stats
 * Get fraud statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Calculate time range
    let timeCondition = "DATE(p.prediction_time) = CURRENT_DATE";
    if (period === '7d') {
      timeCondition = "p.prediction_time >= NOW() - INTERVAL '7 days'";
    } else if (period === '30d') {
      timeCondition = "p.prediction_time >= NOW() - INTERVAL '30 days'";
    }
    
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN p.is_fraud_predicted THEN 1 ELSE 0 END) as fraud_count,
        AVG(p.fraud_score) as avg_fraud_score,
        MAX(p.fraud_score) as max_fraud_score,
        MIN(p.fraud_score) as min_fraud_score,
        SUM(t.amount) as total_amount,
        SUM(CASE WHEN p.is_fraud_predicted THEN t.amount ELSE 0 END) as fraud_amount
      FROM transactions t
      LEFT JOIN predictions p ON t.transaction_id = p.transaction_id
      WHERE ${timeCondition}
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0];
    
    // Calculate fraud rate
    const fraudRate = stats.total_transactions > 0 
      ? (stats.fraud_count / stats.total_transactions * 100).toFixed(2)
      : 0;
    
    res.json({
      period,
      total_transactions: parseInt(stats.total_transactions),
      fraud_count: parseInt(stats.fraud_count),
      fraud_rate: parseFloat(fraudRate),
      avg_fraud_score: parseFloat(stats.avg_fraud_score || 0).toFixed(4),
      max_fraud_score: parseFloat(stats.max_fraud_score || 0).toFixed(4),
      min_fraud_score: parseFloat(stats.min_fraud_score || 0).toFixed(4),
      total_amount: parseFloat(stats.total_amount || 0).toFixed(2),
      fraud_amount: parseFloat(stats.fraud_amount || 0).toFixed(2),
      fraud_amount_percentage: stats.total_amount > 0
        ? ((stats.fraud_amount / stats.total_amount) * 100).toFixed(2)
        : 0
    });

  } catch (error) {
    console.error('Error fetching fraud stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

/**
 * GET /api/frauds/timeline
 * Get fraud detection timeline (hourly aggregation)
 */
router.get('/timeline', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    
    const query = `
      SELECT 
        DATE_TRUNC('hour', p.prediction_time) as hour,
        COUNT(*) as total,
        SUM(CASE WHEN p.is_fraud_predicted THEN 1 ELSE 0 END) as fraud_count,
        AVG(p.fraud_score) as avg_fraud_score
      FROM predictions p
      WHERE p.prediction_time >= NOW() - INTERVAL '${hours} hours'
      GROUP BY hour
      ORDER BY hour ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      period: `${hours}h`,
      timeline: result.rows.map(row => ({
        hour: row.hour,
        total: parseInt(row.total),
        fraud_count: parseInt(row.fraud_count),
        fraud_rate: (row.fraud_count / row.total * 100).toFixed(2),
        avg_fraud_score: parseFloat(row.avg_fraud_score).toFixed(4)
      }))
    });

  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline', message: error.message });
  }
});

module.exports = router;
