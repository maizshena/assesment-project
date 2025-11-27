// app/LayoutAdmin
'use client';

import { useState } from 'react';
import Sidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children, adminStats }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        adminStats={adminStats}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0 lg:ml-80'} flex flex-col`}>
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 lg:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}