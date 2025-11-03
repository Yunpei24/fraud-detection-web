import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const FraudTimeline = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Format data for chart
  const chartData = data.map(item => ({
    hour: new Date(item.hour).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    total: parseInt(item.total),
    fraud: parseInt(item.fraud_count),
    fraudRate: parseFloat(item.fraud_rate),
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Fraud Detection Timeline (24h)
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Transaction Volume
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                fill="#93c5fd"
                name="Total Transactions"
              />
              <Area
                type="monotone"
                dataKey="fraud"
                stroke="#ef4444"
                fill="#fca5a5"
                name="Fraud Detected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fraud Rate Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Fraud Rate (%)
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="fraudRate"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                name="Fraud Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FraudTimeline;
