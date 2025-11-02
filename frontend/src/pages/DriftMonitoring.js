import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { driftAPI } from '../services/api';
import DriftReportsTable from '../components/Drift/DriftReportsTable';
import DriftStatsCards from '../components/Drift/DriftStatsCards';

const DriftMonitoring = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDriftData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        driftAPI.getReports(20),
        driftAPI.getStats()
      ]);

      setReports(reportsRes.data.reports);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching drift data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDriftData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drift Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor data and model drift over time</p>
        </div>
        <button
          onClick={fetchDriftData}
          className="btn btn-secondary flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && <DriftStatsCards stats={stats} />}

      {/* Drift Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Drift Reports
          </h3>
          <span className="text-sm text-gray-600">
            {reports.length} reports
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No drift reports available</p>
            <p className="text-sm mt-2">Drift detection runs periodically via Airflow DAGs</p>
          </div>
        ) : (
          <DriftReportsTable reports={reports} />
        )}
      </div>
    </div>
  );
};

export default DriftMonitoring;
