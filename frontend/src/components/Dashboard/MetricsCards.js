import React from 'react';
import { TrendingUp, AlertTriangle, Users, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

const MetricsCards = ({ metrics }) => {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Transactions',
      value: metrics.transactions.total.toLocaleString(),
      subtitle: `${formatCurrency(metrics.transactions.total_amount)}`,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Fraud Detected',
      value: metrics.fraud.count.toLocaleString(),
      subtitle: `${formatPercentage(metrics.fraud.rate)} of transactions`,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Unique Customers',
      value: metrics.transactions.unique_customers.toLocaleString(),
      subtitle: `${metrics.transactions.unique_merchants} merchants`,
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Fraud Amount',
      value: formatCurrency(metrics.fraud.amount),
      subtitle: `${formatPercentage(metrics.fraud.amount_percentage)} of total`,
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
