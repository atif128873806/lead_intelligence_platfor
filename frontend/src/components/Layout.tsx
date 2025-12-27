import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  RocketLaunchIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Leads', href: '/leads', icon: UserGroupIcon },
    { name: 'Campaigns', href: '/campaigns', icon: RocketLaunchIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarOpen ? 256 : 80,
        }}
        className="fixed inset-y-0 left-0 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 z-50"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-white font-bold text-lg">Lead Intel</span>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? (
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <Bars3Icon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-3 font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-700 p-4">
            {sidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mx-auto" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div
        style={{
          marginLeft: sidebarOpen ? 256 : 80,
        }}
        className="transition-all duration-300"
      >
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
