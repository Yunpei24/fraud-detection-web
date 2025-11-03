import React from 'react';
import { formatDateTime, getDriftSeverityColor } from '../../utils/helpers';

const DriftReportsTable = ({ reports }) => {
  if (!reports || reports.length === 0) {
    return <p className="text-gray-500">No drift reports available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Drift Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Severity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Summary
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recommendations
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.map((report, index) => (
            <tr key={report.id || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(report.timestamp)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="font-mono text-gray-900">
                  {report.drift_type || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDriftSeverityColor(report.severity)}`}>
                  {report.severity}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="max-w-md truncate" title={report.summary}>
                  {report.summary || 'No summary available'}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <div className="max-w-md truncate" title={report.recommendations}>
                  {report.recommendations || 'No recommendations'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriftReportsTable;
