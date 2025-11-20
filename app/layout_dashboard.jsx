// app/layout-dashboard.jsx
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Konten utama */}
      <div className="flex-1 overflow-x-hidden">
        <div className="p-6 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}