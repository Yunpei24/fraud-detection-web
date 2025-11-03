import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, Server, TrendingUp, Package } from 'lucide-react';
import { modelsAPI } from '../../services/api';

const ModelStatusCard = () => {
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeploymentStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDeploymentStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDeploymentStatus = async () => {
    try {
      setLoading(true);
      const response = await modelsAPI.getStatus();
      setDeploymentStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching deployment status:', err);
      setError(err.response?.data?.detail || 'Failed to load model status');
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (loading && !deploymentStatus) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card border-red-200">
        <div className="flex items-center space-x-3">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Model Status Error</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!deploymentStatus) {
    return null;
  }

  const {
    deployment_mode,
    canary_percentage,
    champion_models = [],
    challenger_models = [],
    last_update,
  } = deploymentStatus;

  const isCanaryActive = deployment_mode === 'canary_active';
  const productionPercentage = 100 - (canary_percentage || 0);

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Server className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Production Models</h3>
            <p className="text-sm text-gray-500">
              {isCanaryActive ? '🔄 Canary Deployment Active' : '✅ Stable Production'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isCanaryActive 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {deployment_mode === 'canary_active' ? 'CANARY' : 'PRODUCTION'}
        </div>
      </div>

      {/* Traffic Split Info */}
      {isCanaryActive && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-yellow-600" size={16} />
            <span className="text-sm font-medium text-yellow-900">Traffic Split</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Production</span>
                <span className="font-semibold">{productionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${productionPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Canary</span>
                <span className="font-semibold">{canary_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${canary_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Champion Models (Production) */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="text-green-600" size={16} />
          <h4 className="text-sm font-semibold text-gray-900">
            Champion Models {!isCanaryActive && '(100%)'}
          </h4>
        </div>
        {champion_models.length > 0 ? (
          <div className="space-y-2">
            {champion_models.map((modelUri, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
              >
                <div className="flex items-center space-x-2">
                  <Package className="text-green-600" size={14} />
                  <span className="text-sm font-mono text-gray-700">
                    {modelUri.replace('models:/', '')}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No champion models configured</p>
        )}
      </div>

      {/* Challenger Models (Canary) */}
      {isCanaryActive && challenger_models.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="text-yellow-600" size={16} />
            <h4 className="text-sm font-semibold text-gray-900">
              Challenger Models ({canary_percentage}%)
            </h4>
          </div>
          <div className="space-y-2">
            {challenger_models.map((modelUri, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded"
              >
                <div className="flex items-center space-x-2">
                  <Package className="text-yellow-600" size={14} />
                  <span className="text-sm font-mono text-gray-700">
                    {modelUri.replace('models:/', '')}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                  Testing
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      {last_update && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(last_update).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModelStatusCard;
