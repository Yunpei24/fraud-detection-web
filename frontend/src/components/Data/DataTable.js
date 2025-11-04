import React from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ 
  data, 
  columns, 
  loading, 
  error,
  pagination,
  onPageChange,
  onDownload,
  tableName
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading {tableName}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800 font-semibold">Error loading data</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  const { total, limit, offset, has_more } = pagination;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Header with download button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Showing {offset + 1} - {Math.min(offset + limit, total)} of {total} records
          </p>
        </div>
        <button
          onClick={onDownload}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <Download size={16} />
          <span>Download CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] !== null && row[column.key] !== undefined
                      ? String(row[column.key])
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="btn btn-secondary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <button
            onClick={() => onPageChange(offset + limit)}
            disabled={!has_more}
            className="btn btn-secondary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
