'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Check, X, Clock, BookOpen, User, Calendar, 
  AlertCircle, DollarSign, Search, Grid3x3, List,
  CheckCircle, XCircle, RotateCcw, Filter
} from 'lucide-react';

export default function AdminLoansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returnDate, setReturnDate] = useState('');
  const [fine, setFine] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/home');
      } else {
        fetchLoans();
      }
    }
  }, [status, session, filter, router]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchLoans = async () => {
    try {
      const params = new URLSearchParams();
      params.append('isAdmin', 'true');
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/loans?${params}`);
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      showToast('Failed to fetch loans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateFine = (dueDate, returnDate) => {
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    const daysLate = Math.max(0, Math.floor((returned - due) / (1000 * 60 * 60 * 24)));
    return daysLate * 5000;
  };

  const handleApprove = async (loanId) => {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Loan approved successfully!', 'success');
        fetchLoans();
      } else {
        showToast(data.error || 'Failed to approve loan', 'error');
      }
    } catch (error) {
      showToast('An error occurred while approving loan', 'error');
    }
  };

  const openRejectModal = (loan) => {
    setSelectedLoan(loan);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/loans/${selectedLoan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          rejection_reason: rejectionReason 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Loan rejected successfully', 'success');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchLoans();
      } else {
        showToast(data.error || 'Failed to reject loan', 'error');
      }
    } catch (error) {
      showToast('An error occurred while rejecting loan', 'error');
    }
  };

  const openReturnModal = (loan) => {
    setSelectedLoan(loan);
    const today = new Date().toISOString().split('T')[0];
    setReturnDate(today);
    const calculatedFine = calculateFine(loan.due_date, today);
    setFine(calculatedFine);
    setShowReturnModal(true);
  };

  const handleReturn = async () => {
    try {
      const response = await fetch(`/api/loans/${selectedLoan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'returned',
          return_date: returnDate,
          fine: fine,
        }),
      });

      if (response.ok) {
        showToast('Book returned successfully!', 'success');
        setShowReturnModal(false);
        fetchLoans();
      } else {
        showToast('Failed to return book', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'returned': return 'bg-sky-100 text-sky-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'returned': return <RotateCcw className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-lg text-gray-600">Memuat data peminjaman...</div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6 pb-10 pr-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Loan Management</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola peminjaman dan approval request</p>
          </div>
        </div>

        {/* Search & Filters */}
        <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by borrower, book title, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid3x3 className="w-4 h-4" /> Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm p-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All Loans', icon: <BookOpen className="w-4 h-4" /> },
              { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
              { value: 'approved', label: 'Borrowed', icon: <CheckCircle className="w-4 h-4" /> },
              { value: 'returned', label: 'Returned', icon: <RotateCcw className="w-4 h-4" /> },
              { value: 'rejected', label: 'Rejected', icon: <XCircle className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm ${
                  filter === tab.value
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoans.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white/70 border border-gray-100 shadow-sm p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No loans found</p>
              </div>
            ) : (
              filteredLoans.map((loan) => {
                const isOverdue = new Date(loan.due_date) < new Date() && loan.status === 'approved';

                return (
                  <div key={loan.id} className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden">
                    <div className="p-4">
                      <div className="flex gap-3 mb-4">
                        {/* Book Cover */}
                        <div className="w-16 h-24 shrink-0 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                          {loan.cover_image ? (
                            <img src={loan.cover_image} alt={loan.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 mb-1">{loan.title}</h3>
                          <p className="text-xs text-gray-500 mb-2">by {loan.author}</p>
                          
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                            {getStatusIcon(loan.status)}
                            <span className="capitalize">{loan.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Borrower Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-gray-900 truncate">{loan.user_name}</p>
                            <p className="text-xs text-gray-500 truncate">{loan.user_email}</p>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <div>
                              <p className="text-gray-500">Loan</p>
                              <p className="font-medium">{new Date(loan.loan_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600' : 'text-gray-600'}`}>
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <div>
                              <p className={isOverdue ? 'text-rose-600 font-semibold' : 'text-gray-500'}>Due</p>
                              <p className={`font-medium ${isOverdue ? 'font-bold' : ''}`}>
                                {new Date(loan.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Fine */}
                        {loan.fine > 0 && (
                          <div className="flex items-center gap-1.5 text-xs bg-rose-50 text-rose-700 px-3 py-2 rounded-lg font-semibold">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Fine: Rp {loan.fine.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {loan.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(loan.id)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium transition"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(loan)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-600 text-white px-3 py-2 rounded-lg hover:bg-rose-700 text-sm font-medium transition"
                            >
                              <X className="w-4 h-4" />
                              Deny
                            </button>
                          </>
                        )}
                        {loan.status === 'approved' && (
                          <button
                            onClick={() => openReturnModal(loan)}
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-sky-600 text-white px-3 py-2 rounded-lg hover:bg-sky-700 text-sm font-medium transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Mark as Returned
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm overflow-hidden">
            {filteredLoans.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No loans found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3">Borrower</th>
                      <th className="px-6 py-3">Book</th>
                      <th className="px-6 py-3">Loan Date</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Fine</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLoans.map((loan) => {
                      const isOverdue = new Date(loan.due_date) < new Date() && loan.status === 'approved';

                      return (
                        <tr key={loan.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{loan.user_name}</div>
                                <div className="text-xs text-gray-500">{loan.user_email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {loan.cover_image ? (
                                <img src={loan.cover_image} alt={loan.title} className="w-10 h-14 object-cover rounded border border-gray-200" />
                              ) : (
                                <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{loan.title}</div>
                                <div className="text-xs text-gray-500">{loan.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(loan.loan_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-gray-600'}>
                              {new Date(loan.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {isOverdue && (
                                <div className="text-xs flex items-center gap-1 mt-0.5">
                                  <AlertCircle className="w-3 h-3" /> Overdue!
                                </div>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                              {getStatusIcon(loan.status)}
                              <span className="capitalize">{loan.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {loan.fine > 0 ? (
                              <span className="text-rose-600 font-semibold flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                Rp {loan.fine.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex gap-2">
                              {loan.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(loan.id)}
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-sm transition"
                                  >
                                    <Check className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openRejectModal(loan)}
                                    className="inline-flex items-center gap-1.5 bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 text-sm transition"
                                  >
                                    <X className="w-4 h-4" />
                                    Deny
                                  </button>
                                </>
                              )}
                              {loan.status === 'approved' && (
                                <button
                                  onClick={() => openReturnModal(loan)}
                                  className="inline-flex items-center gap-1.5 bg-sky-600 text-white px-3 py-1.5 rounded-lg hover:bg-sky-700 text-sm transition"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  Return
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <footer className="pt-60 text-sm text-gray-400 py-6">
          © {new Date().getFullYear()} Puskata — Loan Management
        </footer>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Deny Loan Request</h2>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Book</p>
                  <p className="font-semibold text-gray-900">{selectedLoan.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Borrower</p>
                  <p className="font-medium text-gray-900">{selectedLoan.user_name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows="4"
                  placeholder="Please provide a reason for rejecting this loan request..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:bg-gray-400 font-semibold transition shadow-sm hover:shadow-md"
                >
                  <X className="w-5 h-5" />
                  Confirm Denial
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-sky-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Return Book</h2>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Book</p>
                  <p className="font-semibold text-gray-900">{selectedLoan.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Borrower</p>
                  <p className="font-medium text-gray-900">{selectedLoan.user_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Due Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedLoan.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long ', year: 'numeric' })}</p></div></div>
                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => {
                setReturnDate(e.target.value);
                setFine(calculateFine(selectedLoan.due_date, e.target.value));
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fine (Auto-calculated)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={fine}
                onChange={(e) => setFine(parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Rp 5,000 per day late</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReturn}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 font-semibold transition shadow-sm hover:shadow-md"
            >
              <Check className="w-5 h-5" />
              Confirm Return
            </button>
            <button
              onClick={() => setShowReturnModal(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  <style jsx>{`
    @keyframes slide-down {
      from {
        transform: translate(-50%, -100%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
    .animate-slide-down {
      animation: slide-down 0.3s ease-out;
    }
  `}</style>
</>
);
}
