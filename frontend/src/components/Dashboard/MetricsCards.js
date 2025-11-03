import React from 'react';
import { TrendingUp, AlertTriangle, Users, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

const MetricsCards = ({ metrics }) => {
  // Early return if no metrics or invalid structure
  if (!metrics || !metrics.transactions || !metrics.fraud) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Safe access with default values
  const transactionsTotal = metrics.transactions?.total ?? 0;
  const transactionsTotalAmount = metrics.transactions?.total_amount ?? 0;
  const transactionsUniqueCustomers = metrics.transactions?.unique_customers ?? 0;
  const transactionsUniqueMerchants = metrics.transactions?.unique_merchants ?? 0;
  const fraudCount = metrics.fraud?.count ?? 0;
  const fraudRate = metrics.fraud?.rate ?? 0;
  const fraudAmount = metrics.fraud?.amount ?? 0;
  const fraudAmountPercentage = metrics.fraud?.amount_percentage ?? 0;

  const cards = [
    {
      title: 'Total Transactions',
      value: transactionsTotal.toLocaleString(),
      subtitle: `${formatCurrency(transactionsTotalAmount)}`,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Fraud Detected',
      value: fraudCount.toLocaleString(),
      subtitle: `${formatPercentage(fraudRate)} of transactions`,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Unique Customers',
      value: transactionsUniqueCustomers.toLocaleString(),
      subtitle: `${transactionsUniqueMerchants.toLocaleString()} merchants`,
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Fraud Amount',
      value: formatCurrency(fraudAmount),
      subtitle: `${formatPercentage(fraudAmountPercentage)} of total`,
      icon: DollarSign,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="card hover:scale-105 transition-transform"
        >
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
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={card.iconColor} size={28} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
