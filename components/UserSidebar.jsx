'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  History, 
  User, 
  LogOut,
  X,
  BookMarked
} from 'lucide-react';

export default function UserSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: BookOpen },
    { href: '/collections', label: 'Loans History', icon: History },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const menuItemClass = (path) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      pathname.startsWith(path)
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
        : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
    }`;

  return (
    <>

      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-indigo-100">
              HP
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Hanni Pham</h3>
              <p className="text-sm text-gray-500">hanni@member.com</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={menuItemClass(href)}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{label}</span>
              {pathname.startsWith(href) && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition font-medium hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
}