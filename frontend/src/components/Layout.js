import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Database,
  Menu,
  X,
  User,
  LogOut,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: CreditCard },
    { name: 'Drift Monitoring', path: '/drift', icon: TrendingUp },
    { name: 'Investigation', path: '/investigation', icon: AlertTriangle },
    { name: 'Data Interface', path: '/data', icon: Database },
  ];

  // Add Admin link only for admin users
  const adminNavigation = user?.role === 'admin' 
    ? [{ name: 'User Management', path: '/admin/users', icon: Users }]
    : [];

  // Role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'analyst':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">Fraud Detection</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 space-y-2 px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </NavLink>
          ))}

          {/* Admin Section - Only visible to admins */}
          {adminNavigation.length > 0 && (
            <>
              {sidebarOpen && (
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </p>
                </div>
              )}
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={20} />
                  {sidebarOpen && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            {/* User Profile Section */}
            <div className="relative mb-3">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.username || 'User'}
                  </p>
                  <p className={`text-xs px-2 py-0.5 rounded border inline-block ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role || 'user'}
                  </p>
                </div>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email || user?.username}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="text-xs text-gray-400">
              <div className="flex items-center justify-between mb-1">
                <span>Status:</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="text-gray-500">v1.0.0</div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div 
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Fraud Detection System
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Real-time monitoring and analytics
              </p>
            </div>
            
            {/* User info in header for mobile/collapsed sidebar */}
            {!sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.username}
                  </p>
                  <p className={`text-xs px-2 py-0.5 rounded border inline-block ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
