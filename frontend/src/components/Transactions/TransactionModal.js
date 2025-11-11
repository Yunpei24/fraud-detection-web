import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency, formatDateTime, formatUnixTimestamp, getFraudRiskLevel, getBadgeColor } from '../../utils/helpers';

const TransactionModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const riskLevel = getFraudRiskLevel(transaction.fraud_score || 0);
  const badgeColor = getBadgeColor(riskLevel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Transaction Details
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-mono">
              {transaction.transaction_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Risk Assessment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Risk Assessment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Fraud Probability</span>
                <div className="mt-1">
                  <span className={`badge ${badgeColor} text-lg`}>
                    {(transaction.fraud_score * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Prediction</span>
                <div className="mt-1">
                  <span className={`badge ${transaction.is_fraud_predicted ? 'badge-high' : 'badge-safe'}`}>
                    {transaction.is_fraud_predicted ? 'FRAUD' : 'LEGITIMATE'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Model Version</span>
                <p className="text-sm font-mono mt-1">{transaction.model_version || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Prediction Time</span>
                <p className="text-sm mt-1">{formatDateTime(transaction.prediction_time)}</p>
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Transaction Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Amount</span>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Transaction Time</span>
                <p className="text-sm mt-1">{formatUnixTimestamp(transaction.time)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Actual Class</span>
                <div className="mt-1">
                  <span className={`badge ${transaction.class === 1 ? 'badge-high' : 'badge-safe'}`}>
                    {transaction.class === 1 ? 'FRAUD' : 'LEGITIMATE'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Transaction Source</span>
                <p className="text-sm mt-1">{transaction.source || 'kafka'}</p>
              </div>
            </div>
          </div>

          {/* Feature Importance (if available) */}
          {transaction.feature_importance && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Top Contributing Features
              </h3>
              <div className="space-y-2">
                {Object.entries(transaction.feature_importance)
                  .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                  .slice(0, 5)
                  .map(([feature, importance]) => (
                    <div key={feature} className="flex items-center">
                      <span className="text-sm text-gray-600 w-20">{feature}</span>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 rounded-full h-2"
                            style={{ width: `${Math.abs(importance) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-mono w-16 text-right">
                        {(Math.abs(importance) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
