/**
 * Format currency values
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Format date/time
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format time only
 */
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Get fraud risk level
 */
export const getFraudRiskLevel = (score) => {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  if (score >= 0.3) return 'low';
  return 'safe';
};

/**
 * Get risk color class
 */
export const getRiskColorClass = (level) => {
  const colors = {
    high: 'text-red-600 bg-red-50 border-red-500',
    medium: 'text-orange-600 bg-orange-50 border-orange-500',
    low: 'text-yellow-600 bg-yellow-50 border-yellow-500',
    safe: 'text-green-600 bg-green-50 border-green-500',
  };
  return colors[level] || colors.safe;
};

/**
 * Get badge color class
 */
export const getBadgeColor = (level) => {
  const colors = {
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
    safe: 'badge-safe',
  };
  return colors[level] || colors.safe;
};

/**
 * Truncate transaction ID
 */
export const truncateId = (id, length = 8) => {
  if (!id || id.length <= length) return id;
  return `${id.substring(0, length)}...`;
};

/**
 * Get severity color for drift
 */
export const getDriftSeverityColor = (severity) => {
  const colors = {
    CRITICAL: 'text-red-600 bg-red-100',
    HIGH: 'text-orange-600 bg-orange-100',
    MEDIUM: 'text-yellow-600 bg-yellow-100',
    LOW: 'text-blue-600 bg-blue-100',
    INFO: 'text-gray-600 bg-gray-100',
  };
  return colors[severity] || colors.INFO;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calculate time ago
 */
export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};
