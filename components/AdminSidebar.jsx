'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  History, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  Shield,
  Activity
} from 'lucide-react';

export default function Sidebar({ adminStats }) {
  const pathname = usePathname();

  const stats = adminStats || {
    activeLoans: 0,
    totalUsers: 0,
    totalBooks: 0
  };

  const navItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    { 
      href: '/users', 
      label: 'User Management', 
      icon: Users,
      description: 'Manage members'
    },
    { 
      href: '/loan_history', 
      label: 'Loan History', 
      icon: History,
      description: 'Track borrowing'
    },
    { 
      href: '/books', 
      label: 'Collections', 
      icon: BookOpen,
      description: 'Manage books'
    },
  ];

  const menuItemClass = (path) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${
      pathname.startsWith(path)
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
        : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-80 bg-white shadow-2xl flex flex-col z-50">

      {/* Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-blue-100">
            A1
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Admin 01</h3>
            <p className="text-sm text-gray-500">admin@gmail.com</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Super Admin
            </span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 rounded-lg p-2.5 text-center">
            <Activity className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{stats.activeLoans}</p>
            <p className="text-xs text-gray-600">Active</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
            <Users className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-indigo-600">{stats.totalUsers}</p>
            <p className="text-xs text-gray-600">Users</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2.5 text-center">
            <BookOpen className="w-4 h-4 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-600">{stats.totalBooks}</p>
            <p className="text-xs text-gray-600">Books</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className={menuItemClass(href)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="font-medium">{label}</div>
              <div className={`text-xs mt-0.5 ${
                pathname.startsWith(href) 
                  ? 'text-blue-100' 
                  : 'text-gray-500 group-hover:text-gray-600'
              }`}>
                {description}
              </div>
            </div>
            {pathname.startsWith(href) && (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link 
          href="/settings" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition font-medium hover:scale-105"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>

        <button 
          onClick={() => {
            if (confirm('Are you sure you want to logout?')) {
              window.location.href = '/';
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition font-medium hover:scale-105"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
