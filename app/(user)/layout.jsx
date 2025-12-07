'use client';

import { useState } from 'react';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';



export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-[250px]' : 'ml-[70px]'
        }`}
      >
        <Topbar sidebarOpen={sidebarOpen} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}