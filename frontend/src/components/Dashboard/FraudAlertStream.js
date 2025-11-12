import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  formatCurrency, 
  formatDateTime, 
  getFraudRiskLevel, 
  getBadgeColor,
  truncateId 
} from '../../utils/helpers';

const FraudAlertStream = ({ frauds }) => {
  const navigate = useNavigate();

  const handleInvestigate = (fraud) => {
    // Navigate to Investigation page with transaction pre-selected
    navigate('/investigation', {
      state: { selectedTransactionId: fraud.transaction_id }
    });
  };
  if (!frauds || frauds.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Fraud Alerts
        </h3>
        <div className="text-center py-12 text-gray-500">
          <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No fraud alerts in the last 24 hours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Fraud Alerts
        </h3>
        <span className="text-sm text-gray-600">
          {frauds.length} alerts
        </span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {frauds.map((fraud, index) => {
          const riskLevel = getFraudRiskLevel(fraud.fraud_score);
          const badgeColor = getBadgeColor(riskLevel);

          return (
            <div
              key={fraud.transaction_id || index}
              className={`p-4 rounded-lg border-l-4 ${
                riskLevel === 'high' ? 'border-red-500 bg-red-50' :
                riskLevel === 'medium' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              } transition-all hover:shadow-md slide-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`badge ${badgeColor}`}>
                      {(fraud.fraud_score * 100).toFixed(1)}% Risk
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(fraud.prediction_time)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Transaction:</span>
                      <span className="ml-2 font-mono font-semibold">
                        {truncateId(fraud.transaction_id)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {formatCurrency(fraud.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <span className="ml-2 font-mono">
                        {fraud.customer_id || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Merchant:</span>
                      <span className="ml-2 font-mono">
                        {fraud.merchant_id || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {fraud.model_version && (
                    <div className="mt-2 text-xs text-gray-500">
                      Model: {fraud.model_version}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleInvestigate(fraud)}
                  className="ml-4 px-3 py-1 bg-blue-600 text-white border border-blue-700 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
                >
                  Investigate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FraudAlertStream;
