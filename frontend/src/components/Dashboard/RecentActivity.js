import React from 'react';
import { Clock } from 'lucide-react';
import { formatTime, getFraudRiskLevel, getBadgeColor } from '../../utils/helpers';

const RecentActivity = ({ frauds }) => {
  if (!frauds || frauds.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <p className="text-gray-500 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Activity
        </h3>
        <Clock size={20} className="text-gray-400" />
      </div>

      <div className="space-y-3">
        {frauds.map((fraud, index) => {
          const riskLevel = getFraudRiskLevel(fraud.fraud_score);
          const badgeColor = getBadgeColor(riskLevel);

          return (
            <div
              key={fraud.transaction_id || index}
              className="flex items-center space-x-3 pb-3 border-b border-gray-200 last:border-0"
            >
              <div className={`w-3 h-3 rounded-full ${
                riskLevel === 'high' ? 'bg-red-500' :
                riskLevel === 'medium' ? 'bg-orange-500' :
                'bg-yellow-500'
              } animate-pulse`}></div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    ${fraud.amount}
                  </span>
                  <span className={`text-xs badge ${badgeColor}`}>
                    {(fraud.fraud_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatTime(fraud.prediction_time)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
