const express = require('express');
const axios = require('axios');
const router = express.Router();

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Middleware to verify token and extract it
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

// CREATE USER
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(
      `${FASTAPI_URL}/admin/users`,
      req.body,
      {
        headers: {
          'Authorization': req.token,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { detail: 'Failed to create user' }
    );
  }
});

// LIST USERS (with pagination and filters)
router.get('/', async (req, res) => {
  try {
    const { limit, offset, role, is_active, search } = req.query;
    
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    if (role) params.append('role', role);
    if (is_active !== undefined) params.append('is_active', is_active);
    if (search) params.append('search', search);

    const response = await axios.get(
      `${FASTAPI_URL}/admin/users?${params.toString()}`,
      {
        headers: {
          'Authorization': req.token,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error listing users:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { detail: 'Failed to list users' }
    );
  }
});

// GET USER BY ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `${FASTAPI_URL}/admin/users/${req.params.id}`,
      {
        headers: {
          'Authorization': req.token,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error getting user:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { detail: 'Failed to get user' }
    );
  }
});

// UPDATE USER
router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(
      `${FASTAPI_URL}/admin/users/${req.params.id}`,
      req.body,
      {
        headers: {
          'Authorization': req.token,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { detail: 'Failed to update user' }
    );
  }
});

// DELETE USER
router.delete('/:id', async (req, res) => {
  try {
    const response = await axios.delete(
      `${FASTAPI_URL}/admin/users/${req.params.id}`,
      {
        headers: {
          'Authorization': req.token,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { detail: 'Failed to delete user' }
    );
  }
});

// ACTIVATE/DEACTIVATE USER
router.patch('/:id/activate', async (req, res) => {
  try {
    const response = await axios.patch(
      `${FASTAPI_URL}/admin/users/${req.params.id}/activate`,
      req.body,
      {
        headers: {
          'Authorization': req.token,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error toggling user activation:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { detail: 'Failed to toggle user activation' }
    );
  }
});

// CHANGE USER ROLE
router.patch('/:id/role', async (req, res) => {
  try {
    const response = await axios.patch(
      `${FASTAPI_URL}/admin/users/${req.params.id}/role`,
      req.body,
      {
        headers: {
          'Authorization': req.token,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error changing user role:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { detail: 'Failed to change user role' }
    );
  }
});

// RESET USER PASSWORD
router.patch('/:id/password', async (req, res) => {
  try {
    const response = await axios.patch(
      `${FASTAPI_URL}/admin/users/${req.params.id}/password`,
      req.body,
      {
        headers: {
          'Authorization': req.token,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error resetting user password:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { detail: 'Failed to reset user password' }
    );
  }
});

module.exports = router;
