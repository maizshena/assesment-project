// app/admin/loan-history/page.jsx
import DashboardLayout from '@/app/layout_dashboard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoanHistory() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link href="/admin" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Loan History</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Loan ID</th>
                <th className="text-left p-4 font-medium text-gray-700">Book</th>
                <th className="text-center p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Borrow Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Due Date</th>
                <th className="text-right p-4 font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(15)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-600">250190032</td>
                  <td className="p-4 font-medium">Parrot and Olivier in America</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Borrowed
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">Dec 12, 2025</td>
                  <td className="p-4 text-gray-600">Dec 19, 2025</td>
                  <td className="text-right p-4">
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      Return
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