import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { transactionAPI } from '../services/api';
import TransactionTable from '../components/Transactions/TransactionTable';
import TransactionModal from '../components/Transactions/TransactionModal';
import FilterPanel from '../components/Transactions/FilterPanel';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    transaction_id: '',
    customer_id: '',
    is_fraud: '',
    limit: 100,
    offset: 0,
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.search(filters);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = () => {
    fetchTransactions();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = async (transaction) => {
    try {
      const response = await transactionAPI.getById(transaction.transaction_id);
      setSelectedTransaction(response.data);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };

  const exportToCSV = () => {
    // Simple CSV export
    const headers = ['Transaction ID', 'Customer ID', 'Amount', 'Fraud Score', 'Predicted Fraud', 'Time'];
    const rows = transactions.map(t => [
      t.transaction_id,
      t.customer_id,
      t.amount,
      t.fraud_score,
      t.is_fraud_predicted,
      t.time
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Search and review all transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn btn-secondary flex items-center"
          disabled={transactions.length === 0}
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Transaction ID or Customer ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.transaction_id}
                onChange={(e) => handleFilterChange('transaction_id', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
          <button
            onClick={handleSearch}
            className="btn btn-primary"
          >
            Search
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onApply={handleSearch}
          />
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default Transactions;
