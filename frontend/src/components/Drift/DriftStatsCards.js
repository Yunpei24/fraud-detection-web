import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatPercentage } from '../../utils/helpers';

const DriftStatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Analyses',
      value: stats.total_analyses.toLocaleString(),
      subtitle: `Last: ${new Date(stats.last_analysis).toLocaleDateString()}`,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: 'Drift Detected',
      value: stats.drift_detected_count.toLocaleString(),
      subtitle: `${formatPercentage(stats.drift_rate)} of analyses`,
      icon: AlertTriangle,
      color: stats.drift_rate > 20 ? 'red' : 'orange',
    },
    {
      title: 'Critical Alerts',
      value: stats.severity_distribution?.critical || 0,
      subtitle: `${stats.severity_distribution?.high || 0} high severity`,
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title: 'Avg Drift Score',
      value: stats.avg_drift_score,
      subtitle: `Max: ${stats.max_drift_score}`,
      icon: CheckCircle,
      color: 'green',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {card.subtitle}
              </p>
            </div>
            <div className={`p-3 rounded-lg bg-${card.color}-50`}>
              <card.icon className={`text-${card.color}-600`} size={28} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DriftStatsCards;
