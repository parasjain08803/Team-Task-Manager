import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  LogOut,
  User,
  Users,
  Menu,
  X,
  Shield,
  Crown
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  ];

  const adminMenuItems = [
    { path: '/admin/users', label: 'User Management', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className={`fixed inset-0 z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-gray-600 transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`}
             onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex flex-col bg-white w-64 h-full transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md mb-1 transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {}
            {user?.role === 'admin' && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Admin</p>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md mb-1 transition-colors ${
                        isActive(item.path)
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-purple-700 hover:bg-purple-100'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r">
          <div className="flex items-center p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
          </div>
          <nav className="flex-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md mb-1 transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {}
            {user?.role === 'admin' && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Admin</p>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md mb-1 transition-colors ${
                        isActive(item.path)
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="md:pl-64">
        {}
        <div className={`sticky top-0 z-20 border-b ${
          user?.role === 'admin'
            ? 'bg-purple-50 border-purple-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="px-4 py-2 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {user?.role === 'admin' ? (
                  <>
                    <Crown className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">
                      Admin Perspective
                    </span>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                      Full Access
                    </span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      User Perspective
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Limited Access
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-10 bg-white border-b md:hidden">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Task Manager</h1>
            <div className="w-8"></div>
          </div>
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
