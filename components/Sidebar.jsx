// components/Sidebar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Users, 
  Menu, 
  User,
  BookMarked,
  Heart
} from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isAdmin = session?.user?.role === 'admin';

  // Menu untuk Admin
  const adminMenu = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/collections', label: 'Collections', icon: BookOpen },
    { href: '/loan_management', label: 'Loan Management', icon: ClipboardList },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/profile', label: 'Profile', icon: User }
  ];

  // Menu untuk User
  const userMenu = [
    { href: '/home', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/books', label: 'Books', icon: BookOpen },
    { href: '/loans', label: 'My Loans', icon: BookMarked },
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/profile', label: 'Profile', icon: User }
  ];

  const menu = isAdmin ? adminMenu : userMenu;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50
        transition-all duration-300 overflow-hidden
        ${sidebarOpen ? 'w-[250px]' : 'w-[70px]'}
      `}
    >
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className={`
          absolute z-50
          ${sidebarOpen ? 'right-3 top-6' : 'left-1/2 -translate-x-1/2 top-6'}
          w-8 h-8 rounded-full bg-white border border-gray-200
          flex items-center justify-center 
          hover:bg-gray-100 transition
          cursor-pointer shadow-sm
        `}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Logo */}
      <div className="pt-6 px-4 mb-6">
        <h1
          className={`text-xl font-bold transition-all duration-200 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isAdmin ? 'Puskata Admin' : 'Puskata'}
        </h1>
      </div>

      {/* Menu */}
      <nav className="space-y-1 px-3">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
                ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon size={20} className="min-w-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div
        className={`
          absolute bottom-6 left-4 right-4 rounded-lg border border-gray-200 bg-gray-50 p-3
          transition-all duration-200
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <p className="text-xs text-gray-500">Logged in as</p>
        <p className="text-sm font-medium text-gray-800 truncate">
          {session?.user?.name || 'User'}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {session?.user?.role === 'admin' ? 'Administrator' : 'Member'}
        </p>
      </div>
    </aside>
  );
}