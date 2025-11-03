/**
 * Explainability routes - SHAP explanations and feature importance
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// FastAPI base URL from environment
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * Middleware to verify token and extract it
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  req.token = authHeader;
  next();
};

// Apply token verification to all routes
router.use(verifyToken);

/**
 * POST /api/explain/shap
 * Get SHAP explanation for a transaction
 * Proxies to FastAPI /api/v1/explain/shap
 */
router.post('/shap', async (req, res) => {
  try {
    console.log('[EXPLAIN] Requesting SHAP explanation');
    console.log(`[EXPLAIN] Transaction ID: ${req.body.transaction_id}`);
    console.log(`[EXPLAIN] FastAPI URL: ${FASTAPI_URL}/api/v1/explain/shap`);

    // Forward request to FastAPI
    const response = await axios.post(
      `${FASTAPI_URL}/api/v1/explain/shap`,
      req.body,
      {
        headers: {
          Authorization: req.token,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[EXPLAIN] SHAP explanation generated successfully');

    // Return SHAP explanation to frontend
    res.json(response.data);
  } catch (error) {
    console.error('[EXPLAIN] Failed to get SHAP explanation:', error.response?.data || error.message);
    
    if (error.response) {
      // Forward FastAPI error response
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        detail: 'Explainability service unavailable',
      });
    }
  }
});

/**
 * GET /api/explain/feature-importance/:model_type
 * Get global feature importance for a model
 * Proxies to FastAPI /api/v1/explain/feature-importance/:model_type
 */
router.get('/feature-importance/:model_type', async (req, res) => {
  try {
    const { model_type } = req.params;
    
    console.log('[EXPLAIN] Requesting feature importance');
    console.log(`[EXPLAIN] Model type: ${model_type}`);

    // Forward request to FastAPI
    const response = await axios.get(
      `${FASTAPI_URL}/api/v1/explain/feature-importance/${model_type}`,
      {
        headers: {
          Authorization: req.token,
        },
      }
    );

    console.log('[EXPLAIN] Feature importance retrieved successfully');

    res.json(response.data);
  } catch (error) {
    console.error('[EXPLAIN] Failed to get feature importance:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        detail: 'Explainability service unavailable',
      });
    }
  }
});

/**
 * GET /api/explain/models
 * Get list of available models for explanation
 * Proxies to FastAPI /api/v1/explain/models
 */
router.get('/models', async (req, res) => {
  try {
    console.log('[EXPLAIN] Requesting available models');

    const response = await axios.get(
      `${FASTAPI_URL}/api/v1/explain/models`,
      {
        headers: {
          Authorization: req.token,
        },
      }
    );

    console.log('[EXPLAIN] Available models retrieved successfully');

    res.json(response.data);
  } catch (error) {
    console.error('[EXPLAIN] Failed to get available models:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        detail: 'Explainability service unavailable',
      });
    }
  }
});

module.exports = router;
