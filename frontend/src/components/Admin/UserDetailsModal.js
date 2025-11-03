import React from 'react';
import { X, Edit, Shield, UserCheck, Eye, CheckCircle, XCircle, Mail, User, Calendar, Building } from 'lucide-react';

const UserDetailsModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'analyst':
        return <UserCheck className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'analyst':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFullName = () => {
    const parts = [];
    if (user.first_name) parts.push(user.first_name);
    if (user.last_name) parts.push(user.last_name);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Avatar & Name */}
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{user.username}</h3>
                <p className="text-gray-600">{getFullName()}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    <span className="capitalize">{user.role}</span>
                  </span>
                  {user.is_active ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      <XCircle className="w-3 h-3" />
                      <span>Inactive</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-gray-800 font-medium">{user.email}</p>
                {user.is_verified && (
                  <span className="inline-flex items-center space-x-1 text-xs text-green-600 mt-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              {/* Department */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Building className="w-4 h-4" />
                  <span className="text-sm font-medium">Department</span>
                </div>
                <p className="text-gray-800 font-medium">{user.department || 'N/A'}</p>
              </div>

              {/* User ID */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">User ID</span>
                </div>
                <p className="text-gray-800 font-mono text-sm">{user.id}</p>
              </div>

              {/* Last Login */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Last Login</span>
                </div>
                <p className="text-gray-800 text-sm">{formatDate(user.last_login)}</p>
              </div>

              {/* Created At */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Created At</span>
                </div>
                <p className="text-gray-800 text-sm">{formatDate(user.created_at)}</p>
              </div>

              {/* Updated At */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Updated At</span>
                </div>
                <p className="text-gray-800 text-sm">{formatDate(user.updated_at)}</p>
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Account Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Active:</span>
                  <span className="font-medium text-blue-900">
                    {user.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Email Verified:</span>
                  <span className="font-medium text-blue-900">
                    {user.is_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Role:</span>
                  <span className="font-medium text-blue-900 capitalize">{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Edit size={18} />
              <span>Edit User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
