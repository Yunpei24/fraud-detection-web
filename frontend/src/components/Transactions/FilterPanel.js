import React from 'react';

const FilterPanel = ({ filters, onFilterChange, onApply }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer ID
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer ID"
            value={filters.customer_id}
            onChange={(e) => onFilterChange('customer_id', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fraud Status
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.is_fraud}
            onChange={(e) => onFilterChange('is_fraud', e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Fraud Only</option>
            <option value="false">Legitimate Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Results Limit
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.limit}
            onChange={(e) => onFilterChange('limit', parseInt(e.target.value))}
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onApply}
          className="btn btn-primary"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
