import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { fraudAPI, transactionAPI } from '../services/api';
import PendingReviewList from '../components/Investigation/PendingReviewList';
import FeedbackForm from '../components/Investigation/FeedbackForm';

const Investigation = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPendingTransactions = async () => {
    setLoading(true);
    try {
      // Get high-risk fraud alerts (fraud_score > 0.7)
      const response = await fraudAPI.getRecent(50);
      const highRisk = response.data.frauds.filter(
        f => f.fraud_score >= 0.7
      );
      setPendingTransactions(highRisk);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const handleSelectTransaction = async (transaction) => {
    try {
      const response = await transactionAPI.getById(transaction.transaction_id);
      setSelectedTransaction(response.data);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };

  const handleSubmitFeedback = async (feedback) => {
    try {
      await transactionAPI.submitFeedback(selectedTransaction.transaction_id, feedback);
      alert('Feedback submitted successfully!');
      setSelectedTransaction(null);
      fetchPendingTransactions();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investigation</h1>
        <p className="text-gray-600 mt-1">
          Review high-risk transactions and provide analyst feedback
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <AlertCircle className="text-orange-500 mr-3" size={32} />
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingTransactions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <CheckCircle className="text-green-500 mr-3" size={32} />
            <div>
              <p className="text-sm text-gray-600">Confirmed Fraud</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <XCircle className="text-blue-500 mr-3" size={32} />
            <div>
              <p className="text-sm text-gray-600">False Positives</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Transactions List */}
        <div className="lg:col-span-2">
          <PendingReviewList
            transactions={pendingTransactions}
            selectedTransaction={selectedTransaction}
            onSelectTransaction={handleSelectTransaction}
          />
        </div>

        {/* Feedback Form */}
        <div>
          {selectedTransaction ? (
            <FeedbackForm
              transaction={selectedTransaction}
              onSubmit={handleSubmitFeedback}
              onCancel={() => setSelectedTransaction(null)}
            />
          ) : (
            <div className="card text-center text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Select a transaction to investigate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investigation;
