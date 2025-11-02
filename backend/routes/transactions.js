const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const axios = require('axios');

/**
 * GET /api/transactions/search
 * Search transactions with filters
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      transaction_id, 
      customer_id, 
      merchant_id,
      start_date, 
      end_date,
      is_fraud,
      min_amount,
      max_amount,
      limit = 100,
      offset = 0
    } = req.query;
    
    let query = `
      SELECT 
        t.transaction_id,
        t.customer_id,
        t.merchant_id,
        t.amount,
        t.time,
        t.created_at,
        t.v1, t.v2, t.v3, t.v4, t.v5,
        p.fraud_score,
        p.is_fraud_predicted,
        p.prediction_time,
        p.model_version,
        p.feature_importance
      FROM transactions t
      LEFT JOIN predictions p ON t.transaction_id = p.transaction_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (transaction_id) {
      params.push(transaction_id);
      query += ` AND t.transaction_id = $${paramCount++}`;
    }
    
    if (customer_id) {
      params.push(customer_id);
      query += ` AND t.customer_id = $${paramCount++}`;
    }
    
    if (merchant_id) {
      params.push(merchant_id);
      query += ` AND t.merchant_id = $${paramCount++}`;
    }
    
    if (start_date && end_date) {
      params.push(start_date, end_date);
      query += ` AND t.time BETWEEN $${paramCount++} AND $${paramCount++}`;
    }
    
    if (is_fraud !== undefined) {
      params.push(is_fraud === 'true');
      query += ` AND p.is_fraud_predicted = $${paramCount++}`;
    }
    
    if (min_amount) {
      params.push(min_amount);
      query += ` AND t.amount >= $${paramCount++}`;
    }
    
    if (max_amount) {
      params.push(max_amount);
      query += ` AND t.amount <= $${paramCount++}`;
    }
    
    query += ` ORDER BY t.time DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      total: result.rowCount,
      transactions: result.rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error searching transactions:', error);
    res.status(500).json({ error: 'Failed to search transactions', message: error.message });
  }
});

/**
 * GET /api/transactions/:id
 * Get transaction details with prediction
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        t.*,
        p.fraud_score,
        p.is_fraud_predicted,
        p.prediction_time,
        p.model_version,
        p.feature_importance,
        p.shap_values
      FROM transactions t
      LEFT JOIN predictions p ON t.transaction_id = p.transaction_id
      WHERE t.transaction_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction', message: error.message });
  }
});

/**
 * GET /api/transactions/:id/history
 * Get transaction label history (analyst feedback)
 */
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        fl.id,
        fl.transaction_id,
        fl.confirmed_label,
        fl.analyst_id,
        fl.feedback_notes,
        fl.created_at,
        fl.confidence,
        u.username as analyst_name
      FROM feedback_labels fl
      LEFT JOIN users u ON fl.analyst_id = u.id
      WHERE fl.transaction_id = $1
      ORDER BY fl.created_at DESC
    `;
    
    const result = await pool.query(query, [id]);
    
    res.json({
      transaction_id: id,
      history: result.rows
    });

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch history', message: error.message });
  }
});

/**
 * POST /api/transactions/:id/feedback
 * Submit analyst feedback for a transaction
 */
router.post('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmed_label, analyst_id, feedback_notes, confidence } = req.body;
    
    if (confirmed_label === undefined || !analyst_id) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['confirmed_label', 'analyst_id'] 
      });
    }
    
    const query = `
      INSERT INTO feedback_labels 
      (transaction_id, confirmed_label, analyst_id, feedback_notes, confidence)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      id,
      confirmed_label,
      analyst_id,
      feedback_notes || null,
      confidence || null
    ]);
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: result.rows[0]
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback', message: error.message });
  }
});

/**
 * POST /api/transactions/predict
 * Proxy to FastAPI for manual prediction
 */
router.post('/predict', async (req, res) => {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    
    const response = await axios.post(
      `${fastApiUrl}/api/v1/predict`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.API_KEY || ''
        },
        timeout: 10000
      }
    );
    
    res.json(response.data);

  } catch (error) {
    console.error('Error calling FastAPI:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'Failed to connect to prediction service',
        message: error.message 
      });
    }
  }
});

module.exports = router;
