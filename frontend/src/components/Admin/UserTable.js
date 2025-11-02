import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  Key,
  Shield,
  UserCheck,
  Users,
  MoreVertical,
  CheckCircle
} from 'lucide-react';

const UserTable = ({
  users,
  loading,
  currentUser,
  onEdit,
  onView,
  onDelete,
  onToggleActive,
  onChangeRole,
  onResetPassword
}) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const toggleActionMenu = (userId) => {
    setActionMenuOpen(actionMenuOpen === userId ? null : userId);
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700 border-red-300',
      analyst: 'bg-blue-100 text-blue-700 border-blue-300',
      viewer: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[role] || colors.viewer;
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <Shield className="w-3 h-3" />,
      analyst: <UserCheck className="w-3 h-3" />,
      viewer: <Eye className="w-3 h-3" />
    };
    return icons[role] || icons.viewer;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => {
            const isCurrentUser = user.username === currentUser?.username;
            
            return (
              <tr key={user.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                {/* User */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.first_name?.[0] || user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {user.username}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-600 font-semibold">(You)</span>
                        )}
                      </div>
                      {(user.first_name || user.last_name) && (
                        <div className="text-sm text-gray-500">
                          {user.first_name} {user.last_name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  {user.is_verified && (
                    <div className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </div>
                  )}
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="capitalize">{user.role}</span>
                  </span>
                </td>

                {/* Department */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.department || '-'}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></div>
                      Inactive
                    </span>
                  )}
                </td>

                {/* Last Login */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* View */}
                    <button
                      onClick={() => onView(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(user)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Edit User"
                    >
                      <Edit size={18} />
                    </button>

                    {/* More Actions */}
                    <div className="relative">
                      <button
                        onClick={() => toggleActionMenu(user.id)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="More Actions"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {actionMenuOpen === user.id && (
                        <>
                          {/* Backdrop to close menu */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuOpen(null)}
                          ></div>

                          {/* Menu */}
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            {/* Toggle Active */}
                            <button
                              onClick={() => {
                                onToggleActive(user.id, user.is_active);
                                setActionMenuOpen(null);
                              }}
                              disabled={isCurrentUser}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {user.is_active ? (
                                <>
                                  <PowerOff size={16} className="mr-3" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power size={16} className="mr-3" />
                                  Activate
                                </>
                              )}
                            </button>

                            {/* Change Role */}
                            <div className="border-t border-gray-100">
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                                Change Role
                              </div>
                              {['admin', 'analyst', 'viewer'].map((role) => (
                                <button
                                  key={role}
                                  onClick={() => {
                                    onChangeRole(user.id, role);
                                    setActionMenuOpen(null);
                                  }}
                                  disabled={user.role === role || isCurrentUser}
                                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {getRoleIcon(role)}
                                  <span className="ml-3 capitalize">{role}</span>
                                  {user.role === role && (
                                    <CheckCircle size={14} className="ml-auto text-green-600" />
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Reset Password */}
                            <div className="border-t border-gray-100">
                              <button
                                onClick={() => {
                                  onResetPassword(user.id);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                              >
                                <Key size={16} className="mr-3" />
                                Reset Password
                              </button>
                            </div>

                            {/* Delete */}
                            <div className="border-t border-gray-100">
                              <button
                                onClick={() => {
                                  onDelete(user.id, user.username);
                                  setActionMenuOpen(null);
                                }}
                                disabled={isCurrentUser}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-b-lg"
                              >
                                <Trash2 size={16} className="mr-3" />
                                Delete User
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
