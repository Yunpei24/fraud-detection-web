/**
 * Models routes - Get production models status
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
 * GET /api/models/status
 * Get current deployment status and production models
 * Proxies to FastAPI /api/v1/deployment/deployment-status
 */
router.get('/status', async (req, res) => {
  try {
    console.log('[MODELS] Fetching deployment status');
    console.log(`[MODELS] FastAPI URL: ${FASTAPI_URL}/api/v1/deployment/deployment-status`);

    // Forward request to FastAPI
    const response = await axios.get(
      `${FASTAPI_URL}/api/v1/deployment/deployment-status`,
      {
        headers: {
          Authorization: req.token,
        },
      }
    );

    console.log('[MODELS] Deployment status retrieved successfully');

    // Return deployment status to frontend
    res.json(response.data);
  } catch (error) {
    console.error('[MODELS] Failed to get deployment status:', error.response?.data || error.message);
    
    if (error.response) {
      // Forward FastAPI error response
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        detail: 'Model service unavailable',
      });
    }
  }
});

module.exports = router;
