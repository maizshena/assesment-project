// app/admin/page.jsx
import DashboardLayout from '@/app/layout_dashboard';
import Link from 'next/link';
import { ArrowRight, Search, Bell, User } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search a book"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-zin-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 ml-6">
          <button className="relative p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-2xl shadow-sm p-12 mb-8 border border-gray-200">
        <p className="text-center text-gray-500 text-lg">
          akan ada chart statis dari apexcharts
        </p>
      </div>

      {/* Quick Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Quick Overview</h2>
          <Link 
            href="/admin/loan_history"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 font-medium transition"
          >
            View All
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Loan ID</th>
                <th className="text-left p-4 font-medium text-gray-700">Book</th>
                <th className="text-center p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Cover</th>
                <th className="text-left p-4 font-medium text-gray-700">Kategori</th>
                <th className="text-left p-4 font-medium text-gray-700">Latest Date</th>
                <th className="text-right p-4 font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-600">250190032</td>
                  <td className="p-4 font-medium">Parrot and Olivier in America</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Borrowed
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">Dec 12, 2025</td>
                  <td className="text-right p-4">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

// export default function DashboardAdmin() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-6">
//       <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
//         <h1 className="text-5xl font-bold text-purple-800 mb-4">
//           Halo Admin! 
//         </h1>
//         <p className="text-xl text-gray-700">Kamu bisa kelola buku & peminjaman</p>
//         <div className="mt-8">
//           <a href="/" className="text-purple-600 underline">Logout</a>
//         </div>
//       </div>
//     </div>
//   );
// }