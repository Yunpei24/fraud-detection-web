import React from 'react';
import { Eye } from 'lucide-react';
import { formatCurrency, formatDateTime, getFraudRiskLevel, getBadgeColor, truncateId } from '../../utils/helpers';

const TransactionTable = ({ transactions, onViewDetails }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fraud Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const riskLevel = getFraudRiskLevel(transaction.fraud_score || 0);
              const badgeColor = getBadgeColor(riskLevel);

              return (
                <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {truncateId(transaction.transaction_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {transaction.customer_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.fraud_score 
                      ? `${(transaction.fraud_score * 100).toFixed(1)}%`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${badgeColor}`}>
                      {transaction.is_fraud_predicted ? 'Fraud' : 'Legitimate'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(transaction.time || transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onViewDetails(transaction)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
          Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
