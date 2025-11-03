import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Users, DollarSign, RefreshCw } from 'lucide-react';
import { metricsAPI, fraudAPI } from '../services/api';
import { subscribeToFraudAlerts, subscribeToNewPredictions } from '../services/websocket';
import MetricsCards from '../components/Dashboard/MetricsCards';
import ModelStatusCard from '../components/Dashboard/ModelStatusCard';
import FraudAlertStream from '../components/Dashboard/FraudAlertStream';
import RecentActivity from '../components/Dashboard/RecentActivity';
import FraudTimeline from '../components/Dashboard/FraudTimeline';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentFrauds, setRecentFrauds] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [liveAlert, setLiveAlert] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [metricsRes, fraudsRes, timelineRes] = await Promise.all([
        metricsAPI.getDashboard('24h'),
        fraudAPI.getRecent(20),
        fraudAPI.getTimeline(24)
      ]);

      setMetrics(metricsRes.data);
      setRecentFrauds(fraudsRes.data.frauds);
      setTimeline(timelineRes.data.timeline);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Setup auto-refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Subscribe to real-time fraud alerts
  useEffect(() => {
    const unsubscribeFraudAlerts = subscribeToFraudAlerts((data) => {
      console.log('🚨 New fraud alert:', data);
      setLiveAlert(data);
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => setLiveAlert(null), 10000);
      
      // Refresh data
      fetchDashboardData();
    });

    const unsubscribeNewPredictions = subscribeToNewPredictions((data) => {
      console.log('📊 New predictions:', data);
    });

    return () => {
      unsubscribeFraudAlerts();
      unsubscribeNewPredictions();
    };
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
      {/* Live Alert Banner */}
      {liveAlert && (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="mr-3" size={24} />
              <div>
                <p className="font-semibold">
                  🚨 {liveAlert.count} New Fraud Alert{liveAlert.count > 1 ? 's' : ''} Detected!
                </p>
                <p className="text-sm text-red-100">
                  Just received from real-time pipeline - Check Investigation tab for details
                </p>
              </div>
            </div>
            <button
              onClick={() => setLiveAlert(null)}
              className="text-white hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time fraud detection overview</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && <MetricsCards metrics={metrics} />}

      {/* Model Status Card */}
      <ModelStatusCard />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fraud Alert Stream (2 columns) */}
        <div className="lg:col-span-2">
          <FraudAlertStream frauds={recentFrauds} />
        </div>

        {/* Recent Activity (1 column) */}
        <div>
          <RecentActivity frauds={recentFrauds.slice(0, 10)} />
        </div>
      </div>

      {/* Timeline Chart */}
      {timeline && timeline.length > 0 && (
        <FraudTimeline data={timeline} />
      )}
    </div>
  );
};

export default Dashboard;
