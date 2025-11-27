'use client';

import { useState } from 'react';
import UserSidebar from '@/components/UserSidebar';

export default function LayoutUser({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Area */}
      <div className="flex-1 lg:ml-80 flex flex-col">
        {/* Konten halaman langsung dari children */}
        {children}
      </div>

      {/* Floating button mobile */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-40 lg:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}