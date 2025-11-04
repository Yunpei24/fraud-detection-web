import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { explainAPI } from '../../services/api';

const TrainedModelsList = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableModels();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchAvailableModels, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableModels = async () => {
    try {
      setLoading(true);
      const response = await explainAPI.getAvailableModels();
      setModels(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching available models:', err);
      setError(err.response?.data?.detail || 'Failed to load trained models');
    } finally {
      setLoading(false);
    }
  };

  // Get model display name and icon color
  const getModelInfo = (modelType) => {
    const modelMap = {
      xgboost: {
        name: 'XGBoost',
        description: 'Gradient Boosting Model',
        color: 'blue',
        icon: '🌲',
      },
      neural_network: {
        name: 'Neural Network',
        description: 'Deep Learning Model',
        color: 'purple',
        icon: '🧠',
      },
      isolation_forest: {
        name: 'Isolation Forest',
        description: 'Anomaly Detection Model',
        color: 'green',
        icon: '🌳',
      },
      ensemble: {
        name: 'Ensemble',
        description: 'Combined Models',
        color: 'indigo',
        icon: '🎯',
      },
      random_forest: {
        name: 'Random Forest',
        description: 'Tree-based Ensemble',
        color: 'emerald',
        icon: '🌲',
      },
      logistic_regression: {
        name: 'Logistic Regression',
        description: 'Linear Classification',
        color: 'cyan',
        icon: '📊',
      },
    };

    return modelMap[modelType] || {
      name: modelType,
      description: 'Machine Learning Model',
      color: 'gray',
      icon: '🤖',
    };
  };

  // Color classes mapping
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-700',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700',
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      icon: 'text-cyan-600',
      badge: 'bg-cyan-100 text-cyan-700',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-700',
    },
  };

  // Loading skeleton
  if (loading && models.length === 0) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card border-red-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="text-red-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trained Models</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAvailableModels}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Retry"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Brain className="text-indigo-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trained Models</h3>
            <p className="text-sm text-gray-500">
              {models.length} {models.length === 1 ? 'model' : 'models'} available
            </p>
          </div>
        </div>
        <button
          onClick={fetchAvailableModels}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw
            size={20}
            className={`text-gray-600 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Models List */}
      {models.length > 0 ? (
        <div className="space-y-3">
          {models.map((modelType, index) => {
            const modelInfo = getModelInfo(modelType);
            const colors = colorClasses[modelInfo.color];

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 ${colors.bg} border ${colors.border} rounded-lg transition-all hover:shadow-md`}
              >
                <div className="flex items-center space-x-3">
                  {/* Model Icon */}
                  <div className="text-2xl">{modelInfo.icon}</div>
                  
                  {/* Model Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {modelInfo.name}
                    </h4>
                    <p className="text-xs text-gray-600">{modelInfo.description}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <CheckCircle className={colors.icon} size={16} />
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
                    Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Layers className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">No trained models available</p>
          <p className="text-sm text-gray-400 mt-1">
            Train models to see them here
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Models are used for predictions and explanations</span>
          <span className="flex items-center space-x-1">
            <CheckCircle size={12} className="text-green-500" />
            <span>Active</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrainedModelsList;
