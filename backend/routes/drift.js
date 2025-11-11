const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * GET /api/drift/reports
 * Get recent drift reports
 */
router.get('/reports', async (req, res) => {
  try {
    const { limit = 10, severity } = req.query;
    
    let query = `
      SELECT 
        id,
        timestamp,
        summary,
        severity,
        recommendations,
        alerts
      FROM drift_reports
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (severity) {
      params.push(severity.toUpperCase());
      query += ` WHERE severity = $${paramCount++}`;
    }
    
    query += ` ORDER BY timestamp DESC LIMIT $${paramCount++}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    
    res.json({
      total: result.rowCount,
      reports: result.rows
    });

  } catch (error) {
    console.error('Error fetching drift reports:', error);
    res.status(500).json({ error: 'Failed to fetch drift reports', message: error.message });
  }
});

/**
 * GET /api/drift/latest
 * Get the latest comprehensive drift analysis
 */
router.get('/latest', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        timestamp,
        analysis_window,
        reference_window,
        data_drift,
        target_drift,
        concept_drift,
        multivariate_drift,
        drift_summary
      FROM drift_analysis_results
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No drift analysis found',
        message: 'Run drift detection first'
      });
    }
    
    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching latest drift:', error);
    res.status(500).json({ error: 'Failed to fetch drift analysis', message: error.message });
  }
});

/**
 * GET /api/drift/history
 * Get drift detection history (time series)
 */
router.get('/history', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const query = `
      SELECT 
        timestamp,
        data_drift,
        target_drift,
        concept_drift,
        drift_summary
      FROM drift_analysis_results
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
      ORDER BY timestamp ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      period: `${days}d`,
      history: result.rows
    });

  } catch (error) {
    console.error('Error fetching drift history:', error);
    res.status(500).json({ error: 'Failed to fetch drift history', message: error.message });
  }
});

/**
 * GET /api/drift/stats
 * Get drift statistics summary
 */
router.get('/stats', async (req, res) => {
  try {
    // Get count of total analyses
    const countQuery = `
      SELECT 
        COUNT(*) as total_analyses,
        MAX(timestamp) as last_analysis
      FROM drift_analysis_results
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    `;
    
    const countResult = await pool.query(countQuery);
    const stats = countResult.rows[0];
    
    // Get drift detection count from drift_summary
    // drift_summary contains info about whether drift was detected
    const driftQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE (drift_summary->>'overall_drift_detected')::boolean = true) as drift_detected_count,
        AVG(CASE 
          WHEN drift_summary->>'severity_score' IS NOT NULL 
          THEN (drift_summary->>'severity_score')::float 
          ELSE 0 
        END) as avg_drift_score,
        MAX(CASE 
          WHEN drift_summary->>'severity_score' IS NOT NULL 
          THEN (drift_summary->>'severity_score')::float 
          ELSE 0 
        END) as max_drift_score
      FROM drift_analysis_results
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    `;
    
    const driftResult = await pool.query(driftQuery);
    const driftStats = driftResult.rows[0];
    
    // Get severity distribution from reports
    const severityQuery = `
      SELECT 
        severity,
        COUNT(*) as count
      FROM drift_reports
      WHERE timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY severity
    `;
    
    const severityResult = await pool.query(severityQuery);
    
    res.json({
      total_analyses: parseInt(stats.total_analyses),
      drift_detected_count: parseInt(driftStats.drift_detected_count || 0),
      drift_rate: stats.total_analyses > 0 
        ? ((driftStats.drift_detected_count / stats.total_analyses) * 100).toFixed(2)
        : 0,
      avg_drift_score: parseFloat(driftStats.avg_drift_score || 0).toFixed(4),
      max_drift_score: parseFloat(driftStats.max_drift_score || 0).toFixed(4),
      last_analysis: stats.last_analysis,
      severity_distribution: severityResult.rows.reduce((acc, row) => {
        acc[row.severity.toLowerCase()] = parseInt(row.count);
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Error fetching drift stats:', error);
    res.status(500).json({ error: 'Failed to fetch drift statistics', message: error.message });
  }
});

module.exports = router;
