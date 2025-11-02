import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const FeedbackForm = ({ transaction, onSubmit, onCancel }) => {
  const [feedback, setFeedback] = useState({
    confirmed_label: null, // true = fraud, false = legitimate
    analyst_id: 1, // TODO: Get from auth context
    feedback_notes: '',
    confidence: 0.8,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.confirmed_label === null) {
      alert('Please confirm if this is fraud or legitimate');
      return;
    }
    onSubmit(feedback);
  };

  return (
    <div className="card sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Analyst Feedback
      </h3>

      {/* Transaction Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Model Score:</span>
            <span className="font-semibold">
              {(transaction.fraud_score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Prediction:</span>
            <span className={`font-semibold ${
              transaction.is_fraud_predicted ? 'text-red-600' : 'text-green-600'
            }`}>
              {transaction.is_fraud_predicted ? 'FRAUD' : 'LEGITIMATE'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Decision Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Assessment *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFeedback({ ...feedback, confirmed_label: true })}
              className={`p-4 rounded-lg border-2 transition-all ${
                feedback.confirmed_label === true
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-red-300'
              }`}
            >
              <XCircle className={`mx-auto mb-2 ${
                feedback.confirmed_label === true ? 'text-red-600' : 'text-gray-400'
              }`} size={32} />
              <span className={`text-sm font-medium ${
                feedback.confirmed_label === true ? 'text-red-600' : 'text-gray-600'
              }`}>
                Confirm Fraud
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFeedback({ ...feedback, confirmed_label: false })}
              className={`p-4 rounded-lg border-2 transition-all ${
                feedback.confirmed_label === false
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-300'
              }`}
            >
              <CheckCircle className={`mx-auto mb-2 ${
                feedback.confirmed_label === false ? 'text-green-600' : 'text-gray-400'
              }`} size={32} />
              <span className={`text-sm font-medium ${
                feedback.confirmed_label === false ? 'text-green-600' : 'text-gray-600'
              }`}>
                Legitimate
              </span>
            </button>
          </div>
        </div>

        {/* Confidence Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Level: {(feedback.confidence * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={feedback.confidence}
            onChange={(e) => setFeedback({ ...feedback, confidence: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investigation Notes
          </label>
          <textarea
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any relevant notes or observations..."
            value={feedback.feedback_notes}
            onChange={(e) => setFeedback({ ...feedback, feedback_notes: e.target.value })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 btn btn-primary"
          >
            Submit Feedback
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
