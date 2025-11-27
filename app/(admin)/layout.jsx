// app/(admin)/layout.jsx
import Sidebar from '@/components/AdminSidebar';
import { getAdminStats } from '@/lib/adminStats';

export default async function AdminRootLayout({ children }) {
  const adminStats = await getAdminStats();
  
  console.log('📊 Admin Stats:', adminStats);
  
  // ❌ JANGAN ADA <html><body> di sini!
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed di kiri */}
      <Sidebar adminStats={adminStats} />
      
      {/* Main Content Area - INI YANG PENTING */}
      <div className="flex-1 lg:ml-80">
        {children}
      </div>
    </div>
  );
}