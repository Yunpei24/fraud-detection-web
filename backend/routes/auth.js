/**
 * Authentication routes - Proxy to FastAPI JWT endpoints
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// FastAPI base URL from environment
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * POST /auth/login
 * Login with username and password
 * Proxies to FastAPI /api/v1/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = Object.fromEntries(
      new URLSearchParams(req.body)
    );

    console.log(`[AUTH] Login attempt for user: ${username}`);

    // Forward login request to FastAPI
    const response = await axios.post(
      `${FASTAPI_URL}/api/v1/auth/login`,
      new URLSearchParams({
        username,
        password,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log(`[AUTH] Login successful for user: ${username}`);

    // Return token and user info to frontend
    res.json(response.data);
  } catch (error) {
    console.error('[AUTH] Login failed:', error.response?.data || error.message);
    
    if (error.response) {
      // Forward FastAPI error response
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        detail: 'Authentication service unavailable',
      });
    }
  }
});

/**
 * POST /auth/refresh
 * Refresh JWT token
 * Proxies to FastAPI /api/v1/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    console.log('[AUTH] Token refresh request');

    // Forward refresh request to FastAPI
    const response = await axios.post(
      `${FASTAPI_URL}/api/v1/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('[AUTH] Token refresh successful');

    // Return new token and user info
    res.json(response.data);
  } catch (error) {
    console.error('[AUTH] Token refresh failed:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        detail: 'Authentication service unavailable',
      });
    }
  }
});

/**
 * GET /auth/me
 * Get current user information
 * Proxies to FastAPI /api/v1/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Forward request to FastAPI
    const response = await axios.get(
      `${FASTAPI_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[AUTH] Get user info failed:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        detail: 'Authentication service unavailable',
      });
    }
  }
});

/**
 * Middleware to verify JWT token
 * Can be used to protect routes in this backend
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with FastAPI
    const response = await axios.get(
      `${FASTAPI_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Attach user info to request
    req.user = response.data;
    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.response?.data || error.message);
    res.status(401).json({ detail: 'Invalid or expired token' });
  }
};

module.exports = router;
module.exports.verifyToken = verifyToken;
