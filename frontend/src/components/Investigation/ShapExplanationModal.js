import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Brain } from 'lucide-react';
import { explainAPI } from '../../services/api';

const ShapExplanationModal = ({ isOpen, onClose, transaction }) => {
  const [shapData, setShapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('ensemble');

  // Helper function to extract 30 features from transaction
  const extractFeatures = (transaction) => {
    // If transaction already has features array, use it
    if (Array.isArray(transaction.features) && transaction.features.length === 30) {
      return transaction.features;
    }

    // Otherwise, construct from transaction fields
    // Format: [Time, V1-V28, Amount]
    const features = [];
    
    // Time (index 0)
    features.push(parseFloat(transaction.time || 0));
    
    // V1-V28 (indices 1-28)
    for (let i = 1; i <= 28; i++) {
      const key = `v${i}`;
      features.push(parseFloat(transaction[key] || 0));
    }
    
    // Amount (index 29)
    features.push(parseFloat(transaction.amount || 0));
    
    return features;
  };

  // Fetch SHAP explanation
  const fetchShapExplanation = async () => {
    if (!transaction) return;

    try {
      setLoading(true);
      setError(null);

      // Extract features from transaction as array of 30 floats
      // Format: [Time, V1, V2, ..., V28, Amount]
      const features = extractFeatures(transaction);

      if (!features || features.length !== 30) {
        throw new Error('Transaction must have exactly 30 features');
      }

      console.log('Requesting SHAP explanation for transaction:', transaction.transaction_id);
      console.log('Using model:', selectedModel);

      const response = await explainAPI.getShapExplanation({
        transaction_id: transaction.transaction_id,
        features: features,
        model_type: selectedModel,
      });

      setShapData(response.data);
      console.log('SHAP explanation received:', response.data);
    } catch (err) {
      console.error('Error fetching SHAP explanation:', err);
      setError(err.response?.data?.error || err.message || 'Failed to get SHAP explanation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && transaction) {
      fetchShapExplanation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, transaction, selectedModel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">SHAP Explanation</h2>
              <p className="text-sm text-gray-600">
                Transaction ID: {transaction?.transaction_id || transaction?.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Model Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Type
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ensemble">Ensemble (All Models)</option>
              <option value="xgboost">XGBoost</option>
              <option value="neural_network">Neural Network</option>
              <option value="isolation_forest">Isolation Forest</option>
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="spinner mb-4"></div>
              <p className="text-gray-600">Generating SHAP explanation...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchShapExplanation}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* SHAP Data Display */}
          {!loading && !error && shapData && (
            <div className="space-y-6">
              {/* Prediction Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium mb-1">Fraud Score</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {(shapData.prediction_score * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium mb-1">Base Value</div>
                  <div className="text-2xl font-bold text-green-900">
                    {(shapData.base_value * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium mb-1">Model</div>
                  <div className="text-lg font-bold text-purple-900 capitalize">
                    {shapData.model_type || selectedModel}
                  </div>
                </div>
              </div>

              {/* Feature Contributions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="mr-2 text-blue-600" size={20} />
                  Feature Contributions
                </h3>
                
                {shapData.shap_values && shapData.feature_names ? (
                  <div className="space-y-3">
                    {shapData.feature_names.map((feature, index) => {
                      const shapValue = shapData.shap_values[index];
                      const featureValue = shapData.feature_values?.[index];
                      const isPositive = shapValue > 0;
                      const absValue = Math.abs(shapValue);
                      const maxAbs = Math.max(...shapData.shap_values.map(Math.abs));
                      const barWidth = (absValue / maxAbs) * 100;

                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {isPositive ? (
                                <TrendingUp className="text-red-500" size={16} />
                              ) : (
                                <TrendingDown className="text-green-500" size={16} />
                              )}
                              <span className="font-medium text-gray-900">{feature}</span>
                              {featureValue !== undefined && (
                                <span className="text-sm text-gray-500">
                                  = {typeof featureValue === 'number' ? featureValue.toFixed(2) : featureValue}
                                </span>
                              )}
                            </div>
                            <span className={`font-semibold ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                              {isPositive ? '+' : ''}{shapValue.toFixed(4)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isPositive ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No feature contributions available</p>
                )}
              </div>

              {/* Explanation Summary */}
              {shapData.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <CheckCircle className="mr-2" size={18} />
                    Explanation Summary
                  </h4>
                  <p className="text-sm text-blue-800">{shapData.explanation}</p>
                </div>
              )}

              {/* Processing Info */}
              {shapData.processing_time && (
                <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
                  Generated in {shapData.processing_time.toFixed(2)}s
                  {shapData.timestamp && (
                    <> • {new Date(shapData.timestamp * 1000).toLocaleString()}</>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
          {shapData && (
            <button
              onClick={fetchShapExplanation}
              className="btn btn-primary flex items-center"
            >
              <Brain size={16} className="mr-2" />
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShapExplanationModal;
