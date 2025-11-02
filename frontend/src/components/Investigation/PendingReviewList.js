import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDateTime, getFraudRiskLevel, getBadgeColor, truncateId } from '../../utils/helpers';

const PendingReviewList = ({ transactions, selectedTransaction, onSelectTransaction }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No pending investigations</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pending Investigations ({transactions.length})
      </h3>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {transactions.map((transaction) => {
          const riskLevel = getFraudRiskLevel(transaction.fraud_score);
          const badgeColor = getBadgeColor(riskLevel);
          const isSelected = selectedTransaction?.transaction_id === transaction.transaction_id;

          return (
            <div
              key={transaction.transaction_id}
              onClick={() => onSelectTransaction(transaction)}
              className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-blue-50 border-blue-500 shadow-md' 
                  : 'bg-white border-red-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`badge ${badgeColor}`}>
                      {(transaction.fraud_score * 100).toFixed(1)}% Risk
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(transaction.prediction_time)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Transaction:</span>
                      <span className="ml-2 font-mono font-semibold">
                        {truncateId(transaction.transaction_id)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <span className="ml-2 font-mono">
                        {transaction.customer_id || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Merchant:</span>
                      <span className="ml-2 font-mono">
                        {transaction.merchant_id || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                    Selected
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingReviewList;
