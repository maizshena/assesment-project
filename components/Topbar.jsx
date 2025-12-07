// components/Topbar.jsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { Search, Bell, Settings, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const isAdmin = session?.user?.role === 'admin';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-sm border-b border-gray-100">
      <div className="w-full px-4 lg:px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {isAdmin ? 'Admin Panel' : 'Library System'}
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back, {session?.user?.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-44"
            />
          </div>

          <button className="relative p-2 rounded-md hover:bg-gray-100 transition">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 text-xs text-white bg-rose-500 rounded-full">
              3
            </span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition"
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session?.user?.email}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                      isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {isAdmin ? 'Administrator' : 'Member'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      router.push(isAdmin ? '/profile' : '/profile');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <hr className="my-2 border-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}