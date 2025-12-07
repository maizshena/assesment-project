'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  Heart, 
  TrendingUp,
  Calendar,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, loansRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/loans'),
      ]);

      const statsData = await statsRes.json();
      const loansData = await loansRes.json();

      setStats(statsData);
      setRecentLoans(loansData.loans?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'approved':
        return { label: 'Borrowed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
      case 'pending':
        return { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'returned':
        return { label: 'Returned', color: 'bg-sky-100 text-sky-700', icon: CheckCircle };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-rose-100 text-rose-700', icon: XCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 pr-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {session?.user?.name}!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Loans</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.activeLoans || 0}</p>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Currently borrowed
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Loans</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalLoans || 0}</p>
              <p className="text-xs text-sky-600 mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                All time
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Wishlist</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.wishlistCount || 0}</p>
              <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Books saved
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Fines</p>
              <p className="text-3xl font-bold text-gray-900">Rp {stats?.totalFines?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {stats?.totalFines > 0 ? 'Please pay soon' : 'No fines'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/books"
          className="group rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-xl font-bold mb-2">Browse Books</h3>
          <p className="text-sm text-white/80">Discover and borrow books from our collection</p>
        </Link>

        <Link
          href="/loans"
          className="group rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-6 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-xl font-bold mb-2">My Loans</h3>
          <p className="text-sm text-white/80">Track your borrowed books and due dates</p>
        </Link>

        <Link
          href="/wishlist"
          className="group rounded-2xl bg-gradient-to-br from-rose-500 to-rose-500 p-6 text-white hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition">
              <Heart className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-xl font-bold mb-2">Wishlist</h3>
          <p className="text-sm text-white/80">Books you want to read later</p>
        </Link>
      </section>

      {/* Recent Loans */}
      <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Loans</h3>
            <p className="text-sm text-gray-500 mt-1">Your latest borrowing activity</p>
          </div>
          {recentLoans.length > 0 && (
            <Link href="/loans" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {recentLoans.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-2">No loans yet</p>
            <p className="text-sm text-gray-400 mb-4">Start browsing books to make your first loan</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <BookOpen className="w-4 h-4" />
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3">Book</th>
                  <th className="px-6 py-3">Loan Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLoans.map((loan) => {
                  const statusInfo = getStatusInfo(loan.status);
                  const StatusIcon = statusInfo.icon;
                  const isOverdue = new Date(loan.due_date) < new Date() && loan.status === 'approved';

                  return (
                    <tr key={loan.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {loan.cover_image ? (
                            <img
                              src={loan.cover_image}
                              alt={loan.title}
                              className="w-10 h-14 object-cover rounded border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{loan.title}</p>
                            <p className="text-sm text-gray-500">{loan.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(loan.loan_date).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-gray-600'}>
                          {new Date(loan.due_date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                          {isOverdue && (
                            <span className="block text-xs flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" /> Overdue!
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="pt-60 text-sm text-gray-400 py-6">
        © {new Date().getFullYear()} Puskata — Your Library Dashboard
      </footer>
    </div>
  );
}