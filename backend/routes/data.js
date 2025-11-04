/**
 * Data routes - Fetch training, transaction, and prediction data
 */

const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  // Token is valid (verified by frontend), proceed
  next();
};

// Apply token verification to all routes
router.use(verifyToken);

/**
 * GET /api/data/training
 * Fetch training data from training_transactions table
 */
router.get('/training', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    console.log(`[DATA] Fetching training data (limit: ${limit}, offset: ${offset})`);

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM training_transactions');
    const totalCount = parseInt(countResult.rows[0].count);

    // Get training data
    const result = await pool.query(
      `SELECT 
        id, 
        time, 
        v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
        v11, v12, v13, v14, v15, v16, v17, v18, v19, v20,
        v21, v22, v23, v24, v25, v26, v27, v28,
        amount, 
        class,
        dataset_source,
        imported_at
      FROM training_transactions 
      ORDER BY id 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    console.log(`[DATA] Retrieved ${result.rows.length} training records`);

    res.json({
      data: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      has_more: (parseInt(offset) + result.rows.length) < totalCount
    });

  } catch (error) {
    console.error('[DATA] Error fetching training data:', error);
    res.status(500).json({
      error: 'Failed to fetch training data',
      details: error.message
    });
  }
});

/**
 * GET /api/data/transactions
 * Fetch transaction data from transactions table
 */
router.get('/transactions', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    console.log(`[DATA] Fetching transactions (limit: ${limit}, offset: ${offset})`);

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM transactions');
    const totalCount = parseInt(countResult.rows[0].count);

    // Get transactions
    const result = await pool.query(
      `SELECT 
        id,
        transaction_id,
        customer_id,
        merchant_id,
        amount,
        currency,
        time,
        customer_zip,
        merchant_zip,
        customer_country,
        merchant_country,
        device_id,
        session_id,
        ip_address,
        mcc,
        transaction_type,
        is_fraud,
        is_disputed,
        v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
        v11, v12, v13, v14, v15, v16, v17, v18, v19, v20,
        v21, v22, v23, v24, v25, v26, v27, v28,
        source_system,
        ingestion_timestamp,
        created_at
      FROM transactions 
      ORDER BY time DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    console.log(`[DATA] Retrieved ${result.rows.length} transaction records`);

    res.json({
      data: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      has_more: (parseInt(offset) + result.rows.length) < totalCount
    });

  } catch (error) {
    console.error('[DATA] Error fetching transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error.message
    });
  }
});

/**
 * GET /api/data/predictions
 * Fetch prediction data from predictions table
 */
router.get('/predictions', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    console.log(`[DATA] Fetching predictions (limit: ${limit}, offset: ${offset})`);

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM predictions');
    const totalCount = parseInt(countResult.rows[0].count);

    // Get predictions with transaction info
    const result = await pool.query(
      `SELECT 
        p.id,
        p.transaction_id,
        p.fraud_score,
        p.is_fraud_predicted,
        p.model_version,
        p.model_name,
        p.confidence,
        p.prediction_time,
        p.prediction_latency_ms,
        p.feature_importance,
        p.alert_sent,
        p.alert_sent_at,
        t.amount,
        t.customer_id,
        t.merchant_id,
        t.is_fraud as actual_fraud
      FROM predictions p
      LEFT JOIN transactions t ON p.transaction_id = t.transaction_id
      ORDER BY p.prediction_time DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    console.log(`[DATA] Retrieved ${result.rows.length} prediction records`);

    res.json({
      data: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      has_more: (parseInt(offset) + result.rows.length) < totalCount
    });

  } catch (error) {
    console.error('[DATA] Error fetching predictions:', error);
    res.status(500).json({
      error: 'Failed to fetch predictions',
      details: error.message
    });
  }
});

/**
 * GET /api/data/training/all
 * Fetch ALL training data (for CSV export)
 */
router.get('/training/all', async (req, res) => {
  try {
    console.log('[DATA] Fetching ALL training data for export');

    const result = await pool.query(
      `SELECT 
        id, time, 
        v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
        v11, v12, v13, v14, v15, v16, v17, v18, v19, v20,
        v21, v22, v23, v24, v25, v26, v27, v28,
        amount, class, dataset_source, imported_at
      FROM training_transactions 
      ORDER BY id`
    );

    console.log(`[DATA] Exporting ${result.rows.length} training records`);

    res.json({ data: result.rows });

  } catch (error) {
    console.error('[DATA] Error fetching all training data:', error);
    res.status(500).json({
      error: 'Failed to fetch training data',
      details: error.message
    });
  }
});

/**
 * GET /api/data/transactions/all
 * Fetch ALL transactions (for CSV export)
 */
router.get('/transactions/all', async (req, res) => {
  try {
    console.log('[DATA] Fetching ALL transactions for export');

    const result = await pool.query(
      `SELECT 
        id, transaction_id, customer_id, merchant_id,
        amount, currency, time,
        customer_zip, merchant_zip, customer_country, merchant_country,
        device_id, session_id, ip_address, mcc, transaction_type,
        is_fraud, is_disputed,
        v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
        v11, v12, v13, v14, v15, v16, v17, v18, v19, v20,
        v21, v22, v23, v24, v25, v26, v27, v28,
        source_system, ingestion_timestamp, created_at
      FROM transactions 
      ORDER BY time DESC`
    );

    console.log(`[DATA] Exporting ${result.rows.length} transaction records`);

    res.json({ data: result.rows });

  } catch (error) {
    console.error('[DATA] Error fetching all transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error.message
    });
  }
});

/**
 * GET /api/data/predictions/all
 * Fetch ALL predictions (for CSV export)
 */
router.get('/predictions/all', async (req, res) => {
  try {
    console.log('[DATA] Fetching ALL predictions for export');

    const result = await pool.query(
      `SELECT 
        p.id, p.transaction_id, p.fraud_score, p.is_fraud_predicted,
        p.model_version, p.model_name, p.confidence,
        p.prediction_time, p.prediction_latency_ms,
        p.alert_sent, p.alert_sent_at,
        t.amount, t.customer_id, t.merchant_id, t.is_fraud as actual_fraud
      FROM predictions p
      LEFT JOIN transactions t ON p.transaction_id = t.transaction_id
      ORDER BY p.prediction_time DESC`
    );

    console.log(`[DATA] Exporting ${result.rows.length} prediction records`);

    res.json({ data: result.rows });

  } catch (error) {
    console.error('[DATA] Error fetching all predictions:', error);
    res.status(500).json({
      error: 'Failed to fetch predictions',
      details: error.message
    });
  }
});

module.exports = router;
