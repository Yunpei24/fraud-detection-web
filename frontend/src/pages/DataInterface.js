import React, { useState, useEffect, useCallback } from 'react';
import { Database, Table, BarChart3, RefreshCw } from 'lucide-react';
import { dataAPI } from '../services/api';
import DataTable from '../components/Data/DataTable';

const DataInterface = () => {
  const [activeTab, setActiveTab] = useState('training'); // 'training', 'transactions', 'predictions'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0,
    has_more: false
  });

  // Fetch data based on active tab
  const fetchData = useCallback(async (tab = activeTab, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      const limit = pagination.limit;

      switch (tab) {
        case 'training':
          response = await dataAPI.getTrainingData(limit, offset);
          break;
        case 'transactions':
          response = await dataAPI.getTransactions(limit, offset);
          break;
        case 'predictions':
          response = await dataAPI.getPredictions(limit, offset);
          break;
        default:
          throw new Error('Invalid tab');
      }

      setData(response.data.data);
      setPagination({
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset,
        has_more: response.data.has_more
      });

    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
      setError(err.response?.data?.error || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.limit]);

  // Load data when tab changes
  useEffect(() => {
    fetchData(activeTab, 0);
  }, [activeTab, fetchData]);

  // Handle page change
  const handlePageChange = (newOffset) => {
    fetchData(activeTab, newOffset);
  };

  // Download CSV function
  const downloadCSV = async () => {
    try {
      setLoading(true);
      let response;

      // Fetch ALL data for export
      switch (activeTab) {
        case 'training':
          response = await dataAPI.getAllTrainingData();
          break;
        case 'transactions':
          response = await dataAPI.getAllTransactions();
          break;
        case 'predictions':
          response = await dataAPI.getAllPredictions();
          break;
        default:
          return;
      }

      const allData = response.data.data;

      if (!allData || allData.length === 0) {
        alert('No data to export');
        return;
      }

      // Convert to CSV
      const headers = Object.keys(allData[0]);
      const csvContent = [
        headers.join(','),
        ...allData.map(row =>
          headers.map(header => {
            let value = row[header];
            // Handle null/undefined
            if (value === null || value === undefined) return '';
            // Handle objects/arrays (JSON stringify)
            if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
            // Escape commas and quotes
            value = String(value).replace(/"/g, '""');
            return `"${value}"`;
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeTab}_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Downloaded ${allData.length} records as CSV`);

    } catch (err) {
      console.error('Error downloading CSV:', err);
      alert('Failed to download CSV: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Column definitions for each data type
  const getColumns = () => {
    switch (activeTab) {
      case 'training':
        return [
          { key: 'id', label: 'ID' },
          { key: 'time', label: 'Time' },
          { key: 'amount', label: 'Amount', render: (val) => `$${parseFloat(val).toFixed(2)}` },
          { key: 'class', label: 'Class', render: (val) => (
            <span className={`badge ${val === 1 ? 'badge-danger' : 'badge-success'}`}>
              {val === 1 ? 'Fraud' : 'Legitimate'}
            </span>
          )},
          { key: 'v1', label: 'V1', render: (val) => parseFloat(val).toFixed(4) },
          { key: 'v2', label: 'V2', render: (val) => parseFloat(val).toFixed(4) },
          { key: 'v3', label: 'V3', render: (val) => parseFloat(val).toFixed(4) },
          { key: 'dataset_source', label: 'Source' },
          { key: 'imported_at', label: 'Imported At', render: (val) => new Date(val).toLocaleString() }
        ];

      case 'transactions':
        return [
          { key: 'id', label: 'ID' },
          { key: 'transaction_id', label: 'Transaction ID' },
          { key: 'time', label: 'Time' },
          { key: 'amount', label: 'Amount', render: (val) => `$${parseFloat(val).toFixed(2)}` },
          { key: 'class', label: 'Class', render: (val) => (
            <span className={`badge ${val === 1 ? 'badge-danger' : 'badge-success'}`}>
              {val === 1 ? 'Fraud' : 'Legitimate'}
            </span>
          )},
          { key: 'v1', label: 'V1', render: (val) => val !== null ? parseFloat(val).toFixed(4) : '-' },
          { key: 'v2', label: 'V2', render: (val) => val !== null ? parseFloat(val).toFixed(4) : '-' },
          { key: 'v3', label: 'V3', render: (val) => val !== null ? parseFloat(val).toFixed(4) : '-' },
          { key: 'source', label: 'Source' },
          { key: 'timestamp', label: 'Timestamp', render: (val) => val ? new Date(val).toLocaleString() : '-' },
          { key: 'ingestion_timestamp', label: 'Ingestion', render: (val) => val ? new Date(val).toLocaleString() : '-' }
        ];

      case 'predictions':
        return [
          { key: 'id', label: 'ID' },
          { key: 'transaction_id', label: 'Transaction ID' },
          { key: 'fraud_score', label: 'Fraud Score', render: (val) => (
            <span className={`font-semibold ${val >= 0.7 ? 'text-red-600' : val >= 0.4 ? 'text-yellow-600' : 'text-green-600'}`}>
              {(val * 100).toFixed(2)}%
            </span>
          )},
          { key: 'is_fraud_predicted', label: 'Predicted Fraud', render: (val) => (
            <span className={`badge ${val ? 'badge-danger' : 'badge-success'}`}>
              {val ? 'Yes' : 'No'}
            </span>
          )},
          { key: 'actual_fraud', label: 'Actual Fraud', render: (val) => (
            val === null || val === undefined ? '-' : (
              <span className={`badge ${val === 1 ? 'badge-danger' : 'badge-success'}`}>
                {val === 1 ? 'Yes' : 'No'}
              </span>
            )
          )},
          { key: 'model_version', label: 'Model Version' },
          { key: 'model_name', label: 'Model Name' },
          { key: 'confidence', label: 'Confidence', render: (val) => val ? (val * 100).toFixed(2) + '%' : '-' },
          { key: 'prediction_time', label: 'Prediction Time', render: (val) => new Date(val).toLocaleString() },
          { key: 'prediction_latency_ms', label: 'Latency (ms)' },
          { key: 'amount', label: 'Amount', render: (val) => val ? `$${parseFloat(val).toFixed(2)}` : '-' },
          { key: 'transaction_time', label: 'Transaction Time', render: (val) => val || '-' },
          { key: 'alert_sent', label: 'Alert Sent', render: (val) => (
            <span className={`badge ${val ? 'badge-info' : 'badge-secondary'}`}>
              {val ? 'Yes' : 'No'}
            </span>
          )}
        ];

      default:
        return [];
    }
  };

  // Get tab info
  const getTabInfo = () => {
    switch (activeTab) {
      case 'training':
        return {
          icon: <Database size={20} />,
          title: 'Training Data',
          description: 'Historical data from training_transactions table used for model training',
          color: 'blue'
        };
      case 'transactions':
        return {
          icon: <Table size={20} />,
          title: 'Transactions Data',
          description: 'Real-time production transactions from the transactions table',
          color: 'green'
        };
      case 'predictions':
        return {
          icon: <BarChart3 size={20} />,
          title: 'Predictions Data',
          description: 'ML model predictions from the predictions table',
          color: 'purple'
        };
      default:
        return {};
    }
  };

  const tabInfo = getTabInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Interface</h1>
        <p className="text-gray-600 mt-1">
          View and export training data, transactions, and predictions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('training')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'training'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database size={18} />
              <span>Training Data</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Table size={18} />
              <span>Transactions</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('predictions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'predictions'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 size={18} />
              <span>Predictions</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Info Card */}
      <div className={`card bg-${tabInfo.color}-50 border-${tabInfo.color}-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${tabInfo.color}-100 rounded-lg text-${tabInfo.color}-600`}>
              {tabInfo.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{tabInfo.title}</h3>
              <p className="text-sm text-gray-600">{tabInfo.description}</p>
            </div>
          </div>
          <button
            onClick={() => fetchData(activeTab, 0)}
            disabled={loading}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <DataTable
          data={data}
          columns={getColumns()}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onDownload={downloadCSV}
          tableName={tabInfo.title}
        />
      </div>
    </div>
  );
};

export default DataInterface;
