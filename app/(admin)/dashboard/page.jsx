// app/(admin)/dashboard/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, BookMarked, FolderOpen, Users, FileText, Clock, Check, XCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/dashboard'); // non-admin redirect
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, loansRes, pendingRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/loans'),
        fetch('/api/loans?status=pending'),
      ]);

      const statsData = await statsRes.json();
      const loansData = await loansRes.json();
      const pendingData = await pendingRes.json();

      setStats(statsData);
      setRecentLoans(loansData.loans?.slice(0, 6) || []);
      setPendingLoans(pendingData.loans || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId) => {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        // small UI feedback then refresh
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleReject = async (loanId) => {
    if (!confirm('Tolak peminjaman ini?')) return;

    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-lg text-gray-600">Memuat dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 pr-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas dan pengelolaan perpustakaan.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/(admin)/collections" className="inline-flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg shadow-sm hover:shadow-md">
            <BookMarked className="w-4 h-4 text-white" /> Books Collection Management
          </Link>
          <Link href="/(admin)/loan_management" className="inline-flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg shadow-l hover:shadow-md">
            <FolderOpen className="w-4 h-4 text-white" /> Loans Management
          </Link>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Buku" value={stats?.totalBooks ?? 0} />
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard icon={FileText} label="Peminjaman Aktif" value={stats?.activeLoans ?? 0} />
        <StatCard icon={Clock} label="Pending Approval" value={stats?.pendingLoans ?? 0} />
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickCard href="/collections" title="Manage Books" desc="Tambah, edit, dan hapus buku" />
        <QuickCard href="/loan_management" title="Manage Loans" desc="Approve & manage peminjaman" />
        <div className="rounded-2xl p-5 bg-white/60 border border-dashed border-gray-200 text-gray-500 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Reports (coming soon)</h3>
            <p className="text-sm text-gray-400 mt-1">Analytics akan tersedia nanti</p>
          </div>
        </div>
      </section>

      {/* Pending Approvals & Recent Loans */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
            <p className="text-sm text-gray-500 mt-1">{pendingLoans.length} peminjaman menunggu approval</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Buku</th>
                  <th className="px-6 py-3">Tanggal Pinjam</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pendingLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="3"/></svg>
                        </div>
                        <div className="font-medium text-gray-800">{loan.user_name}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">{loan.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(loan.loan_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(loan.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(loan.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingLoans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Tidak ada peminjaman pending.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Loans</h3>
            <p className="text-sm text-gray-500 mt-1">Latest borrowing activities</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Buku</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="3"/></svg>
                        </div>
                        <div className="font-medium text-gray-800">{loan.user_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{loan.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(loan.loan_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={loan.status} />
                    </td>
                  </tr>
                ))}
                {recentLoans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada peminjaman.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="pt-60 text-sm text-gray-400 py-6">© {new Date().getFullYear()} Puskata — Admin Panel</footer>
    </div>
  );
}

/* small helper components */
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        </div>
        <div className="text-xs text-gray-400">+2.4%</div>
      </div>
    </div>
  );
}

function QuickCard({ href, title, desc }) {
  return (
    <Link href={href} className="block rounded-2xl p-5 bg-white/70 border border-gray-100 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18" /></svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function StatusPill({ status }) {
  const map = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    returned: 'bg-sky-100 text-sky-700',
  };
  const cls = map[status] ?? 'bg-rose-100 text-rose-700';
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{(status || '').toString().charAt(0).toUpperCase() + (status || '').toString().slice(1)}</span>;
}
